"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, BarChart3 } from "lucide-react";
import { NormalizedReview } from "@/lib/schemas";

interface PerformanceChartsProps {
  reviews: NormalizedReview[];
  isLoading?: boolean;
}

export function PerformanceCharts({
  reviews,
  isLoading,
}: PerformanceChartsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Prepare data for charts
  const monthlyData = prepareMonthlyData(reviews);
  const propertyData = preparePropertyData(reviews);
  const categoryData = prepareCategoryData(reviews);
  const statusData = prepareStatusData(reviews);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Monthly Rating Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
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

      {/* Property Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Property Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={propertyData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 10]} />
              <YAxis dataKey="property" type="category" width={100} />
              <Tooltip
                formatter={(value: number) => [
                  `${value.toFixed(1)}/10`,
                  "Average Rating",
                ]}
              />
              <Bar dataKey="averageRating" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Category Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="category"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis domain={[0, 10]} />
              <Tooltip
                formatter={(value: number) => [
                  `${value.toFixed(1)}/10`,
                  "Average Rating",
                ]}
              />
              <Bar dataKey="averageRating" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Review Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Review Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${((percent || 0) * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {statusData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getStatusColor(entry.status)}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper functions to prepare chart data
function prepareMonthlyData(reviews: NormalizedReview[]) {
  const monthlyMap = new Map<string, { total: number; count: number }>();

  reviews.forEach((review) => {
    if (review.overallRating) {
      const date = new Date(review.submittedAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { total: 0, count: 0 });
      }

      const data = monthlyMap.get(monthKey)!;
      data.total += review.overallRating;
      data.count += 1;
    }
  });

  return Array.from(monthlyMap.entries())
    .map(([month, data]) => ({
      month: new Date(month + "-01").toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      averageRating: data.total / data.count,
      count: data.count,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

function preparePropertyData(reviews: NormalizedReview[]) {
  const propertyMap = new Map<string, { total: number; count: number }>();

  reviews.forEach((review) => {
    if (review.overallRating) {
      if (!propertyMap.has(review.listingName)) {
        propertyMap.set(review.listingName, { total: 0, count: 0 });
      }

      const data = propertyMap.get(review.listingName)!;
      data.total += review.overallRating;
      data.count += 1;
    }
  });

  return Array.from(propertyMap.entries())
    .map(([property, data]) => ({
      property:
        property.length > 15 ? property.substring(0, 15) + "..." : property,
      averageRating: data.total / data.count,
      count: data.count,
    }))
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 10); // Top 10 properties
}

function prepareCategoryData(reviews: NormalizedReview[]) {
  const categoryMap = new Map<string, { total: number; count: number }>();

  reviews.forEach((review) => {
    Object.entries(review.categories).forEach(([category, rating]) => {
      if (rating !== undefined) {
        if (!categoryMap.has(category)) {
          categoryMap.set(category, { total: 0, count: 0 });
        }

        const data = categoryMap.get(category)!;
        data.total += rating;
        data.count += 1;
      }
    });
  });

  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category: category
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      averageRating: data.total / data.count,
      count: data.count,
    }))
    .sort((a, b) => b.averageRating - a.averageRating);
}

function prepareStatusData(reviews: NormalizedReview[]) {
  const statusMap = new Map<string, number>();

  reviews.forEach((review) => {
    const count = statusMap.get(review.status) || 0;
    statusMap.set(review.status, count + 1);
  });

  return Array.from(statusMap.entries()).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    count,
  }));
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "published":
      return "#10b981";
    case "pending":
      return "#f59e0b";
    case "draft":
      return "#6b7280";
    default:
      return "#8b5cf6";
  }
}
