"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { useReviews } from "@/hooks/use-reviews";
import { useUpdateReviewStatus } from "@/hooks/use-review-mutations";
import {
  RefreshCw,
  Database,
  Monitor,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Trash2
} from "lucide-react";
import { toast } from "sonner";

interface DebugLog {
  timestamp: string;
  type: "info" | "success" | "error" | "warning";
  component: string;
  message: string;
  data?: any;
}

export function ProductionDebugger() {
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const queryClient = useQueryClient();
  const { reviews, refetch, isLoading } = useReviews({});
  const updateMutation = useUpdateReviewStatus();

  const addLog = (type: DebugLog["type"], component: string, message: string, data?: any) => {
    const log: DebugLog = {
      timestamp: new Date().toISOString(),
      type,
      component,
      message,
      data,
    };
    setLogs(prev => [log, ...prev.slice(0, 49)]); // Keep last 50 logs
  };

  const clearLogs = () => {
    setLogs([]);
    addLog("info", "Debugger", "Logs cleared");
  };

  const getEnvironmentInfo = () => {
    return {
      environment: process.env.NODE_ENV,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      reactQueryVersion: "5.x",
      cacheSize: queryClient.getQueryCache().getAll().length,
      reviewQueries: queryClient.getQueryCache().findAll({ queryKey: ["reviews"] }).length,
    };
  };

  const testCacheInvalidation = async () => {
    if (reviews.length === 0) {
      toast.error("No reviews available for testing");
      return;
    }

    setIsRunningTest(true);
    const testReview = reviews[0];
    const originalStatus = testReview.status;
    const newStatus = originalStatus === "published" ? "pending" : "published";

    addLog("info", "Test", `Starting cache invalidation test on review ${testReview.id}`);
    addLog("info", "Test", `Original status: ${originalStatus}, changing to: ${newStatus}`);

    try {
      // Step 1: Check initial cache state
      const initialQueries = queryClient.getQueryCache().findAll({ queryKey: ["reviews"] });
      addLog("info", "Cache", `Initial cache queries: ${initialQueries.length}`,
        initialQueries.map(q => ({ key: q.queryKey, state: q.state }))
      );

      // Step 2: Update status
      addLog("info", "API", `Calling mutation for review ${testReview.id}`);
      await updateMutation.mutateAsync({
        reviewId: testReview.id,
        status: newStatus as "published" | "pending" | "draft",
      });

      // Step 3: Check cache state after mutation
      const postMutationQueries = queryClient.getQueryCache().findAll({ queryKey: ["reviews"] });
      addLog("success", "Mutation", "Status update completed");
      addLog("info", "Cache", `Post-mutation cache queries: ${postMutationQueries.length}`,
        postMutationQueries.map(q => ({ key: q.queryKey, state: q.state }))
      );

      // Step 4: Wait and check if UI updated
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 5: Force refetch to verify database state
      addLog("info", "Refetch", "Force refetching data...");
      const { data: freshData } = await refetch();

      const updatedReview = freshData?.find((r: any) => r.id === testReview.id);
      const uiReview = reviews.find(r => r.id === testReview.id);

      addLog("info", "Verification", "Checking data consistency", {
        database: updatedReview?.status,
        ui: uiReview?.status,
        expected: newStatus,
      });

      const results = {
        success: updatedReview?.status === newStatus,
        database: updatedReview?.status,
        ui: uiReview?.status,
        expected: newStatus,
        cacheInvalidated: postMutationQueries.length !== initialQueries.length,
        environment: getEnvironmentInfo(),
      };

      setTestResults(results);

      if (results.success) {
        addLog("success", "Test", "Cache invalidation test PASSED");
        toast.success("Cache invalidation test passed!");
      } else {
        addLog("error", "Test", "Cache invalidation test FAILED", results);
        toast.error("Cache invalidation test failed!");
      }

      // Revert the change
      setTimeout(async () => {
        addLog("info", "Test", "Reverting test change...");
        await updateMutation.mutateAsync({
          reviewId: testReview.id,
          status: originalStatus as "published" | "pending" | "draft",
        });
        addLog("success", "Test", "Test reverted successfully");
      }, 2000);

    } catch (error) {
      addLog("error", "Test", "Test failed with error", error);
      toast.error("Test failed: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsRunningTest(false);
    }
  };

  const forceCacheClear = () => {
    addLog("info", "Cache", "Clearing all review caches...");

    // Remove all review queries
    queryClient.removeQueries({ queryKey: ["reviews"] });

    // Invalidate and refetch
    queryClient.invalidateQueries({ queryKey: ["reviews"] });

    addLog("success", "Cache", "Cache cleared and invalidated");
    toast.success("Cache cleared successfully");
  };

  const checkNetworkConnectivity = async () => {
    addLog("info", "Network", "Testing network connectivity...");

    try {
      const response = await fetch("/api/health", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      const data = await response.json();

      if (response.ok) {
        addLog("success", "Network", "API connectivity test passed", data);
      } else {
        addLog("error", "Network", "API connectivity test failed", { status: response.status, data });
      }
    } catch (error) {
      addLog("error", "Network", "Network test failed", error);
    }
  };

  const getLogIcon = (type: DebugLog["type"]) => {
    switch (type) {
      case "info": return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case "success": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error": return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning": return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return null;
    }
  };

  const getLogColor = (type: DebugLog["type"]) => {
    switch (type) {
      case "info": return "border-l-blue-500 bg-blue-50";
      case "success": return "border-l-green-500 bg-green-50";
      case "error": return "border-l-red-500 bg-red-50";
      case "warning": return "border-l-yellow-500 bg-yellow-50";
      default: return "border-l-gray-500 bg-gray-50";
    }
  };

  useEffect(() => {
    addLog("info", "Debugger", "Production debugger initialized", getEnvironmentInfo());
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Production Cache Debugger
            <Badge variant="outline">
              {process.env.NODE_ENV === "production" ? "PRODUCTION" : "DEVELOPMENT"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Environment Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Environment Information</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><strong>Environment:</strong> {process.env.NODE_ENV}</div>
              <div><strong>Cache Queries:</strong> {queryClient.getQueryCache().getAll().length}</div>
              <div><strong>Review Queries:</strong> {queryClient.getQueryCache().findAll({ queryKey: ["reviews"] }).length}</div>
              <div><strong>Reviews Loaded:</strong> {reviews.length}</div>
              <div><strong>Loading:</strong> {isLoading ? "Yes" : "No"}</div>
              <div><strong>Mutation Pending:</strong> {updateMutation.isPending ? "Yes" : "No"}</div>
            </div>
          </div>

          {/* Test Results */}
          {testResults && (
            <div className={`p-4 rounded-lg ${testResults.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                {testResults.success ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                Last Test Results
              </h4>
              <div className="text-sm space-y-1">
                <div><strong>Status:</strong> {testResults.success ? "PASSED" : "FAILED"}</div>
                <div><strong>Expected:</strong> {testResults.expected}</div>
                <div><strong>Database:</strong> {testResults.database}</div>
                <div><strong>UI:</strong> {testResults.ui}</div>
                <div><strong>Cache Invalidated:</strong> {testResults.cacheInvalidated ? "Yes" : "No"}</div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={testCacheInvalidation}
              disabled={isRunningTest || isLoading || reviews.length === 0}
              variant="default"
            >
              {isRunningTest ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
              Test Cache Invalidation
            </Button>

            <Button onClick={forceCacheClear} variant="outline">
              <Trash2 className="h-4 w-4 mr-2" />
              Force Cache Clear
            </Button>

            <Button onClick={checkNetworkConnectivity} variant="outline">
              <Monitor className="h-4 w-4 mr-2" />
              Test Network
            </Button>

            <Button onClick={clearLogs} variant="ghost" size="sm">
              Clear Logs
            </Button>
          </div>
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
                No logs yet. Run some tests to see debugging information.
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
                        <Badge variant="outline" className="text-xs">
                          {log.component}
                        </Badge>
                        <span className="font-medium text-sm">{log.message}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      {log.data && (
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
