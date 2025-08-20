"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, Star, ChevronDown, X, MapPin, Building } from "lucide-react";
import { cn } from "@/lib/utils";
import { CombinedReview } from "@/hooks/use-combined-listing-reviews";

export interface CombinedFilterOptions {
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
  sourceFilter?: "all" | "google" | "hostaway";
  languageFilter?: string | null;
}

interface CombinedListingFiltersProps {
  onFiltersChange: (filters: CombinedFilterOptions) => void;
  reviewCount: number;
  availableCategories?: string[];
  availableLanguages?: string[];
  sourceStats?: {
    google: { count: number };
    hostaway: { count: number };
  };
  className?: string;
  isLoading?: boolean;
}

export function CombinedListingFilters({
  onFiltersChange,
  reviewCount,
  availableCategories = [],
  availableLanguages = [],
  sourceStats,
  className,
  isLoading = false,
}: CombinedListingFiltersProps) {
  const [filters, setFilters] = useState<CombinedFilterOptions>({
    sortBy: "date",
    sortOrder: "desc",
    reviewType: "all",
    sourceFilter: "all",
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleFilterChange = useCallback(
    (newFilters: Partial<CombinedFilterOptions>) => {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);
      onFiltersChange(updatedFilters);
    },
    [filters, onFiltersChange],
  );

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleFilterChange({ searchTerm: searchValue });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchValue, handleFilterChange]);

  const clearAllFilters = () => {
    const defaultFilters: CombinedFilterOptions = {
      sortBy: "date",
      sortOrder: "desc",
      reviewType: "all",
      sourceFilter: "all",
    };
    setFilters(defaultFilters);
    setSearchValue("");
    onFiltersChange(defaultFilters);
  };

  const hasActiveFilters =
    filters.searchTerm ||
    filters.ratingFilter ||
    filters.reviewType !== "all" ||
    filters.sourceFilter !== "all" ||
    filters.categoryFilter ||
    filters.languageFilter ||
    filters.dateRange?.start ||
    filters.dateRange?.end;

  const activeFiltersCount = [
    filters.searchTerm,
    filters.ratingFilter,
    filters.reviewType !== "all" && filters.reviewType,
    filters.sourceFilter !== "all" && filters.sourceFilter,
    filters.categoryFilter,
    filters.languageFilter,
    filters.dateRange?.start,
  ].filter(Boolean).length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Sort Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search reviews by guest name or content..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          {searchValue && (
            <button
              onClick={() => setSearchValue("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sort Controls */}
        <div className="flex gap-2">
          <select
            value={filters.sortBy}
            onChange={(e) =>
              handleFilterChange({
                sortBy: e.target.value as CombinedFilterOptions["sortBy"],
              })
            }
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          >
            <option value="date">Sort by Date</option>
            <option value="rating">Sort by Rating</option>
            <option value="helpful">Sort by Helpfulness</option>
          </select>

          <select
            value={filters.sortOrder}
            onChange={(e) =>
              handleFilterChange({
                sortOrder: e.target.value as CombinedFilterOptions["sortOrder"],
              })
            }
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 border rounded-md transition-colors",
            isFilterOpen
              ? "bg-blue-50 border-blue-300 text-blue-700"
              : "border-gray-300 text-gray-700 hover:bg-gray-50"
          )}
          disabled={isLoading}
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              isFilterOpen && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Advanced Filters Panel */}
      {isFilterOpen && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Review Source Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Source
              </label>
              <select
                value={filters.sourceFilter}
                onChange={(e) =>
                  handleFilterChange({
                    sourceFilter: e.target.value as CombinedFilterOptions["sourceFilter"],
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value="all">All Sources</option>
                <option value="google">
                  Google Reviews {sourceStats?.google.count ? `(${sourceStats.google.count})` : ''}
                </option>
                <option value="hostaway">
                  Verified Guests {sourceStats?.hostaway.count ? `(${sourceStats.hostaway.count})` : ''}
                </option>
              </select>
            </div>

            {/* Review Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Type
              </label>
              <select
                value={filters.reviewType}
                onChange={(e) =>
                  handleFilterChange({
                    reviewType: e.target.value as CombinedFilterOptions["reviewType"],
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value="all">All Types</option>
                <option value="guest-to-host">Guest → Host</option>
                <option value="host-to-guest">Host → Guest</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Rating
              </label>
              <select
                value={filters.ratingFilter || ""}
                onChange={(e) =>
                  handleFilterChange({
                    ratingFilter: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value="">All Ratings</option>
                <option value="9">9+ Stars</option>
                <option value="8">8+ Stars</option>
                <option value="7">7+ Stars</option>
                <option value="6">6+ Stars</option>
                <option value="5">5+ Stars</option>
              </select>
            </div>

            {/* Category Filter */}
            {availableCategories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.categoryFilter || ""}
                  onChange={(e) =>
                    handleFilterChange({
                      categoryFilter: e.target.value || null,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                >
                  <option value="">All Categories</option>
                  {availableCategories.map((category) => (
                    <option key={category} value={category}>
                      {category.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Language Filter */}
            {availableLanguages.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={filters.languageFilter || ""}
                  onChange={(e) =>
                    handleFilterChange({
                      languageFilter: e.target.value || null,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                >
                  <option value="">All Languages</option>
                  {availableLanguages.map((language) => (
                    <option key={language} value={language}>
                      {language.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex flex-wrap gap-2">
                {filters.sourceFilter !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {filters.sourceFilter === "google" ? (
                      <MapPin className="h-3 w-3" />
                    ) : (
                      <Building className="h-3 w-3" />
                    )}
                    {filters.sourceFilter === "google" ? "Google" : "Verified"}
                    <button
                      onClick={() => handleFilterChange({ sourceFilter: "all" })}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.reviewType !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {filters.reviewType === "guest-to-host" ? "Guest → Host" : "Host → Guest"}
                    <button
                      onClick={() => handleFilterChange({ reviewType: "all" })}
                      className="text-green-600 hover:text-green-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.ratingFilter && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    <Star className="h-3 w-3" />
                    {filters.ratingFilter}+ Stars
                    <button
                      onClick={() => handleFilterChange({ ratingFilter: null })}
                      className="text-yellow-600 hover:text-yellow-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-600 hover:text-gray-800 font-medium"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {reviewCount} review{reviewCount !== 1 ? "s" : ""}
          {hasActiveFilters && " (filtered)"}
        </span>
        {sourceStats && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span>{sourceStats.google.count} Google</span>
            </div>
            <div className="flex items-center gap-1">
              <Building className="h-4 w-4 text-green-600" />
              <span>{sourceStats.hostaway.count} Verified</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Hook for filtering combined reviews
export function useCombinedListingFilters(
  reviews: CombinedReview[],
  filters: CombinedFilterOptions,
): CombinedReview[] {
  return reviews.filter((review) => {
    // Search filter
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      const matchesAuthor = review.author.toLowerCase().includes(searchTerm);
      const matchesContent = review.comment.toLowerCase().includes(searchTerm);
      if (!matchesAuthor && !matchesContent) return false;
    }

    // Source filter
    if (filters.sourceFilter && filters.sourceFilter !== "all") {
      if (review.source !== filters.sourceFilter) return false;
    }

    // Review type filter
    if (filters.reviewType && filters.reviewType !== "all") {
      if (review.type !== filters.reviewType) return false;
    }

    // Rating filter
    if (filters.ratingFilter) {
      if (review.overallRating < filters.ratingFilter) return false;
    }

    // Category filter
    if (filters.categoryFilter) {
      const categoryRating = review.categories[filters.categoryFilter];
      if (!categoryRating) return false;
    }

    // Language filter
    if (filters.languageFilter) {
      if (review.language !== filters.languageFilter) return false;
    }

    // Date range filter
    if (filters.dateRange?.start || filters.dateRange?.end) {
      const reviewDate = new Date(review.createdAt);
      if (filters.dateRange.start && reviewDate < filters.dateRange.start) return false;
      if (filters.dateRange.end && reviewDate > filters.dateRange.end) return false;
    }

    return true;
  }).sort((a, b) => {
    const { sortBy = "date", sortOrder = "desc" } = filters;

    let comparison = 0;

    switch (sortBy) {
      case "date":
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case "rating":
        comparison = a.overallRating - b.overallRating;
        break;
      case "helpful":
        // For now, sort by rating as proxy for helpfulness
        comparison = a.overallRating - b.overallRating;
        break;
    }

    return sortOrder === "desc" ? -comparison : comparison;
  });
}
