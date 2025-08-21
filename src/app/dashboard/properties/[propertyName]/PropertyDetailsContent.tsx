"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { useReviews } from "@/hooks/use-reviews";
import { DashboardSidebar } from "../../components/DashboardSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReviewsTable } from "../../components/ReviewsTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  Building,
  Star,
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  Calendar,
  Target,
  ArrowLeft,
  Download,
  Filter,
  Search,
} from "lucide-react";

interface PropertyDetailsContentProps {
  user: User;
  propertyName: string;
}

export function PropertyDetailsContent({
  user,
  propertyName,
}: PropertyDetailsContentProps) {
  const router = useRouter();
  const { reviews, isLoading, isError, error } = useReviews({
    includeStats: true,
  });

  const [reviewFilters, setReviewFilters] = useState({
    searchTerm: "",
    type: "all" as "host-to-guest" | "guest-to-host" | "all",
    status: "all" as "published" | "pending" | "draft" | "all",
  });

  // Get property data
  const propertyData = useMemo(() => {
    const propertyReviews = reviews.filter(
      (review) => review.listingName === propertyName,
    );

    if (propertyReviews.length === 0) return null;

    const ratingsWithValues = propertyReviews.filter(
      (r) => r.overallRating !== null,
    );
    const averageRating =
      ratingsWithValues.length > 0
        ? ratingsWithValues.reduce((sum, r) => sum + r.overallRating!, 0) /
          ratingsWithValues.length
        : 0;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentReviews = propertyReviews.filter(
      (review) => new Date(review.submittedAt) > thirtyDaysAgo,
    ).length;

    const guestToHostReviews = propertyReviews.filter(
      (r) => r.type === "guest-to-host",
    ).length;
    const hostToGuestReviews = propertyReviews.filter(
      (r) => r.type === "host-to-guest",
    ).length;

    return {
      name: propertyName,
      reviews: propertyReviews,
      averageRating,
      totalReviews: propertyReviews.length,
      recentReviews,
      guestToHostReviews,
      hostToGuestReviews,
    };
  }, [reviews, propertyName]);

  // Calculate trends for property
  const propertyTrends = useMemo(() => {
    if (!propertyData) return [];

    const monthlyData = new Map<string, { total: number; count: number }>();

    propertyData.reviews.forEach((review) => {
      if (review.overallRating) {
        const date = new Date(review.submittedAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, { total: 0, count: 0 });
        }

        const data = monthlyData.get(monthKey)!;
        data.total += review.overallRating;
        data.count += 1;
      }
    });

    return Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month: new Date(month + "-01").toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        averageRating: data.total / data.count,
        reviewCount: data.count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [propertyData]);

  // Calculate category ratings for property
  const categoryRatings = useMemo(() => {
    if (!propertyData) return [];

    const categories = [
      "cleanliness",
      "communication",
      "location",
      "accuracy",
      "check_in",
      "value",
    ];

    return categories.map((category) => {
      const categoryRatings = propertyData.reviews
        .map((review) => review.categories[category])
        .filter((rating) => rating !== undefined) as number[];

      const avgRating =
        categoryRatings.length > 0
          ? categoryRatings.reduce((sum, rating) => sum + rating, 0) /
            categoryRatings.length
          : 0;

      return {
        category: category
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        value: Number(avgRating.toFixed(1)),
      };
    });
  }, [propertyData]);

  // Get filtered reviews for property
  const filteredReviews = useMemo(() => {
    if (!propertyData) return [];
    let filtered = propertyData.reviews;

    // Apply search filter
    if (reviewFilters.searchTerm) {
      const searchLower = reviewFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (review) =>
          review.guestName.toLowerCase().includes(searchLower) ||
          review.comment.toLowerCase().includes(searchLower),
      );
    }

    // Apply type filter
    if (reviewFilters.type !== "all") {
      filtered = filtered.filter(
        (review) => review.type === reviewFilters.type,
      );
    }

    // Apply status filter
    if (reviewFilters.status !== "all") {
      filtered = filtered.filter(
        (review) => review.status === reviewFilters.status,
      );
    }

    return filtered;
  }, [propertyData, reviewFilters]);

  const handleStatusChange = () => {
    // Status change handled by ReviewStatusSelect component
  };

  const exportPropertyReviews = () => {
    if (!propertyData || filteredReviews.length === 0) return;

    const headers = [
      "Guest Name",
      "Type",
      "Rating",
      "Status",
      "Comment",
      "Date",
    ];

    const csvData = filteredReviews.map((review) => [
      review.guestName,
      review.type === "host-to-guest" ? "Host → Guest" : "Guest → Host",
      review.overallRating?.toString() || "",
      review.status,
      `"${review.comment.replace(/"/g, '""')}"`,
      new Date(review.submittedAt).toLocaleDateString("en-US"),
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${propertyName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}-reviews-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearReviewFilters = () => {
    setReviewFilters({
      searchTerm: "",
      type: "all",
      status: "all",
    });
  };

  const hasActiveFilters =
    reviewFilters.searchTerm ||
    reviewFilters.type !== "all" ||
    reviewFilters.status !== "all";

  if (isError) {
    return (
      <DashboardSidebar user={user} reviews={[]}>
        <div className="space-y-6">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard/properties")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Properties
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Error</h1>
            <p className="text-muted-foreground">
              Failed to load property data
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              Error Loading Property Data
            </h2>
            <p className="text-red-700">
              {error?.message ||
                "Failed to load property data. Please try refreshing the page."}
            </p>
          </div>
        </div>
      </DashboardSidebar>
    );
  }

  if (!propertyData && !isLoading) {
    return (
      <DashboardSidebar user={user} reviews={[]}>
        <div className="space-y-6">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard/properties")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Properties
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">
              Property Not Found
            </h1>
            <p className="text-muted-foreground">
              The property &ldquo;{propertyName}&rdquo; could not be found.
            </p>
          </div>

          <Card>
            <CardContent className="flex flex-col items-center justify-center h-48">
              <Building className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Property Not Found</h3>
              <p className="text-muted-foreground text-center">
                This property doesn&apos;t exist or has no reviews yet.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardSidebar>
    );
  }

  return (
    <DashboardSidebar user={user} reviews={filteredReviews}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/properties")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {propertyName}
              </h1>
              <p className="text-muted-foreground">
                Detailed analytics and review management
              </p>
            </div>
            {propertyData && (
              <Badge
                variant={
                  propertyData.averageRating >= 8
                    ? "default"
                    : propertyData.averageRating >= 6
                      ? "secondary"
                      : "destructive"
                }
                className="text-sm"
              >
                {propertyData.averageRating >= 8
                  ? "Excellent"
                  : propertyData.averageRating >= 6
                    ? "Good"
                    : "Needs Attention"}
              </Badge>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : propertyData ? (
          <>
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Rating
                  </CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {propertyData.averageRating.toFixed(1)}/10
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {propertyData.averageRating >= 8 ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {propertyData.averageRating >= 8
                        ? "Excellent performance"
                        : "Needs improvement"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Reviews
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {propertyData.totalReviews}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {propertyData.recentReviews} in last 30 days
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Guest Reviews
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {propertyData.guestToHostReviews}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Guest → Host reviews
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Host Reviews
                  </CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {propertyData.hostToGuestReviews}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Host → Guest reviews
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Rating Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Rating Trends Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={propertyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[0, 10]} />
                      <Tooltip
                        formatter={(value: number) => [
                          `${value.toFixed(1)}/10`,
                          "Average Rating",
                        ]}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="averageRating"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Performance Radar */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Category Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={categoryRatings}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="category" />
                      <PolarRadiusAxis domain={[0, 10]} />
                      <Radar
                        name="Rating"
                        dataKey="value"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.3}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Review Volume */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Monthly Review Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={propertyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [value, "Reviews"]}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Bar dataKey="reviewCount" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Review Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filter Reviews
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-4">
                  {/* Search */}
                  <div>
                    <Label className="text-sm font-medium">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search reviews..."
                        value={reviewFilters.searchTerm}
                        onChange={(e) =>
                          setReviewFilters((prev) => ({
                            ...prev,
                            searchTerm: e.target.value,
                          }))
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Type Filter */}
                  <div>
                    <Label className="text-sm font-medium">Review Type</Label>
                    <Select
                      value={reviewFilters.type}
                      onValueChange={(
                        value: "host-to-guest" | "guest-to-host" | "all",
                      ) =>
                        setReviewFilters((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="host-to-guest">
                          Host → Guest
                        </SelectItem>
                        <SelectItem value="guest-to-host">
                          Guest → Host
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Select
                      value={reviewFilters.status}
                      onValueChange={(
                        value: "published" | "pending" | "draft" | "all",
                      ) =>
                        setReviewFilters((prev) => ({ ...prev, status: value }))
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

                  {/* Actions */}
                  <div className="flex items-end gap-2">
                    {hasActiveFilters && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearReviewFilters}
                      >
                        Clear
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportPropertyReviews}
                      disabled={filteredReviews.length === 0}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Reviews for {propertyName}
                  </div>
                  <Badge variant="outline">
                    {filteredReviews.length} review
                    {filteredReviews.length !== 1 ? "s" : ""}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ReviewsTable
                  reviews={filteredReviews}
                  onStatusChange={handleStatusChange}
                  isLoading={isLoading}
                />

                {!isLoading && filteredReviews.length > 0 && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Review Summary for {propertyName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Showing {filteredReviews.length} of{" "}
                          {propertyData.totalReviews} reviews
                          {hasActiveFilters && " (filtered)"}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
                        <div>
                          Average Rating:{" "}
                          <span className="font-medium">
                            {propertyData.averageRating.toFixed(1)}/10
                          </span>
                        </div>
                        <div>
                          Guest Reviews:{" "}
                          <span className="font-medium">
                            {propertyData.guestToHostReviews}
                          </span>
                        </div>
                        <div>
                          Host Reviews:{" "}
                          <span className="font-medium">
                            {propertyData.hostToGuestReviews}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!isLoading &&
                  filteredReviews.length === 0 &&
                  !hasActiveFilters && (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No Reviews Found
                      </h3>
                      <p className="text-muted-foreground">
                        This property doesn&apos;t have any reviews yet.
                      </p>
                    </div>
                  )}

                {!isLoading &&
                  filteredReviews.length === 0 &&
                  hasActiveFilters && (
                    <div className="text-center py-8">
                      <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No Reviews Match Filters
                      </h3>
                      <p className="text-muted-foreground">
                        Try adjusting your search criteria to see more results.
                      </p>
                      <Button
                        variant="outline"
                        onClick={clearReviewFilters}
                        className="mt-4"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </DashboardSidebar>
  );
}
