"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { NormalizedReview } from "@/lib/schemas";

interface UseSimpleSearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
}

interface SearchState {
  query: string;
  isSearching: boolean;
  hasSearched: boolean;
}

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const DEFAULT_OPTIONS: Required<UseSimpleSearchOptions> = {
  debounceMs: 300,
  minQueryLength: 1,
};

export function useEnhancedSearch(
  reviews: NormalizedReview[],
  options: UseSimpleSearchOptions = {},
) {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const [searchState, setSearchState] = useState<SearchState>({
    query: "",
    isSearching: false,
    hasSearched: false,
  });

  const debouncedQuery = useDebounce(searchState.query, opts.debounceMs);

  // Simple search results
  const results = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < opts.minQueryLength) {
      return [];
    }

    const query = debouncedQuery.toLowerCase();
    return reviews.filter(
      (review) =>
        review.guestName.toLowerCase().includes(query) ||
        review.listingName.toLowerCase().includes(query) ||
        review.comment.toLowerCase().includes(query),
    );
  }, [debouncedQuery, reviews, opts.minQueryLength]);

  // Update search state when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length >= opts.minQueryLength) {
      setSearchState((prev) => ({
        ...prev,
        isSearching: false,
        hasSearched: true,
      }));
    } else {
      setSearchState((prev) => ({
        ...prev,
        isSearching: false,
        hasSearched: false,
      }));
    }
  }, [debouncedQuery, opts.minQueryLength]);

  // Set loading state when query changes
  useEffect(() => {
    if (
      searchState.query !== debouncedQuery &&
      searchState.query.length >= opts.minQueryLength
    ) {
      setSearchState((prev) => ({ ...prev, isSearching: true }));
    }
  }, [searchState.query, debouncedQuery, opts.minQueryLength]);

  const setQuery = useCallback((query: string) => {
    setSearchState((prev) => ({
      ...prev,
      query,
    }));
  }, []);

  const clearSearch = useCallback(() => {
    setSearchState({
      query: "",
      isSearching: false,
      hasSearched: false,
    });
  }, []);

  return {
    // State
    query: searchState.query,
    results,
    isSearching: searchState.isSearching,
    hasSearched: searchState.hasSearched,
    isEmpty: searchState.hasSearched && results.length === 0,

    // Actions
    setQuery,
    clearSearch,
  };
}

// Hook for quick search filters
export function useSearchFilters() {
  const commonFilters = useMemo(
    () => [
      {
        label: "High Ratings",
        query: "rating",
        description: "Reviews with high ratings",
        icon: "⭐",
      },
      {
        label: "Recent Reviews",
        query: "recent",
        description: "Recently submitted reviews",
        icon: "📅",
      },
      {
        label: "Guest Reviews",
        query: "guest",
        description: "Reviews from guests",
        icon: "👤",
      },
      {
        label: "Properties",
        query: "property",
        description: "Search properties",
        icon: "🏠",
      },
    ],
    [],
  );

  return { commonFilters };
}
