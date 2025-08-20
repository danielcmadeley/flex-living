"use client";

import React, { createContext, useContext } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDashboardStore, useFilterActions } from "@/stores/dashboard-store";
import type { FilterState } from "@/stores/dashboard-store";

interface UrlStateContextValue {
  updateUrl: (filters: FilterState) => void;
  clearUrl: () => void;
  createShareableUrl: (filters?: Partial<FilterState>) => string;
  isUrlSynced: boolean;
}

const UrlStateContext = createContext<UrlStateContextValue | null>(null);

interface UrlStateProviderProps {
  children: React.ReactNode;
  enabled?: boolean;
  debounceMs?: number;
}

export function UrlStateProvider({
  children,
  enabled = true,
  debounceMs = 300,
}: UrlStateProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useDashboardStore((state) => state.filters);
  const { setFilters } = useFilterActions();
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [isUrlSynced, setIsUrlSynced] = React.useState(true);

  // Parse URL params to filter state
  const parseUrlToFilters = React.useCallback((): Partial<FilterState> => {
    const urlFilters: Partial<FilterState> = {};

    const searchTerm = searchParams.get("search");
    if (searchTerm) urlFilters.searchTerm = searchTerm;

    const status = searchParams.get("status");
    if (status && ["published", "pending", "draft"].includes(status)) {
      urlFilters.status = status as FilterState["status"];
    }

    const type = searchParams.get("type");
    if (type && ["host-to-guest", "guest-to-host"].includes(type)) {
      urlFilters.type = type as FilterState["type"];
    }

    const listingName = searchParams.get("listing");
    if (listingName) urlFilters.listingName = listingName;

    const minRating = searchParams.get("minRating");
    if (minRating && !isNaN(Number(minRating))) {
      urlFilters.minRating = Number(minRating);
    }

    const maxRating = searchParams.get("maxRating");
    if (maxRating && !isNaN(Number(maxRating))) {
      urlFilters.maxRating = Number(maxRating);
    }

    const sortBy = searchParams.get("sortBy");
    if (sortBy && ["date", "rating", "guestName"].includes(sortBy)) {
      urlFilters.sortBy = sortBy as FilterState["sortBy"];
    }

    const sortOrder = searchParams.get("sortOrder");
    if (sortOrder && ["asc", "desc"].includes(sortOrder)) {
      urlFilters.sortOrder = sortOrder as FilterState["sortOrder"];
    }

    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    if (dateFrom || dateTo) {
      urlFilters.dateRange = {
        from: dateFrom ? new Date(dateFrom) : undefined,
        to: dateTo ? new Date(dateTo) : undefined,
      };
    }

    const groupBy = searchParams.get("groupBy");
    if (groupBy && ["listing", "type"].includes(groupBy)) {
      urlFilters.groupBy = groupBy as FilterState["groupBy"];
    }

    const limit = searchParams.get("limit");
    if (limit && !isNaN(Number(limit))) {
      urlFilters.limit = Number(limit);
    }

    return urlFilters;
  }, [searchParams]);

  // Convert filters to URL params
  const filtersToUrlParams = React.useCallback(
    (filters: FilterState): URLSearchParams => {
      const params = new URLSearchParams();

      if (filters.searchTerm) {
        params.set("search", filters.searchTerm);
      }

      if (filters.status) {
        params.set("status", filters.status);
      }

      if (filters.type) {
        params.set("type", filters.type);
      }

      if (filters.listingName) {
        params.set("listing", filters.listingName);
      }

      if (filters.minRating !== undefined) {
        params.set("minRating", filters.minRating.toString());
      }

      if (filters.maxRating !== undefined) {
        params.set("maxRating", filters.maxRating.toString());
      }

      if (filters.sortBy) {
        params.set("sortBy", filters.sortBy);
      }

      if (filters.sortOrder && filters.sortOrder !== "desc") {
        params.set("sortOrder", filters.sortOrder);
      }

      if (filters.dateRange?.from) {
        params.set(
          "dateFrom",
          filters.dateRange.from.toISOString().split("T")[0],
        );
      }

      if (filters.dateRange?.to) {
        params.set("dateTo", filters.dateRange.to.toISOString().split("T")[0]);
      }

      if (filters.groupBy) {
        params.set("groupBy", filters.groupBy);
      }

      if (filters.limit && filters.limit !== 50) {
        params.set("limit", filters.limit.toString());
      }

      return params;
    },
    [],
  );

  // Update URL when filters change
  const updateUrl = React.useCallback(
    (newFilters: FilterState) => {
      if (!enabled) return;

      const params = filtersToUrlParams(newFilters);
      const newUrl = `${pathname}?${params.toString()}`;

      // Only update if URL actually changed
      const currentUrl = `${pathname}?${searchParams.toString()}`;
      if (newUrl !== currentUrl) {
        router.replace(newUrl, { scroll: false });
      }
    },
    [enabled, pathname, searchParams, router, filtersToUrlParams],
  );

  // Clear URL params
  const clearUrl = React.useCallback(() => {
    if (!enabled) return;
    router.replace(pathname, { scroll: false });
  }, [enabled, pathname, router]);

  // Create shareable URL
  const createShareableUrl = React.useCallback(
    (customFilters?: Partial<FilterState>) => {
      const filtersToShare = customFilters || filters;
      const params = filtersToUrlParams(filtersToShare as FilterState);
      return `${window.location.origin}${pathname}?${params.toString()}`;
    },
    [filters, pathname, filtersToUrlParams],
  );

  // Check if current state matches URL
  const checkUrlSync = React.useCallback(() => {
    const urlFilters = parseUrlToFilters();
    const currentParams = filtersToUrlParams(filters);
    const urlParams = filtersToUrlParams(urlFilters as FilterState);

    return currentParams.toString() === urlParams.toString();
  }, [filters, parseUrlToFilters, filtersToUrlParams]);

  // Debounced URL update effect
  React.useEffect(() => {
    if (!enabled || !isInitialized) return;

    const timeoutId = setTimeout(() => {
      updateUrl(filters);
      setIsUrlSynced(checkUrlSync());
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [filters, updateUrl, checkUrlSync, enabled, debounceMs, isInitialized]);

  // Initialize filters from URL on mount
  React.useEffect(() => {
    if (!enabled) return;

    const urlFilters = parseUrlToFilters();
    const hasUrlParams = Array.from(searchParams.entries()).length > 0;

    if (hasUrlParams) {
      setFilters(urlFilters);
    }

    setIsInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Handle browser navigation (back/forward)
  // Initialize from URL on mount
  React.useEffect(() => {
    if (!enabled) return;

    const handlePopState = () => {
      const urlFilters = parseUrlToFilters();
      setFilters(urlFilters);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [enabled, parseUrlToFilters, setFilters]);

  // Update sync status when URL changes
  React.useEffect(() => {
    if (isInitialized) {
      setIsUrlSynced(checkUrlSync());
    }
  }, [searchParams, checkUrlSync, isInitialized]);

  const contextValue: UrlStateContextValue = {
    updateUrl,
    clearUrl,
    createShareableUrl,
    isUrlSynced,
  };

  return (
    <UrlStateContext.Provider value={contextValue}>
      {children}
    </UrlStateContext.Provider>
  );
}

// Hook to use URL state context
export function useUrlState() {
  const context = useContext(UrlStateContext);
  if (!context) {
    throw new Error("useUrlState must be used within a UrlStateProvider");
  }
  return context;
}

// Hook for components that need to handle incoming URL filters
export function useUrlFilters() {
  const searchParams = useSearchParams();

  const getFilterFromUrl = React.useCallback(
    (key: string) => {
      return searchParams.get(key);
    },
    [searchParams],
  );

  const hasFilter = React.useCallback(
    (key: string) => {
      return searchParams.has(key);
    },
    [searchParams],
  );

  return {
    getFilterFromUrl,
    hasFilter,
    searchParams,
  };
}

// Hook for deep linking to specific review sets
export function useDeepLinking() {
  const router = useRouter();
  const { updateUrl } = useUrlState();

  const navigateToReviews = React.useCallback(
    (filters: Partial<FilterState>) => {
      router.push("/dashboard");
      // Update filters after navigation
      setTimeout(() => {
        updateUrl(filters as FilterState);
      }, 100);
    },
    [router, updateUrl],
  );

  const navigateToProperty = React.useCallback(
    (listingName: string, additionalFilters?: Partial<FilterState>) => {
      const filters = { listingName, ...additionalFilters };
      navigateToReviews(filters);
    },
    [navigateToReviews],
  );

  const navigateToLowRated = React.useCallback(
    (maxRating: number = 3) => {
      navigateToReviews({ maxRating, status: "published" });
    },
    [navigateToReviews],
  );

  const navigateToRecent = React.useCallback(
    (days: number = 7) => {
      const from = new Date();
      from.setDate(from.getDate() - days);

      navigateToReviews({
        dateRange: { from },
        sortOrder: "desc",
        sortBy: "date",
      });
    },
    [navigateToReviews],
  );

  return {
    navigateToReviews,
    navigateToProperty,
    navigateToLowRated,
    navigateToRecent,
  };
}
