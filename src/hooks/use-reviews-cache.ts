"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

/**
 * Hook for managing reviews cache invalidation and mutations
 */
export function useReviewsCache() {
  const queryClient = useQueryClient();

  /**
   * Invalidate all reviews queries to force refetch from database
   */
  const invalidateReviews = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: ["reviews"],
      exact: false, // This will invalidate all queries that start with 'reviews'
    });
  }, [queryClient]);

  /**
   * Invalidate specific reviews query by parameters
   */
  const invalidateReviewsQuery = useCallback(
    async (queryParams?: Record<string, unknown>) => {
      await queryClient.invalidateQueries({
        queryKey: ["reviews", queryParams],
        exact: true,
      });
    },
    [queryClient],
  );

  /**
   * Clear all reviews from cache without refetching
   */
  const clearReviewsCache = useCallback(() => {
    queryClient.removeQueries({
      queryKey: ["reviews"],
      exact: false,
    });
  }, [queryClient]);

  /**
   * Refetch all active reviews queries
   */
  const refetchReviews = useCallback(async () => {
    await queryClient.refetchQueries({
      queryKey: ["reviews"],
      exact: false,
    });
  }, [queryClient]);

  /**
   * Set reviews data directly in cache (optimistic updates)
   */
  const setReviewsData = useCallback(
    (queryParams: Record<string, unknown>, data: unknown) => {
      queryClient.setQueryData(["reviews", queryParams], data);
    },
    [queryClient],
  );

  /**
   * Get cached reviews data without triggering a fetch
   */
  const getCachedReviews = useCallback(
    (queryParams?: Record<string, unknown>) => {
      return queryClient.getQueryData(["reviews", queryParams]);
    },
    [queryClient],
  );

  /**
   * Invalidate cache after database operations (seed, clear, etc.)
   */
  const invalidateAfterDatabaseOperation = useCallback(async () => {
    // Clear all reviews cache and force fresh fetch
    clearReviewsCache();

    // Wait a moment for any pending operations to complete
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Refetch all active queries
    await refetchReviews();
  }, [clearReviewsCache, refetchReviews]);

  /**
   * Check if reviews queries are currently fetching
   */
  const isRefetching = useCallback(() => {
    return queryClient.isFetching({ queryKey: ["reviews"] }) > 0;
  }, [queryClient]);

  /**
   * Get the current state of all reviews queries
   */
  const getQueriesState = useCallback(() => {
    return queryClient.getQueriesData({ queryKey: ["reviews"] });
  }, [queryClient]);

  return {
    // Core invalidation functions
    invalidateReviews,
    invalidateReviewsQuery,
    clearReviewsCache,
    refetchReviews,

    // Data manipulation
    setReviewsData,
    getCachedReviews,

    // Database operation helpers
    invalidateAfterDatabaseOperation,

    // Query state helpers
    isRefetching,
    getQueriesState,
  };
}

/**
 * Hook specifically for database seeding operations
 */
export function useSeedingCache() {
  const { invalidateAfterDatabaseOperation, isRefetching } = useReviewsCache();

  /**
   * Perform cache invalidation after successful seeding operation
   */
  const handleSuccessfulSeed = useCallback(async () => {
    await invalidateAfterDatabaseOperation();
  }, [invalidateAfterDatabaseOperation]);

  /**
   * Perform cache invalidation after successful clear operation
   */
  const handleSuccessfulClear = useCallback(async () => {
    await invalidateAfterDatabaseOperation();
  }, [invalidateAfterDatabaseOperation]);

  /**
   * Perform cache invalidation after any successful database operation
   */
  const handleSuccessfulDatabaseOperation = useCallback(
    async (operationType?: string) => {
      // Invalidate cache after database operations
      await invalidateAfterDatabaseOperation();
    },
    [invalidateAfterDatabaseOperation],
  );

  return {
    handleSuccessfulSeed,
    handleSuccessfulClear,
    handleSuccessfulDatabaseOperation,
    isRefetching,
  };
}
