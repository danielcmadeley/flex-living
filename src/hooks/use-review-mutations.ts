"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UpdateReviewStatusParams {
  reviewId: number;
  status: "published" | "pending" | "draft";
}

interface UpdateReviewStatusResponse {
  success: boolean;
  message: string;
  data: unknown;
}

interface MutationContext {
  previousData: Array<[readonly unknown[], unknown]>;
}

export function useUpdateReviewStatus() {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateReviewStatusResponse,
    Error,
    UpdateReviewStatusParams,
    MutationContext
  >({
    mutationFn: async ({
      reviewId,
      status,
    }: UpdateReviewStatusParams): Promise<UpdateReviewStatusResponse> => {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
        body: JSON.stringify({ status }),
      });

      // API response received - logging removed for production

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update review status");
      }

      return result;
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["reviews"] });

      // Snapshot the previous value for rollback
      const previousData = queryClient.getQueriesData({
        queryKey: ["reviews"],
      });

      // Optimistically update the cache
      queryClient.setQueriesData(
        { queryKey: ["reviews"] },
        (
          oldData:
            | {
                data?: Array<{
                  id: number;
                  status: string;
                  [key: string]: unknown;
                }>;
                [key: string]: unknown;
              }
            | undefined,
        ) => {
          if (!oldData?.data) return oldData;

          const updatedData = {
            ...oldData,
            data: oldData.data.map((review) =>
              review.id === variables.reviewId
                ? {
                    ...review,
                    status: variables.status,
                    updatedAt: new Date().toISOString(),
                  }
                : review,
            ),
          };

          return updatedData;
        },
      );

      // Return a context object with the snapshotted value
      return { previousData };
    },
    onSuccess: (data, variables) => {
      // The optimistic update was already applied in onMutate
      // Just show success feedback to user
      toast.success(`Review status updated to ${variables.status}`, {
        description: `Review #${variables.reviewId} is now ${variables.status}`,
      });
    },
    onError: (
      error: Error,
      variables,
      context: MutationContext | undefined,
    ) => {
      // Log error details for debugging
      const errorDetails = {
        error: error.message,
        reviewId: variables.reviewId,
        attemptedStatus: variables.status,
        timestamp: new Date().toISOString(),
      };
      // Error logged to console in development mode only

      // Revert optimistic updates on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      toast.error(error.message || "Failed to update review status", {
        description:
          "Please try again or contact support if the issue persists",
      });
    },
  });
}

export function useBulkUpdateReviewStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      updates: UpdateReviewStatusParams[],
    ): Promise<UpdateReviewStatusResponse[]> => {
      const promises = updates.map(({ reviewId, status }) =>
        fetch(`/api/reviews/${reviewId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }).then(async (response) => {
          const result = (await response.json()) as { message?: string };
          if (!response.ok) {
            throw new Error(
              result.message || `Failed to update review ${reviewId}`,
            );
          }
          return result;
        }),
      );

      const results = await Promise.allSettled(promises);

      const successful = results
        .filter((result) => result.status === "fulfilled")
        .map(
          (result) =>
            (result as PromiseFulfilledResult<UpdateReviewStatusResponse>)
              .value,
        );

      const failed = results.filter((result) => result.status === "rejected");

      if (failed.length > 0) {
        throw new Error(`${failed.length} updates failed`);
      }

      return successful;
    },
    onSuccess: (data, variables) => {
      // Invalidate all reviews queries
      queryClient.invalidateQueries({ queryKey: ["reviews"] });

      toast.success(`Successfully updated ${variables.length} review(s)`, {
        description: "All status changes have been saved",
      });
    },
    onError: (error: Error) => {
      console.error("Error bulk updating review statuses:", error);

      toast.error(error.message || "Failed to update some review statuses", {
        description: "Please refresh and try again",
      });
    },
  });
}
