"use client";

import React, { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  performSeedOperation,
  getDatabaseStatus,
  type SeedAction,
  type SeedResult,
} from "@/lib/database-utils";

interface SeedMutationOptions {
  onSuccess?: (data: SeedResult, action: SeedAction) => void;
  onError?: (error: Error, action: SeedAction) => void;
  showToasts?: boolean;
}

/**
 * Hook for performing seed operations with proper cache management
 */
export function useSeedMutations(options: SeedMutationOptions = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, showToasts = true } = options;

  // Invalidate all reviews-related queries
  const invalidateCache = async () => {
    // Remove all reviews queries from cache
    queryClient.removeQueries({
      queryKey: ["reviews"],
      exact: false,
    });

    // Wait a moment for any pending operations
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Refetch all active reviews queries
    await queryClient.refetchQueries({
      queryKey: ["reviews"],
      exact: false,
    });
  };

  // Main seed mutation
  const seedMutation = useMutation({
    mutationFn: async (action: SeedAction): Promise<SeedResult> => {
      const result = await performSeedOperation(action);

      if (!result.success) {
        throw new Error(result.message);
      }

      return result;
    },
    onSuccess: async (data, action) => {
      // Invalidate cache for successful operations
      await invalidateCache();

      if (showToasts) {
        toast.success(data.message);
      }

      onSuccess?.(data, action);
    },
    onError: (error, action) => {
      if (showToasts) {
        toast.error(error.message || "Operation failed");
      }

      onError?.(error as Error, action);
    },
  });

  // Database status mutation
  const statusMutation = useMutation({
    mutationFn: getDatabaseStatus,
    onError: (error) => {
      console.error("Failed to fetch database status:", error);
      if (showToasts) {
        toast.error("Failed to fetch database status");
      }
    },
  });

  // Convenience methods for specific operations
  const seed = useCallback(async () => {
    return seedMutation.mutateAsync("seed");
  }, [seedMutation]);

  const forceSeed = useCallback(async () => {
    return seedMutation.mutateAsync("force");
  }, [seedMutation]);

  const reseed = useCallback(async () => {
    return seedMutation.mutateAsync("reseed");
  }, [seedMutation]);

  const clear = useCallback(async () => {
    return seedMutation.mutateAsync("clear");
  }, [seedMutation]);

  const getCount = useCallback(async () => {
    return seedMutation.mutateAsync("count");
  }, [seedMutation]);

  const refreshStatus = useCallback(async () => {
    return statusMutation.mutateAsync();
  }, [statusMutation]);

  // Check if any mutation is currently running
  const isLoading = seedMutation.isPending || statusMutation.isPending;

  // Check if cache is being refreshed
  const isRefetching = queryClient.isFetching({ queryKey: ["reviews"] }) > 0;

  return {
    // Mutation functions
    seed,
    forceSeed,
    reseed,
    clear,
    getCount,
    refreshStatus,

    // Raw mutations for advanced usage
    seedMutation,
    statusMutation,

    // Status
    isLoading,
    isRefetching,

    // Last operation result
    lastResult: seedMutation.data,
    lastError: seedMutation.error,

    // Database status
    dbStatus: statusMutation.data,

    // Reset mutations
    reset: () => {
      seedMutation.reset();
      statusMutation.reset();
    },
  };
}

/**
 * Hook specifically for the seed page with progress tracking
 */
export function useSeedPageMutations() {
  const seedMutations = useSeedMutations({
    showToasts: true,
  });

  // Enhanced methods with progress tracking
  const performSeedWithProgress = async (
    action: SeedAction,
    onProgress?: (progress: number, message: string) => void,
  ): Promise<SeedResult> => {
    onProgress?.(0, "Starting operation...");

    try {
      onProgress?.(25, "Performing operation...");

      const result =
        action === "seed"
          ? await seedMutations.seed()
          : action === "force"
            ? await seedMutations.forceSeed()
            : action === "reseed"
              ? await seedMutations.reseed()
              : action === "clear"
                ? await seedMutations.clear()
                : await seedMutations.getCount();

      onProgress?.(75, "Refreshing data...");

      // Refresh database status
      await seedMutations.refreshStatus();

      onProgress?.(100, "Complete!");

      return result;
    } catch (error) {
      onProgress?.(100, "Error occurred");
      throw error;
    }
  };

  return {
    ...seedMutations,
    performSeedWithProgress,
  };
}

/**
 * Hook for checking database status with auto-refresh
 */
export function useDatabaseStatus(autoRefresh = false, interval = 30000) {
  const { refreshStatus, dbStatus, isLoading } = useSeedMutations({
    showToasts: false,
  });

  // Auto-refresh status if enabled
  React.useEffect(() => {
    if (!autoRefresh) return;

    refreshStatus(); // Initial fetch

    const intervalId = setInterval(() => {
      refreshStatus();
    }, interval);

    return () => clearInterval(intervalId);
  }, [autoRefresh, interval, refreshStatus]);

  return {
    dbStatus,
    isLoading,
    refresh: refreshStatus,
  };
}
