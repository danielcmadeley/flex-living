"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Filter, X, Search } from "lucide-react";
import { ReviewType, ReviewStatus } from "@/lib/schemas";
import {
  useFilters,
  useFilterActions,
  useComputedValues,
} from "@/stores/dashboard-store";

interface DashboardFiltersProps {
  properties: string[];
}

export function DashboardFilters({ properties }: DashboardFiltersProps) {
  const filters = useFilters();
  const {
    setSearchTerm,
    setStatus,
    setListingName,
    setRatingRange,
    setSortOrder,
    resetFilters,
    setFilters,
  } = useFilterActions();
  const { hasActiveFilters } = useComputedValues();

  const clearFilters = () => {
    resetFilters();
  };

  return (
    <Card className="bg-white/95 border-gray-200/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-5">
        <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Filter className="h-5 w-5 text-blue-600" />
          </div>
          Filters & Search
        </CardTitle>
        {hasActiveFilters() && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="text-gray-600 border-gray-300 hover:bg-gray-50 hover:text-gray-800 hover:border-gray-400 transition-colors"
          >
            <X className="h-4 w-4 mr-1.5" />
            Clear All
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search reviews by guest, property, or content..."
            value={filters.searchTerm || ""}
            onChange={(e) => setSearchTerm(e.target.value || "")}
            className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          />
        </div>

        {/* Primary Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* Property Filter */}
          <div className="space-y-2">
            <label className="text-sm font-semibold mb-2 block text-gray-700">
              Property
            </label>
            <Select
              value={filters.listingName || "all"}
              onValueChange={(value) =>
                setListingName(value === "all" ? undefined : value)
              }
            >
              <SelectTrigger className="h-11 border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200">
                <SelectValue placeholder="All Properties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                {properties.map((property) => (
                  <SelectItem key={property} value={property}>
                    {property}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Review Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-semibold mb-2 block text-gray-700">
              Review Type
            </label>
            <Select
              value={filters.type || "all"}
              onValueChange={(value) =>
                setFilters({
                  type: value === "all" ? undefined : (value as ReviewType),
                })
              }
            >
              <SelectTrigger className="h-11 border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="host-to-guest">Host → Guest</SelectItem>
                <SelectItem value="guest-to-host">Guest → Host</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-semibold mb-2 block text-gray-700">
              Status
            </label>
            <Select
              value={filters.status || "all"}
              onValueChange={(value) =>
                setStatus(value === "all" ? undefined : (value as ReviewStatus))
              }
            >
              <SelectTrigger className="h-11 border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <label className="text-sm font-semibold mb-2 block text-gray-700">
              Sort Order
            </label>
            <Select
              value={filters.sortOrder}
              onValueChange={(value) => setSortOrder(value as "asc" | "desc")}
            >
              <SelectTrigger className="h-11 border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Rating Range */}
        <div className="space-y-3">
          <label className="text-sm font-semibold mb-2 block text-gray-700">
            Rating Range
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                type="number"
                min="1"
                max="10"
                placeholder="Min (1-10)"
                value={filters.minRating || ""}
                onChange={(e) =>
                  setRatingRange(
                    e.target.value ? parseInt(e.target.value) : undefined,
                    filters.maxRating,
                  )
                }
                className="h-11 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              />
            </div>
            <div>
              <Input
                type="number"
                min="1"
                max="10"
                placeholder="Max (1-10)"
                value={filters.maxRating || ""}
                onChange={(e) =>
                  setRatingRange(
                    filters.minRating,
                    e.target.value ? parseInt(e.target.value) : undefined,
                  )
                }
                className="h-11 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters() && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
            {filters.type && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors"
              >
                Type:{" "}
                {filters.type === "host-to-guest"
                  ? "Host → Guest"
                  : "Guest → Host"}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-blue-900 transition-colors"
                  onClick={() => setFilters({ type: undefined })}
                />
              </Badge>
            )}
            {filters.status && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1.5 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 transition-colors"
              >
                Status: {filters.status}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-green-900 transition-colors"
                  onClick={() => setStatus(undefined)}
                />
              </Badge>
            )}
            {filters.listingName && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1.5 bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 transition-colors"
              >
                Property: {filters.listingName}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-purple-900 transition-colors"
                  onClick={() => setListingName(undefined)}
                />
              </Badge>
            )}
            {filters.searchTerm && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1.5 bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 transition-colors"
              >
                Search: &ldquo;{filters.searchTerm}&rdquo;
                <X
                  className="h-3 w-3 cursor-pointer hover:text-orange-900 transition-colors"
                  onClick={() => setSearchTerm(undefined)}
                />
              </Badge>
            )}
            {(filters.minRating || filters.maxRating) && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 transition-colors"
              >
                Rating: {filters.minRating || 1}-{filters.maxRating || 10}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-yellow-900 transition-colors"
                  onClick={() => setRatingRange(undefined, undefined)}
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
