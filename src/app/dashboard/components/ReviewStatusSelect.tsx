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
import { Loader2, Check, X, Clock, CheckCircle2 } from "lucide-react";
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
  const [optimisticStatus, setOptimisticStatus] = useState(currentStatus);
  const [showSuccess, setShowSuccess] = useState(false);
  const updateStatusMutation = useUpdateReviewStatus();

  // Sync optimistic state with prop changes (only when not mutating)
  useEffect(() => {
    if (!updateStatusMutation.isPending) {
      setOptimisticStatus(currentStatus);
    }
  }, [currentStatus, updateStatusMutation.isPending]);

  const handleStatusChange = async (
    newStatus: "published" | "pending" | "draft",
  ) => {
    if (newStatus === currentStatus || updateStatusMutation.isPending) {
      return;
    }

    // Immediately update the optimistic state for instant UI feedback
    setOptimisticStatus(newStatus);

    try {
      await updateStatusMutation.mutateAsync({
        reviewId,
        status: newStatus,
      });

      // Show success feedback briefly
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      // Call the callback if provided (for any additional handling)
      onStatusChange?.(reviewId, newStatus);
    } catch {
      // Revert optimistic update on error
      setOptimisticStatus(currentStatus);
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
        value={optimisticStatus}
        onValueChange={handleStatusChange}
        disabled={disabled || updateStatusMutation.isPending}
      >
        <SelectTrigger
          className={`w-36 ${updateStatusMutation.isPending ? "opacity-75" : ""}`}
        >
          <SelectValue>
            <div className="flex items-center space-x-1">
              {showSuccess ? (
                <CheckCircle2 className="h-3 w-3 text-green-600" />
              ) : (
                getStatusIcon(optimisticStatus, updateStatusMutation.isPending)
              )}
              <span className="capitalize">{optimisticStatus}</span>
              {updateStatusMutation.isPending && (
                <span className="text-xs text-gray-500">(saving...)</span>
              )}
              {showSuccess && (
                <span className="text-xs text-green-600">✓ Saved</span>
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
        className={`${getStatusColor(optimisticStatus)} text-xs font-medium ${updateStatusMutation.isPending ? "animate-pulse" : ""} ${showSuccess ? "border-green-500 bg-green-50" : ""}`}
        variant="outline"
      >
        {optimisticStatus}
        {updateStatusMutation.isPending && " ..."}
        {showSuccess && " ✓"}
      </Badge>
    </div>
  );
}
