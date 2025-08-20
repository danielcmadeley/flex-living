"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, TrendingUp, Users, Filter, Calendar, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { NormalizedReview } from "@/lib/types/hostaway";

interface SearchTerm {
  term: string;
  count: number;
  lastSearched: Date;
}

interface SearchPattern {
  hour: number;
  count: number;
}

interface FilterUsage {
  filterType: string;
  count: number;
  percentage: number;
}

interface SearchAnalyticsProps {
  reviews: NormalizedReview[];
  className?: string;
}

export function SearchAnalytics({ reviews, className }: SearchAnalyticsProps) {
  const [searchHistory, setSearchHistory] = useState<SearchTerm[]>([]);
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("week");
  const [viewMode, setViewMode] = useState<"overview" | "patterns" | "filters">("overview");

  // Mock search analytics data (in a real app, this would come from your analytics service)
  const mockSearchData = useMemo(() => {
    const terms: SearchTerm[] = [
      { term: "clean", count: 45, lastSearched: new Date(Date.now() - 2 * 60 * 60 * 1000) },
      { term: "location", count: 38, lastSearched: new Date(Date.now() - 4 * 60 * 60 * 1000) },
      { term: "comfortable", count: 32, lastSearched: new Date(Date.now() - 1 * 60 * 60 * 1000) },
      { term: "kitchen", count: 28, lastSearched: new Date(Date.now() - 6 * 60 * 60 * 1000) },
      { term: "bathroom", count: 25, lastSearched: new Date(Date.now() - 3 * 60 * 60 * 1000) },
      { term: "wifi", count: 22, lastSearched: new Date(Date.now() - 5 * 60 * 60 * 1000) },
      { term: "host", count: 20, lastSearched: new Date(Date.now() - 7 * 60 * 60 * 1000) },
      { term: "transport", count: 18, lastSearched: new Date(Date.now() - 8 * 60 * 60 * 1000) },
      { term: "noise", count: 15, lastSearched: new Date(Date.now() - 9 * 60 * 60 * 1000) },
      { term: "value", count: 12, lastSearched: new Date(Date.now() - 10 * 60 * 60 * 1000) },
    ];

    const patterns: SearchPattern[] = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: Math.floor(Math.random() * 20) + (hour >= 9 && hour <= 17 ? 15 : 5),
    }));

    const filterUsage: FilterUsage[] = [
      { filterType: "Rating Filter", count: 156, percentage: 35.2 },
      { filterType: "Date Range", count: 134, percentage: 30.3 },
      { filterType: "Review Type", count: 89, percentage: 20.1 },
      { filterType: "Category Filter", count: 64, percentage: 14.4 },
    ];

    return { terms, patterns, filterUsage };
  }, [timeRange]);

  useEffect(() => {
    setSearchHistory(mockSearchData.terms);
  }, [mockSearchData.terms]);

  const totalSearches = searchHistory.reduce((sum, term) => sum + term.count, 0);
  const avgSearchesPerDay = Math.round(totalSearches / 7); // Assuming week view
  const topSearchTerm = searchHistory[0];

  const getSearchTrend = (term: SearchTerm) => {
    // Mock trend calculation
    const baseCount = term.count;
    const previousCount = baseCount * (0.8 + Math.random() * 0.4);
    const change = ((baseCount - previousCount) / previousCount) * 100;
    return { change: Math.round(change * 10) / 10, isPositive: change > 0 };
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "< 1 hour ago";
    if (diffInHours === 1) return "1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1 day ago";
    return `${diffInDays} days ago`;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Search Analytics</h2>
          <p className="text-sm text-gray-600">
            Understand how users search and filter reviews
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="day">Last 24 Hours</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      {viewMode === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Searches</p>
                <p className="text-2xl font-bold text-gray-900">{totalSearches}</p>
              </div>
              <Search className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Daily Average</p>
                <p className="text-2xl font-bold text-gray-900">{avgSearchesPerDay}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Top Search</p>
                <p className="text-2xl font-bold text-gray-900">"{topSearchTerm?.term}"</p>
                <p className="text-xs text-gray-500">{topSearchTerm?.count} searches</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Terms</p>
                <p className="text-2xl font-bold text-gray-900">{searchHistory.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "patterns", label: "Search Patterns", icon: TrendingUp },
            { id: "filters", label: "Filter Usage", icon: Filter },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id as typeof viewMode)}
                className={cn(
                  "flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors",
                  viewMode === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content based on view mode */}
      {viewMode === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Search Terms */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-medium text-gray-900 mb-4">Top Search Terms</h3>
            <div className="space-y-3">
              {searchHistory.slice(0, 8).map((term, index) => {
                const trend = getSearchTrend(term);
                return (
                  <div key={term.term} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500 w-6">
                        #{index + 1}
                      </span>
                      <span className="font-medium text-gray-900">"{term.term}"</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{term.count}</span>
                      <span
                        className={cn(
                          "text-xs px-2 py-1 rounded-full",
                          trend.isPositive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        )}
                      >
                        {trend.isPositive ? "+" : ""}{trend.change}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-medium text-gray-900 mb-4">Recent Search Activity</h3>
            <div className="space-y-3">
              {searchHistory.slice(0, 8).map((term) => (
                <div key={`${term.term}-recent`} className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-900">"{term.term}"</span>
                    <p className="text-xs text-gray-500">
                      {formatTimeAgo(term.lastSearched)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900">{term.count}</span>
                    <p className="text-xs text-gray-500">searches</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewMode === "patterns" && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-medium text-gray-900 mb-4">Search Activity by Hour</h3>
          <div className="grid grid-cols-12 gap-1">
            {mockSearchData.patterns.map((pattern) => (
              <div key={pattern.hour} className="text-center">
                <div
                  className="bg-blue-200 rounded-t mb-1 transition-all hover:bg-blue-300"
                  style={{ height: `${(pattern.count / 35) * 100}px`, minHeight: "4px" }}
                  title={`${pattern.hour}:00 - ${pattern.count} searches`}
                />
                <span className="text-xs text-gray-500">
                  {pattern.hour.toString().padStart(2, "0")}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>Peak hours: 9:00-17:00 (business hours)</p>
            <p>Search volume is typically higher during weekdays</p>
          </div>
        </div>
      )}

      {viewMode === "filters" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Filter Usage */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-medium text-gray-900 mb-4">Filter Usage Statistics</h3>
            <div className="space-y-4">
              {mockSearchData.filterUsage.map((filter) => (
                <div key={filter.filterType}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {filter.filterType}
                    </span>
                    <span className="text-sm text-gray-600">{filter.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${filter.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{filter.count} uses</p>
                </div>
              ))}
            </div>
          </div>

          {/* Filter Combinations */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-medium text-gray-900 mb-4">Popular Filter Combinations</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm">Rating + Date Range</span>
                <span className="text-sm font-medium">89 uses</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm">Search + Rating</span>
                <span className="text-sm font-medium">76 uses</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm">Review Type + Category</span>
                <span className="text-sm font-medium">54 uses</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm">All Filters</span>
                <span className="text-sm font-medium">23 uses</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Insights</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• "Clean" and "location" are the most searched terms - consider highlighting these in property descriptions</li>
          <li>• Most searches happen during business hours - optimize for mobile users browsing during commute</li>
          <li>• Rating filters are used most frequently - ensure review ratings are prominently displayed</li>
          <li>• Users often combine multiple filters - improve filter UX for complex searches</li>
        </ul>
      </div>
    </div>
  );
}
