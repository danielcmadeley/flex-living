"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  RefreshCw,
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";

interface SeedingResult {
  success: boolean;
  message: string;
  count?: number;
}

export function DatabaseSeeder() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SeedingResult | null>(null);
  const [currentCount, setCurrentCount] = useState<number | null>(null);

  const performAction = async (action: string, description: string) => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch(`/api/seed?action=${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      setResult({
        success: data.success,
        message: data.message,
        count: data.count,
      });

      // Refresh count after any action
      await getCurrentCount();
    } catch (error) {
      setResult({
        success: false,
        message: `Failed to ${description.toLowerCase()}: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentCount = async () => {
    try {
      const response = await fetch("/api/seed", { method: "GET" });
      const data = await response.json();

      if (data.success) {
        setCurrentCount(data.data.totalReviews);
      }
    } catch (error) {
      console.error("Failed to get current count:", error);
    }
  };

  // Load current count on component mount
  useState(() => {
    getCurrentCount();
  });

  const actions = [
    {
      id: "count",
      label: "Check Count",
      description: "Get current review count",
      icon: <Info className="h-4 w-4" />,
      variant: "outline" as const,
      action: () => performAction("count", "Check count"),
    },
    {
      id: "seed",
      label: "Smart Seed",
      description: "Seed only if database is empty",
      icon: <Plus className="h-4 w-4" />,
      variant: "default" as const,
      action: () => performAction("seed", "Seed database"),
    },
    {
      id: "force",
      label: "Force Seed",
      description: "Add 100 reviews (ignores existing data)",
      icon: <Database className="h-4 w-4" />,
      variant: "secondary" as const,
      action: () => performAction("force", "Force seed"),
    },
    {
      id: "reseed",
      label: "Clear & Reseed",
      description: "Clear all data and add fresh 100 reviews",
      icon: <RefreshCw className="h-4 w-4" />,
      variant: "destructive" as const,
      action: () => performAction("reseed", "Clear and reseed"),
    },
    {
      id: "clear",
      label: "Clear All",
      description: "Remove all reviews from database",
      icon: <Trash2 className="h-4 w-4" />,
      variant: "destructive" as const,
      action: () => performAction("clear", "Clear database"),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Management
        </CardTitle>
        {currentCount !== null && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Current reviews:
            </span>
            <Badge variant="outline">{currentCount}</Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Action Buttons */}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((action) => (
            <div key={action.id} className="space-y-1">
              <Button
                onClick={action.action}
                disabled={isLoading}
                variant={action.variant}
                className="w-full justify-start"
                size="sm"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  action.icon
                )}
                {action.label}
              </Button>
              <p className="text-xs text-muted-foreground px-2">
                {action.description}
              </p>
            </div>
          ))}
        </div>

        {/* Result Display */}
        {result && (
          <div
            className={`rounded-lg border p-4 ${result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
          >
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <div
                className={result.success ? "text-green-800" : "text-red-800"}
              >
                {result.message}
                {result.count !== undefined && result.count > 0 && (
                  <span className="font-medium"> ({result.count} reviews)</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • <strong>Smart Seed:</strong> Only adds data if database is empty
            </li>
            <li>
              • <strong>Force Seed:</strong> Adds 100 new reviews regardless of
              existing data
            </li>
            <li>
              • <strong>Clear & Reseed:</strong> Recommended for fresh start
              with exactly 100 reviews
            </li>
            <li>
              • <strong>Clear All:</strong> Removes all review data (use with
              caution)
            </li>
          </ul>
        </div>

        {/* Current Status */}
        <div className="rounded-lg bg-gray-50 p-4 border">
          <h4 className="font-medium text-gray-900 mb-2">Database Status:</h4>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span>Total Reviews:</span>
              <Badge variant="outline">
                {currentCount !== null ? currentCount : "Loading..."}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Mock Data Available:</span>
              <Badge variant="secondary">100 reviews</Badge>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <Badge
                variant={
                  currentCount === 100
                    ? "default"
                    : currentCount === 0
                      ? "destructive"
                      : "secondary"
                }
              >
                {currentCount === 0
                  ? "Empty"
                  : currentCount === 100
                    ? "Fully Seeded"
                    : `Partially Seeded (${currentCount})`}
              </Badge>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {currentCount !== null && (
          <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-200">
            <h4 className="font-medium text-yellow-900 mb-2">
              Recommendation:
            </h4>
            <p className="text-sm text-yellow-800">
              {currentCount === 0
                ? "Use 'Smart Seed' or 'Force Seed' to add the 100 mock reviews."
                : currentCount < 100
                  ? "Use 'Force Seed' to add more reviews, or 'Clear & Reseed' for exactly 100 reviews."
                  : currentCount === 100
                    ? "Database is properly seeded! No action needed."
                    : "You have more than 100 reviews. Use 'Clear & Reseed' if you want exactly 100 mock reviews."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
