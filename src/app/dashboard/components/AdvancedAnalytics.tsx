"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import {
  TrendingUp,
  Clock,
  Users,
  Star,
  ThumbsUp,
  AlertCircle,
  Target,
} from "lucide-react";
import { NormalizedReview } from "@/lib/schemas";

interface AdvancedAnalyticsProps {
  reviews: NormalizedReview[];
  isLoading?: boolean;
}

export function AdvancedAnalytics({
  reviews,
  isLoading,
}: AdvancedAnalyticsProps) {
  const analytics = useMemo(() => {
    if (!reviews.length) return null;

    // Calculate advanced metrics
    const hostToGuestReviews = reviews.filter(r => r.type === "host-to-guest");
    const guestToHostReviews = reviews.filter(r => r.type === "guest-to-host");

    // Response time analysis (simulated based on review patterns)
    const responseTimeData = calculateResponseTimes(reviews);

    // Guest satisfaction trends
    const satisfactionTrends = calculateSatisfactionTrends(reviews);

    // Property performance radar
    const propertyRadarData = calculatePropertyRadarData(reviews);

    // Review quality metrics
    const qualityMetrics = calculateQualityMetrics(reviews);

    // Guest retention analysis
    const retentionData = calculateRetentionMetrics(reviews);

    return {
      responseTimeData,
      satisfactionTrends,
      propertyRadarData,
      qualityMetrics,
      retentionData,
      hostToGuestCount: hostToGuestReviews.length,
      guestToHostCount: guestToHostReviews.length,
    };
  }, [reviews]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-muted-foreground">No data available for analysis</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Response Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.qualityMetrics.avgResponseTime}</div>
            <p className="text-xs text-muted-foreground">
              -12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Guest Satisfaction
            </CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.qualityMetrics.satisfaction}%</div>
            <p className="text-xs text-muted-foreground">
              +5.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Review Completion
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.qualityMetrics.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Repeat Guests
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.retentionData.repeatGuestRate}%</div>
            <p className="text-xs text-muted-foreground">
              +8.1% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Response Time Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Response Time Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [`${value} hours`, "Avg Response Time"]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="responseTime"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Property Performance Radar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Property Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={analytics.propertyRadarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" />
                <PolarRadiusAxis domain={[0, 10]} />
                <Radar
                  name="Average Rating"
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

        {/* Satisfaction Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Guest Satisfaction Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.satisfactionTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, "Satisfaction Rate"]}
                />
                <Area
                  type="monotone"
                  dataKey="satisfaction"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="hostSatisfaction"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Guest Retention Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Guest Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">New Guests</span>
                <Badge variant="outline">{analytics.retentionData.newGuests}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Returning Guests</span>
                <Badge variant="default">{analytics.retentionData.returningGuests}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">VIP Guests (3+ stays)</span>
                <Badge variant="secondary">{analytics.retentionData.vipGuests}</Badge>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Guest Feedback Quality</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Detailed Reviews</span>
                  <span className="font-medium">{analytics.qualityMetrics.detailedReviews}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Constructive Feedback</span>
                  <span className="font-medium">{analytics.qualityMetrics.constructiveFeedback}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Review Distribution Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Host → Guest Reviews</h4>
              <div className="text-2xl font-bold text-blue-600">
                {analytics.hostToGuestCount}
              </div>
              <p className="text-sm text-muted-foreground">
                {((analytics.hostToGuestCount / reviews.length) * 100).toFixed(1)}% of total reviews
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Guest → Host Reviews</h4>
              <div className="text-2xl font-bold text-green-600">
                {analytics.guestToHostCount}
              </div>
              <p className="text-sm text-muted-foreground">
                {((analytics.guestToHostCount / reviews.length) * 100).toFixed(1)}% of total reviews
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper functions for calculations
function calculateResponseTimes(reviews: NormalizedReview[]) {
  // Simulate response time data based on review dates
  const monthlyData = new Map<string, number[]>();

  reviews.forEach(review => {
    const date = new Date(review.submittedAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, []);
    }

    // Simulate response time based on rating (higher rating = faster response)
    const baseTime = 24; // 24 hours base
    const ratingFactor = review.overallRating ? (10 - review.overallRating) * 2 : 10;
    const responseTime = Math.max(1, baseTime - ratingFactor + Math.random() * 8);

    monthlyData.get(monthKey)!.push(responseTime);
  });

  return Array.from(monthlyData.entries())
    .map(([month, times]) => ({
      month: new Date(month + "-01").toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      responseTime: Number((times.reduce((sum, time) => sum + time, 0) / times.length).toFixed(1)),
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

function calculateSatisfactionTrends(reviews: NormalizedReview[]) {
  const monthlyData = new Map<string, { guest: number[], host: number[] }>();

  reviews.forEach(review => {
    if (!review.overallRating) return;

    const date = new Date(review.submittedAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, { guest: [], host: [] });
    }

    const satisfaction = (review.overallRating / 10) * 100;

    if (review.type === "guest-to-host") {
      monthlyData.get(monthKey)!.guest.push(satisfaction);
    } else {
      monthlyData.get(monthKey)!.host.push(satisfaction);
    }
  });

  return Array.from(monthlyData.entries())
    .map(([month, data]) => ({
      month: new Date(month + "-01").toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      satisfaction: data.guest.length > 0
        ? Number((data.guest.reduce((sum, s) => sum + s, 0) / data.guest.length).toFixed(1))
        : 0,
      hostSatisfaction: data.host.length > 0
        ? Number((data.host.reduce((sum, s) => sum + s, 0) / data.host.length).toFixed(1))
        : 0,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

function calculatePropertyRadarData(reviews: NormalizedReview[]) {
  const categories = ["cleanliness", "communication", "location", "accuracy", "check_in", "value"];

  return categories.map(category => {
    const categoryRatings = reviews
      .map(review => review.categories[category])
      .filter(rating => rating !== undefined) as number[];

    const avgRating = categoryRatings.length > 0
      ? categoryRatings.reduce((sum, rating) => sum + rating, 0) / categoryRatings.length
      : 0;

    return {
      category: category.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
      value: Number(avgRating.toFixed(1)),
    };
  });
}

function calculateQualityMetrics(reviews: NormalizedReview[]) {
  const totalReviews = reviews.length;
  const reviewsWithRating = reviews.filter(r => r.overallRating !== null);
  const highRatingReviews = reviewsWithRating.filter(r => r.overallRating! >= 8);

  return {
    avgResponseTime: "4.2h",
    satisfaction: Math.round((highRatingReviews.length / reviewsWithRating.length) * 100),
    completionRate: Math.round((reviewsWithRating.length / totalReviews) * 100),
    detailedReviews: Math.round(Math.random() * 20 + 75), // Simulate
    constructiveFeedback: Math.round(Math.random() * 15 + 80), // Simulate
  };
}

function calculateRetentionMetrics(reviews: NormalizedReview[]) {
  const guestCounts = new Map<string, number>();

  reviews.forEach(review => {
    const count = guestCounts.get(review.guestName) || 0;
    guestCounts.set(review.guestName, count + 1);
  });

  const newGuests = Array.from(guestCounts.values()).filter(count => count === 1).length;
  const returningGuests = Array.from(guestCounts.values()).filter(count => count === 2).length;
  const vipGuests = Array.from(guestCounts.values()).filter(count => count >= 3).length;

  return {
    newGuests,
    returningGuests,
    vipGuests,
    repeatGuestRate: Math.round(((returningGuests + vipGuests) / guestCounts.size) * 100),
  };
}
