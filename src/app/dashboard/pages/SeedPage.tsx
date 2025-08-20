"use client";

import { useState } from "react";
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

interface SeedProgress {
  total: number;
  completed: number;
  current: string;
  errors: string[];
}

interface SeedResult {
  success: boolean;
  message: string;
  data?: {
    properties: number;
    reviews: number;
    guests: number;
  };
}

export function SeedPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedProgress, setSeedProgress] = useState<SeedProgress | null>(null);
  const [seedResult, setSeedResult] = useState<SeedResult | null>(null);
  const [customData, setCustomData] = useState("");
  const [seedType, setSeedType] = useState<"sample" | "custom" | "file">(
    "sample",
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const sampleDataSets = [
    {
      id: "basic",
      name: "Basic Sample Data",
      description: "10 properties with 50 reviews each",
      estimatedRecords: 500,
    },
    {
      id: "comprehensive",
      name: "Comprehensive Dataset",
      description: "25 properties with varied review patterns",
      estimatedRecords: 1250,
    },
    {
      id: "large",
      name: "Large Dataset",
      description: "100 properties with realistic data distribution",
      estimatedRecords: 5000,
    },
  ];

  const handleSeedDatabase = async (_datasetId?: string) => {
    setIsSeeding(true);
    setSeedProgress({
      total: 100,
      completed: 0,
      current: "Initializing...",
      errors: [],
    });
    setSeedResult(null);

    try {
      // Simulate seeding process
      const steps = [
        "Clearing existing data...",
        "Creating properties...",
        "Generating guest profiles...",
        "Creating reviews...",
        "Setting up relationships...",
        "Finalizing data...",
      ];

      for (let i = 0; i < steps.length; i++) {
        setSeedProgress((prev) =>
          prev
            ? {
                ...prev,
                completed: Math.round(((i + 1) / steps.length) * 100),
                current: steps[i],
              }
            : null,
        );

        // Simulate processing time
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 + Math.random() * 2000),
        );
      }

      setSeedResult({
        success: true,
        message: "Database seeded successfully!",
        data: {
          properties: Math.floor(Math.random() * 50) + 10,
          reviews: Math.floor(Math.random() * 1000) + 500,
          guests: Math.floor(Math.random() * 200) + 100,
        },
      });
    } catch (_error) {
      setSeedResult({
        success: false,
        message: "Failed to seed database. Please try again.",
      });
    } finally {
      setIsSeeding(false);
      setSeedProgress(null);
    }
  };

  const handleCustomSeed = async () => {
    if (!customData.trim()) {
      setSeedResult({
        success: false,
        message: "Please provide custom data to seed.",
      });
      return;
    }

    try {
      JSON.parse(customData);
      await handleSeedDatabase("custom");
    } catch (_error) {
      setSeedResult({
        success: false,
        message: "Invalid JSON format. Please check your data.",
      });
    }
  };

  const handleFileSeed = async () => {
    if (!selectedFile) {
      setSeedResult({
        success: false,
        message: "Please select a file to upload.",
      });
      return;
    }

    await handleSeedDatabase("file");
  };

  const handleClearDatabase = async () => {
    if (
      !confirm(
        "Are you sure you want to clear all data? This action cannot be undone.",
      )
    ) {
      return;
    }

    setIsSeeding(true);
    setSeedProgress({
      total: 100,
      completed: 0,
      current: "Clearing database...",
      errors: [],
    });

    try {
      // Simulate clearing process
      for (let i = 0; i <= 100; i += 10) {
        setSeedProgress((prev) =>
          prev
            ? {
                ...prev,
                completed: i,
                current: i === 100 ? "Database cleared" : "Removing data...",
              }
            : null,
        );
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      setSeedResult({
        success: true,
        message: "Database cleared successfully!",
      });
    } catch (_error) {
      setSeedResult({
        success: false,
        message: "Failed to clear database.",
      });
    } finally {
      setIsSeeding(false);
      setSeedProgress(null);
    }
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
            {seedResult.data && (
              <div className="mt-2 space-y-1">
                <p>Properties created: {seedResult.data.properties}</p>
                <p>Reviews generated: {seedResult.data.reviews}</p>
                <p>Guest profiles: {seedResult.data.guests}</p>
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
              {sampleDataSets.map((dataset) => (
                <div key={dataset.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{dataset.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {dataset.description}
                      </p>
                      <Badge variant="outline" className="mt-1">
                        ~{dataset.estimatedRecords} records
                      </Badge>
                    </div>
                    <Button
                      onClick={() => handleSeedDatabase(dataset.id)}
                      disabled={isSeeding}
                      size="sm"
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Seed
                    </Button>
                  </div>
                </div>
              ))}
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
                    disabled={isSeeding}
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
                    disabled={isSeeding || !selectedFile}
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
                <Button variant="outline" size="sm" className="w-full">
                  Export as JSON
                </Button>
                <Button variant="outline" size="sm" className="w-full">
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
                disabled={isSeeding}
                onClick={() => handleSeedDatabase("basic")}
              >
                Reset to Sample
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
                disabled={isSeeding}
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
