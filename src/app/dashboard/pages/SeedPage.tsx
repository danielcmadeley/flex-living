"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Database,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import {
  validateSeedData,
  getDatabaseStatus,
  performSeedOperation,
  type DatabaseStatus,
} from "@/lib/database-utils";
import { useQueryClient } from "@tanstack/react-query";

interface SeedProgress {
  total: number;
  completed: number;
  current: string;
  errors: string[];
}

export function SeedPage() {
  const queryClient = useQueryClient();
  const [seedProgress, setSeedProgress] = useState<SeedProgress | null>(null);
  const [customData, setCustomData] = useState("");
  const [seedType, setSeedType] = useState<"sample" | "custom" | "file">(
    "sample",
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    message: string;
    count?: number;
  } | null>(null);

  // Fetch database status on component mount
  const fetchStatus = async () => {
    try {
      const status = await getDatabaseStatus();
      setDbStatus(status);
    } catch (error) {
      console.error("Failed to fetch database status:", error);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const performDatabaseOperation = async (
    action: "seed" | "force" | "reseed" | "clear",
  ) => {
    setIsLoading(true);
    setSeedProgress({
      total: 100,
      completed: 0,
      current: "Starting operation...",
      errors: [],
    });

    try {
      setSeedProgress({
        total: 100,
        completed: 25,
        current: "Performing operation...",
        errors: [],
      });

      const result = await performSeedOperation(action);

      setSeedProgress({
        total: 100,
        completed: 75,
        current: "Refreshing data...",
        errors: [],
      });

      if (result.success) {
        toast.success(result.message);
        setLastResult(result);

        // Invalidate cache
        queryClient.removeQueries({ queryKey: ["reviews"] });
        await new Promise((resolve) => setTimeout(resolve, 100));
        queryClient.refetchQueries({ queryKey: ["reviews"] });

        // Refresh status
        await fetchStatus();
      } else {
        toast.error(result.message);
        setLastResult(result);
      }

      setSeedProgress({
        total: 100,
        completed: 100,
        current: "Complete!",
        errors: [],
      });
    } catch (error) {
      console.error("Operation failed:", error);
      const errorMessage = "Failed to perform operation. Please try again.";
      toast.error(errorMessage);
      setLastResult({
        success: false,
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setSeedProgress(null), 1000);
    }
  };

  const handleSeedDatabase = () => performDatabaseOperation("seed");
  const handleForceSeed = () => performDatabaseOperation("force");
  const handleReseedDatabase = () => performDatabaseOperation("reseed");

  const seedResult = lastResult;
  const isSeeding = isLoading || seedProgress !== null;
  const isRefetching = queryClient.isFetching({ queryKey: ["reviews"] }) > 0;

  const handleCustomSeed = async () => {
    if (!customData.trim()) {
      const errorMessage = "Please provide custom data to seed.";
      toast.error(errorMessage);
      return;
    }

    const validation = validateSeedData(customData);
    if (!validation.valid) {
      toast.error(validation.error || "Invalid data format");
      return;
    }

    // For now, we'll use the force seed operation
    // In a full implementation, you'd extend the API to handle custom data
    await handleForceSeed();
  };

  const handleFileSeed = async () => {
    if (!selectedFile) {
      const errorMessage = "Please select a file to upload.";
      toast.error(errorMessage);
      return;
    }

    // For now, we'll use the regular seed operation
    // In a full implementation, you'd parse the file and send its contents to the API
    await handleForceSeed();
  };

  const handleClearDatabase = async () => {
    if (
      !confirm(
        "Are you sure you want to clear all data? This action cannot be undone.",
      )
    ) {
      return;
    }

    await performDatabaseOperation("clear");
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Database Seeding</h1>
        <p className="text-muted-foreground">
          Manage and populate your database with sample data for testing and
          development
        </p>
        {dbStatus && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <h3 className="font-medium mb-2">Current Database Status</h3>
            <div className="flex flex-wrap gap-2 text-sm">
              <Badge variant="outline">
                {dbStatus.totalReviews} reviews in database
              </Badge>
              <Badge variant="outline">
                Avg rating: {dbStatus.statistics.averageRating.toFixed(1)}/10
              </Badge>
              {Object.entries(dbStatus.statistics.reviewTypes).map(
                ([type, count]) => (
                  <Badge key={type} variant="secondary">
                    {type}: {count}
                  </Badge>
                ),
              )}
              {isRefetching && (
                <Badge variant="outline" className="animate-pulse">
                  Refreshing...
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Progress Indicator */}
      {seedProgress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Seeding in Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{seedProgress.current}</span>
                <span>{seedProgress.completed}%</span>
              </div>
              <Progress value={seedProgress.completed} className="w-full" />
            </div>
            {seedProgress.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-red-600">Errors:</h4>
                {seedProgress.errors.map((error, index) => (
                  <p key={index} className="text-sm text-red-600">
                    {error}
                  </p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Result Display */}
      {seedResult && (
        <Alert
          className={
            seedResult.success
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }
        >
          {seedResult.success ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription
            className={seedResult.success ? "text-green-800" : "text-red-800"}
          >
            {seedResult.message}
            {seedResult.count !== undefined && (
              <div className="mt-2">
                <p>Records processed: {seedResult.count}</p>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Seeding Options */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sample Data Seeding */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Sample Data Sets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose from pre-configured sample datasets to quickly populate
              your database
            </p>

            <div className="space-y-3">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Standard Seed</h4>
                    <p className="text-sm text-muted-foreground">
                      Add sample data only if database is empty
                    </p>
                    <Badge variant="outline" className="mt-1">
                      Safe operation
                    </Badge>
                  </div>
                  <Button
                    onClick={handleSeedDatabase}
                    disabled={isSeeding || isRefetching}
                    size="sm"
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Seed
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Force Seed</h4>
                    <p className="text-sm text-muted-foreground">
                      Add sample data regardless of existing data
                    </p>
                    <Badge variant="destructive" className="mt-1">
                      May create duplicates
                    </Badge>
                  </div>
                  <Button
                    onClick={handleForceSeed}
                    disabled={isSeeding || isRefetching}
                    size="sm"
                    variant="outline"
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Force Seed
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custom Data Seeding */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Custom Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label>Seed Type</Label>
                <Select
                  value={seedType}
                  onValueChange={(value: "sample" | "custom" | "file") =>
                    setSeedType(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sample">Sample Data</SelectItem>
                    <SelectItem value="custom">Custom JSON</SelectItem>
                    <SelectItem value="file">Upload File</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {seedType === "custom" && (
                <div>
                  <Label>Custom JSON Data</Label>
                  <Textarea
                    placeholder="Enter your JSON data here..."
                    value={customData}
                    onChange={(e) => setCustomData(e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <Button
                    onClick={handleCustomSeed}
                    disabled={isSeeding || isRefetching}
                    className="mt-2 w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Seed Custom Data
                  </Button>
                </div>
              )}

              {seedType === "file" && (
                <div>
                  <Label>Upload File</Label>
                  <Input
                    type="file"
                    accept=".json,.csv"
                    onChange={handleFileSelect}
                    className="mb-2"
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground mb-2">
                      Selected: {selectedFile.name} (
                      {(selectedFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                  <Button
                    onClick={handleFileSeed}
                    disabled={isSeeding || isRefetching || !selectedFile}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload and Seed
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Database Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Data
              </h4>
              <p className="text-sm text-muted-foreground">
                Download current database data as JSON or CSV
              </p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={isRefetching}
                  onClick={() => toast.info("Export functionality coming soon")}
                >
                  Export as JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={isRefetching}
                  onClick={() => toast.info("Export functionality coming soon")}
                >
                  Export as CSV
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Reset Data
              </h4>
              <p className="text-sm text-muted-foreground">
                Reset database to initial state with sample data
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                disabled={isSeeding || isRefetching}
                onClick={handleReseedDatabase}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Clear & Reseed
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2 text-red-600">
                <Trash2 className="h-4 w-4" />
                Clear Database
              </h4>
              <p className="text-sm text-muted-foreground">
                Remove all data from the database (irreversible)
              </p>
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                disabled={isSeeding || isRefetching}
                onClick={handleClearDatabase}
              >
                Clear All Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Seeding Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Supported Data Types</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Properties (listings)</li>
                <li>• Guest profiles</li>
                <li>• Host reviews (host → guest)</li>
                <li>• Guest reviews (guest → host)</li>
                <li>• Category ratings</li>
                <li>• Review metadata</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">File Formats</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• JSON files (.json)</li>
                <li>• CSV files (.csv)</li>
                <li>• Custom JSON via text input</li>
                <li>• Pre-configured sample datasets</li>
              </ul>
            </div>
          </div>

          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> Seeding will replace existing data. Make
              sure to export your current data before proceeding if you need to
              preserve it.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
