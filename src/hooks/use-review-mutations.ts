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

export function useUpdateReviewStatus() {
  const queryClient = useQueryClient();

  console.log("[Mutation Hook] useUpdateReviewStatus initialized", {
    environment: process.env.NODE_ENV,
    queryClient: queryClient ? "available" : "missing",
  });

  return useMutation({
    mutationFn: async ({
      reviewId,
      status,
    }: UpdateReviewStatusParams): Promise<UpdateReviewStatusResponse> => {
      console.log("[Mutation] Starting API call:", {
        reviewId,
        status,
        url: `/api/reviews/${reviewId}`,
        timestamp: new Date().toISOString(),
      });

      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
        body: JSON.stringify({ status }),
      });

      console.log("[Mutation] API response received:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      });

      const result = await response.json();

      console.log("[Mutation] API response data:", result);

      if (!response.ok) {
        throw new Error(result.message || "Failed to update review status");
      }

      return result;
    },
    onSuccess: (data, variables) => {
      console.log("[Mutation Success] Starting cache invalidation...", {
        reviewId: variables.reviewId,
        newStatus: variables.status,
        responseData: data,
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
      });

      // Force invalidate all reviews queries
      const invalidationResult = queryClient.invalidateQueries({
        queryKey: ["reviews"],
        refetchType: "all", // Force refetch even inactive queries
      });

      console.log(
        "[Mutation Success] Cache invalidation result:",
        invalidationResult,
      );

      // Also remove all cached data to force fresh fetch
      queryClient.removeQueries({ queryKey: ["reviews"] });

      console.log("[Mutation Success] Removed all review queries from cache");

      // Update cache directly for immediate UI feedback
      const updateResult = queryClient.setQueriesData(
        { queryKey: ["reviews"] },
        (
          oldData:
            | {
                data?: Array<{
                  id: number;
                  status: string;
                  [key: string]: unknown;
                }>;
              }
            | undefined,
        ) => {
          console.log("[Mutation Success] Updating cache data:", {
            oldData: oldData ? "exists" : "null",
            reviewId: variables.reviewId,
            newStatus: variables.status,
          });

          if (!oldData?.data) {
            console.log("[Mutation Success] No old data to update");
            return oldData;
          }

          const updatedData = {
            ...oldData,
            data: oldData.data.map((review) =>
              review.id === variables.reviewId
                ? { ...review, status: variables.status }
                : review,
            ),
          };

          console.log("[Mutation Success] Cache updated successfully");
          return updatedData;
        },
      );

      console.log("[Mutation Success] setQueriesData result:", updateResult);

      // Force a refetch after a short delay to ensure fresh data
      setTimeout(() => {
        console.log("[Mutation Success] Forcing refetch after delay...");
        queryClient.refetchQueries({
          queryKey: ["reviews"],
          type: "all",
        });
      }, 100);

      toast.success(`Review status updated to ${variables.status}`, {
        description: `Review #${variables.reviewId} is now ${variables.status}`,
      });

      console.log("[Mutation Success] Mutation success handler completed");
    },
    onError: (error: Error, variables) => {
      console.error("[Mutation Error] Status update failed:", {
        error: error.message,
        stack: error.stack,
        reviewId: variables.reviewId,
        attemptedStatus: variables.status,
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
      });

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
