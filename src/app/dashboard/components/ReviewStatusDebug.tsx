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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Bug, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface DebugLog {
  timestamp: string;
  type: "request" | "response" | "error" | "info";
  message: string;
  data?: unknown;
}

export function ReviewStatusDebug() {
  const [reviewId, setReviewId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    "published" | "pending" | "draft"
  >("published");
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [currentReview, setCurrentReview] = useState<{
    id: number;
    status: string;
    type: string;
    rating: number | null;
    guestName: string;
    listingName: string;
    updatedAt: string;
  } | null>(null);

  const addLog = (type: DebugLog["type"], message: string, data?: unknown) => {
    const log: DebugLog = {
      timestamp: new Date().toISOString(),
      type,
      message,
      data,
    };
    setLogs((prev) => [log, ...prev]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const fetchReview = async () => {
    if (!reviewId) {
      toast.error("Please enter a review ID");
      return;
    }

    setIsLoading(true);
    addLog("info", `Fetching review ${reviewId}...`);

    try {
      const response = await fetch(`/api/reviews/${reviewId}`);
      const result = await response.json();

      addLog("request", `GET /api/reviews/${reviewId}`, {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
      });

      addLog("response", `Response received`, result);

      if (response.ok) {
        setCurrentReview(result.data);
        setSelectedStatus(result.data.status);
        toast.success("Review fetched successfully");
      } else {
        toast.error(result.message || "Failed to fetch review");
        addLog("error", `Fetch failed: ${result.message}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      addLog("error", `Network error: ${errorMessage}`, error);
      toast.error(`Network error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async () => {
    if (!reviewId) {
      toast.error("Please enter a review ID");
      return;
    }

    setIsLoading(true);
    addLog(
      "info",
      `Updating review ${reviewId} status to ${selectedStatus}...`,
    );

    try {
      const requestBody = { status: selectedStatus };

      addLog("request", `PATCH /api/reviews/${reviewId}`, requestBody);

      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      addLog("response", `Response received`, {
        status: response.status,
        data: result,
      });

      if (response.ok) {
        setCurrentReview(result.data);
        toast.success(`Status updated to ${selectedStatus}`);
        addLog("info", `Successfully updated status to ${selectedStatus}`);
      } else {
        toast.error(result.message || "Failed to update status");
        addLog("error", `Update failed: ${result.message}`, result);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      addLog("error", `Network error: ${errorMessage}`, error);
      toast.error(`Network error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testAllStatuses = async () => {
    if (!reviewId) {
      toast.error("Please enter a review ID");
      return;
    }

    const statuses: Array<"published" | "pending" | "draft"> = [
      "published",
      "pending",
      "draft",
    ];

    for (const status of statuses) {
      setSelectedStatus(status);
      await new Promise((resolve) => setTimeout(resolve, 500)); // Small delay
      await updateStatus();
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay between tests
    }
  };

  const getLogIcon = (type: DebugLog["type"]) => {
    switch (type) {
      case "request":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case "response":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "info":
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getLogColor = (type: DebugLog["type"]) => {
    switch (type) {
      case "request":
        return "border-l-blue-500 bg-blue-50";
      case "response":
        return "border-l-green-500 bg-green-50";
      case "error":
        return "border-l-red-500 bg-red-50";
      case "info":
        return "border-l-gray-500 bg-gray-50";
      default:
        return "border-l-gray-300 bg-gray-50";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Review Status API Debug Tool
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Review ID
              </label>
              <Input
                type="number"
                placeholder="Enter review ID"
                value={reviewId}
                onChange={(e) => setReviewId(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select
                value={selectedStatus}
                onValueChange={(value) =>
                  setSelectedStatus(value as "published" | "pending" | "draft")
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button
                onClick={fetchReview}
                disabled={isLoading || !reviewId}
                variant="outline"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Fetch"
                )}
              </Button>
              <Button onClick={updateStatus} disabled={isLoading || !reviewId}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Update"
                )}
              </Button>
            </div>
          </div>

          {/* Advanced Controls */}
          <div className="flex gap-2 pt-2 border-t">
            <Button
              onClick={testAllStatuses}
              disabled={isLoading || !reviewId}
              variant="secondary"
            >
              Test All Statuses
            </Button>
            <Button onClick={clearLogs} variant="outline" size="sm">
              Clear Logs
            </Button>
          </div>

          {/* Current Review Display */}
          {currentReview && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Current Review Data:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">ID:</span>{" "}
                  {String(currentReview.id)}
                </div>
                <div>
                  <span className="font-medium">Status:</span>{" "}
                  <Badge
                    variant={
                      currentReview.status === "published"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {String(currentReview.status)}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Type:</span>{" "}
                  {String(currentReview.type)}
                </div>
                <div>
                  <span className="font-medium">Rating:</span>{" "}
                  {currentReview.rating ? String(currentReview.rating) : "N/A"}
                </div>
                <div>
                  <span className="font-medium">Guest:</span>{" "}
                  {String(currentReview.guestName)}
                </div>
                <div>
                  <span className="font-medium">Property:</span>{" "}
                  {String(currentReview.listingName)}
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Updated:</span>{" "}
                  {new Date(String(currentReview.updatedAt)).toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Debug Logs
            <Badge variant="outline">{logs.length} entries</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No logs yet. Try fetching or updating a review.
              </p>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className={`p-3 border-l-4 rounded-r ${getLogColor(log.type)}`}
                >
                  <div className="flex items-start gap-3">
                    {getLogIcon(log.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {log.message}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      {log.data != null && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                            View data
                          </summary>
                          <Textarea
                            className="mt-2 text-xs font-mono"
                            value={JSON.stringify(log.data, null, 2)}
                            readOnly
                            rows={6}
                          />
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
