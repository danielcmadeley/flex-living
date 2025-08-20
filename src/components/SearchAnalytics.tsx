"use client";

import { useState, useMemo } from "react";
import {
  Search,
  TrendingUp,
  BarChart3,
  Star,
  MessageSquare,
  Building,
  Eye,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { cn } from "@/lib/utils";
import { NormalizedReview } from "@/lib/schemas";

interface SearchTerm {
  term: string;
  count: number;
  percentage: number;
  trend: "up" | "down" | "stable";
}

interface SearchPattern {
  category: string;
  count: number;
  percentage: number;
}

interface PropertySearchData {
  property: string;
  searchCount: number;
  averageRating: number;
  reviewCount: number;
}

interface SearchAnalyticsProps {
  reviews: NormalizedReview[];
  className?: string;
}

export function SearchAnalytics({ reviews, className }: SearchAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("week");
  const [viewMode, setViewMode] = useState<
    "overview" | "patterns" | "properties"
  >("overview");

  // Analyze real review data for search insights
  const searchAnalytics = useMemo(() => {
    if (!reviews.length) return null;

    // Extract common search terms from comments
    const searchTerms = extractSearchTerms(reviews);
    const searchPatterns = analyzeSearchPatterns(reviews);
    const propertySearchData = analyzePropertySearchability(reviews);
    const temporalPatterns = analyzeTemporalPatterns(reviews);

    return {
      searchTerms,
      searchPatterns,
      propertySearchData,
      temporalPatterns,
      totalReviews: reviews.length,
      searchableContent: calculateSearchableContent(reviews),
    };
  }, [reviews]);

  if (!searchAnalytics) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Search Data</h3>
            <p className="text-muted-foreground">
              No reviews available for search analysis
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Search Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Analyze search patterns and content discoverability
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={viewMode}
            onValueChange={(value: "overview" | "patterns" | "properties") =>
              setViewMode(value)
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="patterns">Search Patterns</SelectItem>
              <SelectItem value="properties">Property Analysis</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={timeRange}
            onValueChange={(value: "day" | "week" | "month") =>
              setTimeRange(value)
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Content</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {searchAnalytics.totalReviews}
            </div>
            <p className="text-xs text-muted-foreground">Searchable reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Properties</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {searchAnalytics.propertySearchData.length}
            </div>
            <p className="text-xs text-muted-foreground">Unique properties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Search Terms</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {searchAnalytics.searchTerms.length}
            </div>
            <p className="text-xs text-muted-foreground">Common keywords</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Content Quality
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {searchAnalytics.searchableContent}%
            </div>
            <p className="text-xs text-muted-foreground">Rich content</p>
          </CardContent>
        </Card>
      </div>

      {/* View-specific content */}
      {viewMode === "overview" && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Top Search Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Most Common Keywords
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {searchAnalytics.searchTerms.slice(0, 10).map((term, index) => (
                  <div
                    key={term.term}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-medium flex items-center justify-center">
                        {index + 1}
                      </div>
                      <span className="font-medium">{term.term}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{term.count} uses</Badge>
                      <div className="flex items-center gap-1">
                        {term.trend === "up" && (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        )}
                        <span className="text-sm text-muted-foreground">
                          {term.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Search Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Content Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={searchAnalytics.searchPatterns}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) =>
                      `${category} ${percentage.toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {searchAnalytics.searchPatterns.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getCategoryColor(entry.category)}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {viewMode === "patterns" && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Temporal Search Patterns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Review Submission Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={searchAnalytics.temporalPatterns}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Content Length Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Content Length Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getContentLengthDistribution(reviews).map((item) => (
                  <div key={item.category} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{item.category}</span>
                      <span>
                        {item.count} reviews ({item.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {viewMode === "properties" && (
        <div className="space-y-4">
          {/* Property Search Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Property Search Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={searchAnalytics.propertySearchData.slice(0, 10)}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="property"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="reviewCount" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Property Details Table */}
          <Card>
            <CardHeader>
              <CardTitle>Property Analysis Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {searchAnalytics.propertySearchData.map((property) => (
                  <div
                    key={property.property}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{property.property}</h4>
                      <p className="text-sm text-muted-foreground">
                        {property.reviewCount} reviews
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">
                          {property.averageRating.toFixed(1)}
                        </span>
                      </div>
                      <Badge
                        variant={
                          property.averageRating >= 8
                            ? "default"
                            : property.averageRating >= 6
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {property.averageRating >= 8
                          ? "Excellent"
                          : property.averageRating >= 6
                            ? "Good"
                            : "Needs Attention"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search Optimization Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Search Optimization Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">
                Top Keywords to Target
              </h4>
              <div className="space-y-1">
                {searchAnalytics.searchTerms.slice(0, 3).map((term) => (
                  <Badge key={term.term} variant="outline">
                    {term.term}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">
                Content Quality Score
              </h4>
              <div className="text-2xl font-bold text-green-700">
                {searchAnalytics.searchableContent}%
              </div>
              <p className="text-sm text-green-600">
                Reviews with rich content
              </p>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-orange-900 mb-2">
                Search Coverage
              </h4>
              <div className="text-2xl font-bold text-orange-700">
                {(
                  (searchAnalytics.propertySearchData.length /
                    Math.max(reviews.length, 1)) *
                  100
                ).toFixed(0)}
                %
              </div>
              <p className="text-sm text-orange-600">Properties with reviews</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper functions
function extractSearchTerms(reviews: NormalizedReview[]): SearchTerm[] {
  const termCounts = new Map<string, number>();
  const totalWords = new Set<string>();

  reviews.forEach((review) => {
    const words = review.comment
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 3 && !isStopWord(word));

    words.forEach((word) => {
      totalWords.add(word);
      termCounts.set(word, (termCounts.get(word) || 0) + 1);
    });
  });

  const totalTerms = Array.from(termCounts.values()).reduce(
    (sum, count) => sum + count,
    0,
  );

  return Array.from(termCounts.entries())
    .map(([term, count]) => ({
      term,
      count,
      percentage: (count / totalTerms) * 100,
      trend: "stable" as const, // In a real app, you'd compare with historical data
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
}

function analyzeSearchPatterns(reviews: NormalizedReview[]): SearchPattern[] {
  const categoryMap = new Map<string, number>();

  reviews.forEach((review) => {
    // Categorize based on content analysis
    const comment = review.comment.toLowerCase();

    if (
      comment.includes("clean") ||
      comment.includes("tidy") ||
      comment.includes("spotless")
    ) {
      categoryMap.set("Cleanliness", (categoryMap.get("Cleanliness") || 0) + 1);
    }
    if (
      comment.includes("location") ||
      comment.includes("convenient") ||
      comment.includes("near")
    ) {
      categoryMap.set("Location", (categoryMap.get("Location") || 0) + 1);
    }
    if (
      comment.includes("host") ||
      comment.includes("responsive") ||
      comment.includes("helpful")
    ) {
      categoryMap.set(
        "Host Quality",
        (categoryMap.get("Host Quality") || 0) + 1,
      );
    }
    if (
      comment.includes("comfort") ||
      comment.includes("cozy") ||
      comment.includes("comfortable")
    ) {
      categoryMap.set("Comfort", (categoryMap.get("Comfort") || 0) + 1);
    }
    if (
      comment.includes("value") ||
      comment.includes("price") ||
      comment.includes("worth")
    ) {
      categoryMap.set("Value", (categoryMap.get("Value") || 0) + 1);
    }
  });

  const total = Array.from(categoryMap.values()).reduce(
    (sum, count) => sum + count,
    0,
  );

  return Array.from(categoryMap.entries()).map(([category, count]) => ({
    category,
    count,
    percentage: (count / total) * 100,
  }));
}

function analyzePropertySearchability(
  reviews: NormalizedReview[],
): PropertySearchData[] {
  const propertyMap = new Map<
    string,
    { reviews: NormalizedReview[]; totalRating: number }
  >();

  reviews.forEach((review) => {
    if (!propertyMap.has(review.listingName)) {
      propertyMap.set(review.listingName, { reviews: [], totalRating: 0 });
    }

    const data = propertyMap.get(review.listingName)!;
    data.reviews.push(review);
    if (review.overallRating) {
      data.totalRating += review.overallRating;
    }
  });

  return Array.from(propertyMap.entries())
    .map(([property, data]) => ({
      property:
        property.length > 30 ? property.substring(0, 30) + "..." : property,
      searchCount: data.reviews.length,
      reviewCount: data.reviews.length,
      averageRating:
        data.reviews.filter((r) => r.overallRating).length > 0
          ? data.totalRating /
            data.reviews.filter((r) => r.overallRating).length
          : 0,
    }))
    .sort((a, b) => b.reviewCount - a.reviewCount);
}

function analyzeTemporalPatterns(reviews: NormalizedReview[]) {
  const monthlyData = new Map<string, number>();

  reviews.forEach((review) => {
    const date = new Date(review.submittedAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + 1);
  });

  return Array.from(monthlyData.entries())
    .map(([period, count]) => ({
      period: new Date(period + "-01").toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      count,
    }))
    .sort((a, b) => a.period.localeCompare(b.period));
}

function getContentLengthDistribution(reviews: NormalizedReview[]) {
  const ranges = [
    { min: 0, max: 50, category: "Very Short (0-50 chars)" },
    { min: 51, max: 150, category: "Short (51-150 chars)" },
    { min: 151, max: 300, category: "Medium (151-300 chars)" },
    { min: 301, max: 500, category: "Long (301-500 chars)" },
    { min: 501, max: Infinity, category: "Very Long (500+ chars)" },
  ];

  const distribution = ranges.map((range) => {
    const count = reviews.filter(
      (review) =>
        review.comment.length >= range.min &&
        review.comment.length <= range.max,
    ).length;

    return {
      category: range.category,
      count,
      percentage: (count / reviews.length) * 100,
    };
  });

  return distribution;
}

function calculateSearchableContent(reviews: NormalizedReview[]): number {
  const richContentReviews = reviews.filter(
    (review) => review.comment.length >= 100 && review.overallRating !== null,
  );

  return reviews.length > 0
    ? Math.round((richContentReviews.length / reviews.length) * 100)
    : 0;
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Cleanliness: "#10b981",
    Location: "#3b82f6",
    "Host Quality": "#8b5cf6",
    Comfort: "#f59e0b",
    Value: "#ef4444",
  };
  return colors[category] || "#6b7280";
}

function isStopWord(word: string): boolean {
  const stopWords = new Set([
    "the",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "from",
    "up",
    "about",
    "into",
    "through",
    "during",
    "before",
    "after",
    "above",
    "below",
    "between",
    "among",
    "throughout",
    "despite",
    "towards",
    "upon",
    "concerning",
    "this",
    "that",
    "these",
    "those",
    "very",
    "was",
    "were",
    "been",
    "have",
    "has",
    "had",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "must",
    "can",
    "shall",
    "being",
  ]);
  return stopWords.has(word);
}
