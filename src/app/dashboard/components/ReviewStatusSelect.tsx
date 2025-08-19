"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, Clock } from "lucide-react";
import { useUpdateReviewStatus } from "@/hooks/use-review-mutations";

interface ReviewStatusSelectProps {
  reviewId: number;
  currentStatus: "published" | "pending" | "draft";
  onStatusChange?: (
    reviewId: number,
    newStatus: "published" | "pending" | "draft",
  ) => void;
  disabled?: boolean;
}

export function ReviewStatusSelect({
  reviewId,
  currentStatus,
  onStatusChange,
  disabled = false,
}: ReviewStatusSelectProps) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const updateStatusMutation = useUpdateReviewStatus();

  // Sync local state with prop changes
  useEffect(() => {
    console.log("[ReviewStatusSelect] Props changed, syncing state:", {
      reviewId,
      currentStatus,
      selectedStatus,
      timestamp: new Date().toISOString(),
    });
    setSelectedStatus(currentStatus);
  }, [currentStatus, reviewId, selectedStatus]);

  const handleStatusChange = async (
    newStatus: "published" | "pending" | "draft",
  ) => {
    console.log("[ReviewStatusSelect] Status change initiated:", {
      reviewId,
      currentStatus,
      newStatus,
      isPending: updateStatusMutation.isPending,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });

    if (newStatus === currentStatus || updateStatusMutation.isPending) {
      console.log("[ReviewStatusSelect] Status change aborted:", {
        reason:
          newStatus === currentStatus ? "same status" : "mutation pending",
      });
      return;
    }

    // Optimistically update the UI
    setSelectedStatus(newStatus);
    console.log("[ReviewStatusSelect] Optimistic update applied:", newStatus);

    try {
      console.log("[ReviewStatusSelect] Starting mutation...");
      const result = await updateStatusMutation.mutateAsync({
        reviewId,
        status: newStatus,
      });

      console.log(
        "[ReviewStatusSelect] Mutation completed successfully:",
        result,
      );

      // Call the callback if provided (for any additional handling)
      onStatusChange?.(reviewId, newStatus);
      console.log("[ReviewStatusSelect] Callback triggered");
    } catch (error) {
      console.error("[ReviewStatusSelect] Mutation failed:", error);
      // Revert optimistic update on error
      setSelectedStatus(currentStatus);
      console.log(
        "[ReviewStatusSelect] Optimistic update reverted to:",
        currentStatus,
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string, isProcessing?: boolean) => {
    if (isProcessing) {
      return <Loader2 className="h-3 w-3 animate-spin" />;
    }

    switch (status) {
      case "published":
        return <Check className="h-3 w-3 text-green-600" />;
      case "pending":
        return <Clock className="h-3 w-3 text-yellow-600" />;
      case "draft":
        return <X className="h-3 w-3 text-gray-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Select
        value={selectedStatus}
        onValueChange={handleStatusChange}
        disabled={disabled || updateStatusMutation.isPending}
      >
        <SelectTrigger
          className={`w-36 ${updateStatusMutation.isPending ? "opacity-75" : ""}`}
        >
          <SelectValue>
            <div className="flex items-center space-x-1">
              {getStatusIcon(selectedStatus, updateStatusMutation.isPending)}
              <span className="capitalize">{selectedStatus}</span>
              {updateStatusMutation.isPending && (
                <span className="text-xs text-gray-500">(saving...)</span>
              )}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="published">
            <div className="flex items-center space-x-2">
              <Check className="h-3 w-3 text-green-600" />
              <span>Published</span>
            </div>
          </SelectItem>
          <SelectItem value="pending">
            <div className="flex items-center space-x-2">
              <Clock className="h-3 w-3 text-yellow-600" />
              <span>Pending</span>
            </div>
          </SelectItem>
          <SelectItem value="draft">
            <div className="flex items-center space-x-2">
              <X className="h-3 w-3 text-gray-600" />
              <span>Draft</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Status badge for quick visual reference */}
      <Badge
        className={`${getStatusColor(selectedStatus)} text-xs font-medium ${updateStatusMutation.isPending ? "animate-pulse" : ""}`}
        variant="outline"
      >
        {selectedStatus}
        {updateStatusMutation.isPending && " ..."}
      </Badge>
    </div>
  );
}
