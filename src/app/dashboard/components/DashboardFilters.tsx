"use client";

import { useState } from "react";
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

interface DashboardFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  properties: string[];
  isLoading?: boolean;
}

export interface FilterState {
  type?: ReviewType;
  status?: ReviewStatus;
  listingName?: string;
  searchTerm?: string;
  sortOrder: "asc" | "desc";
  minRating?: number;
  maxRating?: number;
}

export function DashboardFilters({
  onFiltersChange,
  properties,
  isLoading,
}: DashboardFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    sortOrder: "desc",
  });

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const clearFilters = () => {
    const defaultFilters: FilterState = { sortOrder: "desc" };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const hasActiveFilters = Object.keys(filters).some(
    (key) => key !== "sortOrder" && filters[key as keyof FilterState],
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters & Search
        </CardTitle>
        {hasActiveFilters && (
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
            placeholder="Search reviews by guest name or comment..."
            value={filters.searchTerm || ""}
            onChange={(e) =>
              updateFilters({ searchTerm: e.target.value || undefined })
            }
            className="pl-10"
          />
        </div>

        {/* Primary Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Property Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Property</label>
            <Select
              value={filters.listingName || "__all__"}
              onValueChange={(value) =>
                updateFilters({
                  listingName: value === "__all__" ? undefined : value,
                })
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Properties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Properties</SelectItem>
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
              value={filters.type || "__all__"}
              onValueChange={(value) =>
                updateFilters({
                  type: value === "__all__" ? undefined : (value as ReviewType),
                })
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Types</SelectItem>
                <SelectItem value="host-to-guest">Host → Guest</SelectItem>
                <SelectItem value="guest-to-host">Guest → Host</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select
              value={filters.status || "__all__"}
              onValueChange={(value) =>
                updateFilters({
                  status:
                    value === "__all__" ? undefined : (value as ReviewStatus),
                })
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Statuses</SelectItem>
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
              onValueChange={(value) =>
                updateFilters({ sortOrder: value as "asc" | "desc" })
              }
              disabled={isLoading}
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
                  updateFilters({
                    minRating: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
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
                  updateFilters({
                    maxRating: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {filters.type && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Type:{" "}
                {filters.type === "host-to-guest"
                  ? "Host → Guest"
                  : "Guest → Host"}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilters({ type: undefined })}
                />
              </Badge>
            )}
            {filters.status && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Status: {filters.status}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilters({ status: undefined })}
                />
              </Badge>
            )}
            {filters.listingName && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Property: {filters.listingName}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilters({ listingName: undefined })}
                />
              </Badge>
            )}
            {filters.searchTerm && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: &ldquo;{filters.searchTerm}&rdquo;
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilters({ searchTerm: undefined })}
                />
              </Badge>
            )}
            {(filters.minRating || filters.maxRating) && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Rating: {filters.minRating || 1}-{filters.maxRating || 10}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() =>
                    updateFilters({
                      minRating: undefined,
                      maxRating: undefined,
                    })
                  }
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
