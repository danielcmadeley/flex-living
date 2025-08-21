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
    <Card className="bg-white/80 border-gray-200/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters & Search
        </CardTitle>
        {hasActiveFilters() && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search reviews..."
            value={filters.searchTerm || ""}
            onChange={(e) => setSearchTerm(e.target.value || "")}
            className="pl-10"
          />
        </div>

        {/* Primary Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Property Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Property</label>
            <Select
              value={filters.listingName || "all"}
              onValueChange={(value) =>
                setListingName(value === "all" ? undefined : value)
              }
            >
              <SelectTrigger>
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
          <div>
            <label className="text-sm font-medium mb-2 block">
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
              <SelectTrigger>
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
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select
              value={filters.status || "all"}
              onValueChange={(value) =>
                setStatus(value === "all" ? undefined : (value as ReviewStatus))
              }
            >
              <SelectTrigger>
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
          <div>
            <label className="text-sm font-medium mb-2 block">Sort Order</label>
            <Select
              value={filters.sortOrder}
              onValueChange={(value) => setSortOrder(value as "asc" | "desc")}
            >
              <SelectTrigger>
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
        <div>
          <label className="text-sm font-medium mb-2 block">Rating Range</label>
          <div className="grid grid-cols-2 gap-2">
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
              />
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters() && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {filters.type && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Type:{" "}
                {filters.type === "host-to-guest"
                  ? "Host → Guest"
                  : "Guest → Host"}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setFilters({ type: undefined })}
                />
              </Badge>
            )}
            {filters.status && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Status: {filters.status}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setStatus(undefined)}
                />
              </Badge>
            )}
            {filters.listingName && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Property: {filters.listingName}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setListingName(undefined)}
                />
              </Badge>
            )}
            {filters.searchTerm && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: &ldquo;{filters.searchTerm}&rdquo;
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setSearchTerm(undefined)}
                />
              </Badge>
            )}
            {(filters.minRating || filters.maxRating) && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Rating: {filters.minRating || 1}-{filters.maxRating || 10}
                <X
                  className="h-3 w-3 cursor-pointer"
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
