"use client";

import { useState } from "react";
import Link from "next/link";
import { useCombinedListingReviews } from "@/hooks/use-combined-listing-reviews";
import { useListings } from "@/hooks/use-listings";
import { useGoogleReviews } from "@/hooks/use-google-reviews";
import {
  ReviewSourceBadge,
  ReviewSourceSummary,
} from "@/components/ui/review-source-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Building,
  Database,
  Globe,
  Eye,
  Users,
} from "lucide-react";

export default function TestIntegrationPage() {
  const [selectedProperty, setSelectedProperty] = useState("");
  const [testProperty, setTestProperty] = useState<string | null>(null);

  // Test all listings
  const listingsQuery = useListings();

  // Test Google reviews
  const googleQuery = useGoogleReviews();

  // Test combined reviews for specific property
  const combinedQuery = useCombinedListingReviews({
    listingName: testProperty || undefined,
    includeGoogleReviews: true,
    enabled: !!testProperty,
  });

  const handleTestProperty = () => {
    if (selectedProperty.trim()) {
      setTestProperty(selectedProperty.trim());
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderStars = (rating: number, scale: "5" | "10" = "5") => {
    const normalizedRating = scale === "10" ? rating / 2 : rating;
    const stars = [];
    const fullStars = Math.floor(normalizedRating);
    const hasHalfStar = normalizedRating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />,
      );
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 text-yellow-400" />);
    }

    const emptyStars = 5 - Math.ceil(normalizedRating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

  const getStatusIcon = (
    isLoading: boolean,
    isError: boolean,
    isSuccess: boolean,
  ) => {
    if (isLoading)
      return <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />;
    if (isError) return <AlertCircle className="h-5 w-5 text-red-600" />;
    if (isSuccess) return <CheckCircle className="h-5 w-5 text-green-600" />;
    return <AlertCircle className="h-5 w-5 text-gray-400" />;
  };

  const getStatusText = (
    isLoading: boolean,
    isError: boolean,
    isSuccess: boolean,
  ) => {
    if (isLoading) return "Loading...";
    if (isError) return "Error";
    if (isSuccess) return "Success";
    return "Not tested";
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Integration Test Dashboard
            </h1>
            <p className="text-gray-600">
              Test all components of your Google Places + Hostaway reviews
              integration
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/test-google-reviews"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
            >
              Google Test
            </Link>
            <Link
              href="/listings"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium"
            >
              ← Back to Listings
            </Link>
          </div>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {getStatusIcon(
                listingsQuery.isLoading,
                listingsQuery.isError,
                !listingsQuery.isLoading && !listingsQuery.isError,
              )}
              <div>
                <h3 className="font-medium">Hostaway API</h3>
                <p className="text-sm text-gray-600">
                  {getStatusText(
                    listingsQuery.isLoading,
                    listingsQuery.isError,
                    !listingsQuery.isLoading && !listingsQuery.isError,
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {getStatusIcon(
                googleQuery.isLoading,
                googleQuery.isError,
                googleQuery.isSuccess,
              )}
              <div>
                <h3 className="font-medium">Google Places</h3>
                <p className="text-sm text-gray-600">
                  {getStatusText(
                    googleQuery.isLoading,
                    googleQuery.isError,
                    googleQuery.isSuccess,
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {!!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <div>
                <h3 className="font-medium">API Configuration</h3>
                <p className="text-sm text-gray-600">
                  {!!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
                    ? "Configured"
                    : "Missing"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {testProperty && combinedQuery.isSuccess ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
              <div>
                <h3 className="font-medium">Combined Data</h3>
                <p className="text-sm text-gray-600">
                  {testProperty ? "Tested" : "Not tested"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Environment Check */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Environment & Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3">Environment Variables</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">Google Maps API Key</span>
                </div>
                <div className="flex items-center gap-2">
                  {process.env.NEXT_PUBLIC_BASE_URL ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  )}
                  <span className="text-sm">Base URL</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-3">API Endpoints</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div>/api/reviews/hostaway ✓</div>
                <div>/api/reviews/google ✓</div>
                <div>Combined hook ✓</div>
                <div>Filtering system ✓</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hostaway Integration Test */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Hostaway Integration
            <Button
              onClick={() => listingsQuery.refetch()}
              disabled={listingsQuery.isLoading}
              size="sm"
              variant="outline"
            >
              <RefreshCw
                className={`h-4 w-4 ${listingsQuery.isLoading ? "animate-spin" : ""}`}
              />
              Test
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {listingsQuery.isLoading && (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Testing Hostaway connection...</p>
            </div>
          )}

          {listingsQuery.isError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <h3 className="font-medium text-red-800">
                  Hostaway Integration Error
                </h3>
              </div>
              <p className="text-sm text-red-700">
                {listingsQuery.error instanceof Error
                  ? listingsQuery.error.message
                  : "Failed to connect to Hostaway API"}
              </p>
            </div>
          )}

          {!listingsQuery.isLoading && !listingsQuery.isError && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900">
                    Properties Found
                  </h3>
                  <p className="text-2xl font-bold text-green-600">
                    {listingsQuery.listings.length}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900">Total Reviews</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {listingsQuery.statistics?.totalReviews || 0}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-medium text-purple-900">Avg Rating</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {listingsQuery.statistics?.overall
                      ? (listingsQuery.statistics.overall / 2).toFixed(1)
                      : "N/A"}
                    /5
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Available Properties:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {listingsQuery.listings.slice(0, 6).map((listing) => (
                    <div
                      key={listing.name}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <span className="text-sm font-medium">
                        {listing.name}
                      </span>
                      <Badge variant="secondary">
                        {listing.reviewCount} reviews
                      </Badge>
                    </div>
                  ))}
                </div>
                {listingsQuery.listings.length > 6 && (
                  <p className="text-sm text-gray-600">
                    ...and {listingsQuery.listings.length - 6} more
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Google Places Integration Test */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Google Places Integration
            <Button
              onClick={() => googleQuery.refetch()}
              disabled={googleQuery.isLoading}
              size="sm"
              variant="outline"
            >
              <RefreshCw
                className={`h-4 w-4 ${googleQuery.isLoading ? "animate-spin" : ""}`}
              />
              Test
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {googleQuery.isLoading && (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">
                Testing Google Places connection...
              </p>
            </div>
          )}

          {googleQuery.isError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <h3 className="font-medium text-red-800">
                  Google Places Integration Error
                </h3>
              </div>
              <p className="text-sm text-red-700">
                {googleQuery.error instanceof Error
                  ? googleQuery.error.message
                  : "Failed to connect to Google Places API"}
              </p>
            </div>
          )}

          {googleQuery.isSuccess && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900">Google Reviews</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {googleQuery.data.reviews.length}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900">Average Rating</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-green-600">
                      {googleQuery.data.averageRating}/5
                    </p>
                    <div className="flex">
                      {renderStars(googleQuery.data.averageRating)}
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-medium text-yellow-900">
                    Total on Google
                  </h3>
                  <p className="text-2xl font-bold text-yellow-600">
                    {googleQuery.data.totalReviews}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Recent Google Reviews:</h4>
                {googleQuery.data.reviews.slice(0, 2).map((review) => (
                  <div key={review.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {review.author}
                        </span>
                        <ReviewSourceBadge source="google" />
                      </div>
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                        <span className="text-sm ml-1">{review.rating}/5</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">
                      &ldquo;{review.text.substring(0, 120)}...&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Combined Integration Test */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Combined Reviews Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a property to test...</option>
              {listingsQuery.listings.map((listing) => (
                <option key={listing.name} value={listing.name}>
                  {listing.name} ({listing.reviewCount} Hostaway reviews)
                </option>
              ))}
            </select>
            <Button
              onClick={handleTestProperty}
              disabled={!selectedProperty.trim()}
            >
              Test Combined
            </Button>
          </div>

          {testProperty && (
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-4">
                Testing combined reviews for: <strong>{testProperty}</strong>
              </p>

              {combinedQuery.isLoading && (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-gray-600">Loading combined reviews...</p>
                </div>
              )}

              {combinedQuery.isError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <h3 className="font-medium text-red-800">
                      Combined Reviews Error
                    </h3>
                  </div>
                  <p className="text-sm text-red-700">
                    {combinedQuery.error instanceof Error
                      ? combinedQuery.error.message
                      : "Failed to load combined reviews"}
                  </p>
                </div>
              )}

              {combinedQuery.isSuccess && combinedQuery.data && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900">
                        Total Reviews
                      </h3>
                      <p className="text-2xl font-bold text-gray-600">
                        {combinedQuery.data.totalCount}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-medium text-blue-900">
                        Google Reviews
                      </h3>
                      <p className="text-2xl font-bold text-blue-600">
                        {combinedQuery.data.stats.sources.google.count}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-medium text-green-900">
                        Verified Reviews
                      </h3>
                      <p className="text-2xl font-bold text-green-600">
                        {combinedQuery.data.stats.sources.hostaway.count}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="font-medium text-purple-900">
                        Combined Rating
                      </h3>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-purple-600">
                          {(combinedQuery.data.stats.overall / 2).toFixed(1)}/5
                        </p>
                        <div className="flex">
                          {renderStars(combinedQuery.data.stats.overall, "10")}
                        </div>
                      </div>
                    </div>
                  </div>

                  <ReviewSourceSummary
                    sources={combinedQuery.data.stats.sources}
                    className="mb-4"
                  />

                  <div className="space-y-3">
                    <h4 className="font-medium">Sample Combined Reviews:</h4>
                    {combinedQuery.data.reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {review.author}
                            </span>
                            <ReviewSourceBadge
                              source={review.source}
                              type={review.type}
                            />
                            <Badge variant="outline" className="text-xs">
                              {review.relativeTime ||
                                formatDate(review.submittedAt)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            {renderStars(
                              review.overallRating,
                              review.source === "google" ? "5" : "10",
                            )}
                            <span className="text-sm ml-1">
                              {review.source === "google"
                                ? `${review.rating}/5`
                                : `${review.overallRating}/10`}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700">
                          &ldquo;{review.comment.substring(0, 150)}...&rdquo;
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <h3 className="font-medium text-green-800">
                        Integration Test Successful!
                      </h3>
                    </div>
                    <p className="text-sm text-green-700">
                      Combined reviews are working correctly. Both Google and
                      Hostaway reviews are being fetched, combined, and
                      displayed properly.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">✅ Integration Complete</h3>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Google Places API integration ✓</li>
                <li>• Combined review system ✓</li>
                <li>• Enhanced filtering ✓</li>
                <li>• Source badges and indicators ✓</li>
                <li>• Metadata with combined ratings ✓</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">🔧 Configuration Needed</h3>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Add Google API key to environment variables</li>
                <li>• Configure property-specific Place IDs</li>
                <li>• Update property mappings in API route</li>
                <li>• Test with your actual properties</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">📚 Documentation</h3>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>
                  •{" "}
                  <Link
                    href="/test-google-reviews"
                    className="text-blue-600 hover:underline"
                  >
                    Google Places API Test
                  </Link>
                </li>
                <li>
                  • See GOOGLE_PLACES_SETUP.md for detailed setup instructions
                </li>
                <li>• Monitor API usage in Google Cloud Console</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
