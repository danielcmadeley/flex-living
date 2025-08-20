"use client";

import { useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useFilters, useFilterActions } from "@/stores/dashboard-store";
import type { FilterState } from "@/stores/dashboard-store";

interface UseUrlStateOptions {
  enabled?: boolean;
  debounceMs?: number;
}

export function useUrlState(options: UseUrlStateOptions = {}) {
  const { enabled = true, debounceMs = 300 } = options;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useFilters();
  const { setFilters } = useFilterActions();

  // Parse URL params to filter state
  const parseUrlToFilters = useCallback((): Partial<FilterState> => {
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
  const filtersToUrlParams = useCallback(
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
  const updateUrl = useCallback(
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

  // Debounced URL update
  useEffect(() => {
    if (!enabled) return;

    const timeoutId = setTimeout(() => {
      updateUrl(filters);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [filters, updateUrl, enabled, debounceMs]);

  // Initialize filters from URL on mount
  useEffect(() => {
    if (!enabled) return;

    const urlFilters = parseUrlToFilters();

    // Only update if there are URL params and they differ from current filters
    const hasUrlParams = Array.from(searchParams.entries()).length > 0;
    if (hasUrlParams) {
      setFilters(urlFilters);
    }
  }, []); // Only run on mount

  // Clear URL params
  const clearUrl = useCallback(() => {
    if (!enabled) return;
    router.replace(pathname, { scroll: false });
  }, [enabled, pathname, router]);

  // Create shareable URL
  const createShareableUrl = useCallback(
    (customFilters?: Partial<FilterState>) => {
      const filtersToShare = { ...filters, ...customFilters };
      const params = filtersToUrlParams(filtersToShare);
      return `${window.location.origin}${pathname}?${params.toString()}`;
    },
    [filters, pathname, filtersToUrlParams],
  );

  // Check if current state matches URL
  const checkUrlSync = useCallback(() => {
    const urlFilters = parseUrlToFilters();
    const currentParams = filtersToUrlParams(filters);
    const urlParams = filtersToUrlParams({ ...filters, ...urlFilters });

    return currentParams.toString() === urlParams.toString();
  }, [filters, parseUrlToFilters, filtersToUrlParams]);

  return {
    updateUrl,
    clearUrl,
    createShareableUrl,
    isUrlSynced: checkUrlSync(),
    hasUrlParams: Array.from(searchParams.entries()).length > 0,
  };
}

// Hook for components that need to handle incoming URL filters
export function useUrlFilters() {
  const searchParams = useSearchParams();

  const getFilterFromUrl = useCallback(
    (key: string) => {
      return searchParams.get(key);
    },
    [searchParams],
  );

  const hasFilter = useCallback(
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
  const pathname = usePathname();

  const navigateToReviews = useCallback(
    (filters: Partial<FilterState>) => {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === "dateRange" && typeof value === "object") {
            if (value.from)
              params.set("dateFrom", value.from.toISOString().split("T")[0]);
            if (value.to)
              params.set("dateTo", value.to.toISOString().split("T")[0]);
          } else {
            params.set(key, String(value));
          }
        }
      });

      router.push(`/dashboard?${params.toString()}`);
    },
    [router],
  );

  const navigateToProperty = useCallback(
    (listingName: string, additionalFilters?: Partial<FilterState>) => {
      const filters = { listingName, ...additionalFilters };
      navigateToReviews(filters);
    },
    [navigateToReviews],
  );

  const navigateToLowRated = useCallback(
    (maxRating: number = 3) => {
      navigateToReviews({ maxRating, status: "published" });
    },
    [navigateToReviews],
  );

  const navigateToRecent = useCallback(
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
