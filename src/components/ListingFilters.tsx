"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, Star, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NormalizedReview } from "@/lib/types/hostaway";

export interface FilterOptions {
  searchTerm?: string;
  sortBy?: "date" | "rating" | "helpful";
  sortOrder?: "asc" | "desc";
  ratingFilter?: number | null;
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
  reviewType?: "all" | "host-to-guest" | "guest-to-host";
  categoryFilter?: string | null;
}

interface ListingFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
  reviewCount: number;
  availableCategories?: string[];
  className?: string;
  isLoading?: boolean;
}

export function ListingFilters({
  onFiltersChange,
  reviewCount,
  availableCategories = [],
  className,
  isLoading = false,
}: ListingFiltersProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: "date",
    sortOrder: "desc",
    reviewType: "all",
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleFilterChange = useCallback(
    (newFilters: Partial<FilterOptions>) => {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);
      onFiltersChange(updatedFilters);
    },
    [filters, onFiltersChange],
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFilterChange({ searchTerm: searchValue });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, handleFilterChange]);

  const clearFilters = () => {
    const defaultFilters: FilterOptions = {
      sortBy: "date",
      sortOrder: "desc",
      reviewType: "all",
    };
    setFilters(defaultFilters);
    setSearchValue("");
    onFiltersChange(defaultFilters);
  };

  const hasActiveFilters = () => {
    return (
      filters.searchTerm ||
      filters.ratingFilter ||
      filters.dateRange?.start ||
      filters.dateRange?.end ||
      filters.reviewType !== "all" ||
      filters.categoryFilter
    );
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.ratingFilter) count++;
    if (filters.dateRange?.start || filters.dateRange?.end) count++;
    if (filters.reviewType !== "all") count++;
    if (filters.categoryFilter) count++;
    return count;
  };

  return (
    <div className={cn("bg-white rounded-lg border p-4 space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-900">Filter Reviews</h3>
          <span className="text-sm text-gray-500">({reviewCount} total)</span>
          {hasActiveFilters() && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {getActiveFilterCount()} active
            </span>
          )}
        </div>
        {hasActiveFilters() && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search reviews..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        />
      </div>

      {/* Quick filters row */}
      <div className="flex flex-wrap gap-2">
        {/* Sort */}
        <select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split("-") as [
              string,
              "asc" | "desc",
            ];
            handleFilterChange({
              sortBy: sortBy as "date" | "rating" | "helpful",
              sortOrder,
            });
          }}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="rating-desc">Highest Rated</option>
          <option value="rating-asc">Lowest Rated</option>
        </select>

        {/* Review Type */}
        <select
          value={filters.reviewType || "all"}
          onChange={(e) =>
            handleFilterChange({
              reviewType: e.target.value as FilterOptions["reviewType"],
            })
          }
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        >
          <option value="all">All Reviews</option>
          <option value="guest-to-host">Guest to Host</option>
          <option value="host-to-guest">Host to Guest</option>
        </select>

        {/* Rating Filter */}
        <select
          value={filters.ratingFilter || ""}
          onChange={(e) => {
            const value = e.target.value;
            handleFilterChange({ ratingFilter: value ? Number(value) : null });
          }}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        >
          <option value="">All Ratings</option>
          <option value="9">9+ Stars</option>
          <option value="8">8+ Stars</option>
          <option value="7">7+ Stars</option>
          <option value="6">6+ Stars</option>
          <option value="5">5+ Stars</option>
        </select>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors",
            isFilterOpen && "bg-gray-50",
          )}
          disabled={isLoading}
        >
          <Filter className="h-4 w-4" />
          More Filters
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              isFilterOpen && "rotate-180",
            )}
          />
        </button>
      </div>

      {/* Advanced Filters */}
      {isFilterOpen && (
        <div className="border-t pt-4 space-y-4">
          <h4 className="font-medium text-gray-900 text-sm">
            Advanced Filters
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={
                    filters.dateRange?.start?.toISOString().split("T")[0] || ""
                  }
                  onChange={(e) => {
                    const start = e.target.value
                      ? new Date(e.target.value)
                      : null;
                    handleFilterChange({
                      dateRange: {
                        start,
                        end: filters.dateRange?.end || null,
                      },
                    });
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <span className="px-2 py-2 text-gray-500">to</span>
                <input
                  type="date"
                  value={
                    filters.dateRange?.end?.toISOString().split("T")[0] || ""
                  }
                  onChange={(e) => {
                    const end = e.target.value
                      ? new Date(e.target.value)
                      : null;
                    handleFilterChange({
                      dateRange: {
                        start: filters.dateRange?.start || null,
                        end,
                      },
                    });
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Category Filter */}
            {availableCategories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Category
                </label>
                <select
                  value={filters.categoryFilter || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleFilterChange({ categoryFilter: value || null });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                >
                  <option value="">All Categories</option>
                  {availableCategories.map((category) => (
                    <option key={category} value={category}>
                      {category
                        .replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Quick Rating Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Rating Filters
            </label>
            <div className="flex flex-wrap gap-2">
              {[10, 9, 8, 7, 6, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => {
                    const newRating =
                      filters.ratingFilter === rating ? null : rating;
                    handleFilterChange({ ratingFilter: newRating });
                  }}
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 border rounded-md text-sm transition-colors",
                    filters.ratingFilter === rating
                      ? "bg-blue-100 border-blue-300 text-blue-800"
                      : "border-gray-300 hover:bg-gray-50",
                  )}
                  disabled={isLoading}
                >
                  <Star className="h-3 w-3" />
                  {rating}+
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results info */}
      {reviewCount > 0 && (
        <div className="text-xs text-gray-500 pt-2 border-t">
          {hasActiveFilters()
            ? `Filters applied • ${reviewCount} matching reviews`
            : `${reviewCount} total reviews`}
        </div>
      )}
    </div>
  );
}

// Helper hook for using filters
export function useListingFilters(
  reviews: NormalizedReview[],
  filters: FilterOptions,
) {
  return reviews
    .filter((review) => {
      // Search filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch =
          review.guestName.toLowerCase().includes(searchLower) ||
          review.comment.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Rating filter
      if (filters.ratingFilter && review.overallRating) {
        if (review.overallRating < filters.ratingFilter) return false;
      }

      // Review type filter
      if (filters.reviewType && filters.reviewType !== "all") {
        if (review.type !== filters.reviewType) return false;
      }

      // Date range filter
      if (filters.dateRange?.start || filters.dateRange?.end) {
        const reviewDate = new Date(review.submittedAt);
        if (filters.dateRange.start && reviewDate < filters.dateRange.start)
          return false;
        if (filters.dateRange.end && reviewDate > filters.dateRange.end)
          return false;
      }

      // Category filter
      if (filters.categoryFilter) {
        const hasCategory = Object.keys(review.categories || {}).includes(
          filters.categoryFilter,
        );
        if (!hasCategory) return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Apply sorting
      switch (filters.sortBy) {
        case "date":
          const dateA = new Date(a.submittedAt).getTime();
          const dateB = new Date(b.submittedAt).getTime();
          return filters.sortOrder === "desc" ? dateB - dateA : dateA - dateB;

        case "rating":
          const ratingA = a.overallRating || 0;
          const ratingB = b.overallRating || 0;
          return filters.sortOrder === "desc"
            ? ratingB - ratingA
            : ratingA - ratingB;

        default:
          return 0;
      }
    });
}
