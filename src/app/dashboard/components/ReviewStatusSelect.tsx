"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, Clock } from "lucide-react";
import { toast } from "sonner";

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
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleStatusChange = async (
    newStatus: "published" | "pending" | "draft",
  ) => {
    if (newStatus === currentStatus || isUpdating) return;

    setIsUpdating(true);
    setSelectedStatus(newStatus);
    setHasUnsavedChanges(true);

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update review status");
      }

      // Call the callback if provided
      onStatusChange?.(reviewId, newStatus);

      setHasUnsavedChanges(false);
      toast.success(`Review status updated to ${newStatus}`, {
        description: `Review #${reviewId} is now ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating review status:", error);
      setSelectedStatus(currentStatus); // Revert to original status
      setHasUnsavedChanges(false);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update review status",
        {
          description:
            "Please try again or contact support if the issue persists",
        },
      );
    } finally {
      setIsUpdating(false);
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
        disabled={disabled || isUpdating}
      >
        <SelectTrigger
          className={`w-36 ${hasUnsavedChanges ? "border-yellow-300 bg-yellow-50" : ""} ${isUpdating ? "opacity-75" : ""}`}
        >
          <SelectValue>
            <div className="flex items-center space-x-1">
              {getStatusIcon(selectedStatus, isUpdating)}
              <span className="capitalize">{selectedStatus}</span>
              {isUpdating && (
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
        className={`${getStatusColor(selectedStatus)} text-xs font-medium ${isUpdating ? "animate-pulse" : ""}`}
        variant="outline"
      >
        {selectedStatus}
        {hasUnsavedChanges && !isUpdating && " *"}
      </Badge>
    </div>
  );
}
