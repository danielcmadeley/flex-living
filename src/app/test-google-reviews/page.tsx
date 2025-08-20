"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  useGoogleReviews,
  useDefaultGoogleReviews,
} from "@/hooks/use-google-reviews";
import { ReviewSourceBadge } from "@/components/ui/review-source-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Star,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

export default function TestGoogleReviewsPage() {
  const [propertyName, setPropertyName] = useState("");
  const [testProperty, setTestProperty] = useState<string | null>(null);

  // Test default Google reviews
  const defaultQuery = useDefaultGoogleReviews();

  // Test property-specific Google reviews
  const propertyQuery = useGoogleReviews({
    propertyName: testProperty || undefined,
    enabled: !!testProperty,
  });

  const handleTestProperty = () => {
    if (propertyName.trim()) {
      setTestProperty(propertyName.trim());
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />,
      );
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 text-yellow-400" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Google Places API Test
            </h1>
            <p className="text-gray-600">
              Test your Google Places API integration and verify reviews are
              loading correctly
            </p>
          </div>
          <Link
            href="/listings"
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium"
          >
            ← Back to Listings
          </Link>
        </div>
      </div>

      {/* Environment Check */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Environment Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <span>
                Google Maps API Key:{" "}
                {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
                  ? "Configured"
                  : "Missing"}
              </span>
            </div>
          </div>
          {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Setup Required:</strong> Add your Google Maps API key to
                your environment variables. See GOOGLE_PLACES_SETUP.md for
                detailed instructions.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Default Property Test */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Default Property Reviews
            <Button
              onClick={() => defaultQuery.refetch()}
              disabled={defaultQuery.isFetching}
              size="sm"
              variant="outline"
            >
              {defaultQuery.isFetching ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {defaultQuery.isLoading && (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">
                Loading default property reviews...
              </p>
            </div>
          )}

          {defaultQuery.isError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <h3 className="font-medium text-red-800">
                  Error Loading Reviews
                </h3>
              </div>
              <p className="text-sm text-red-700">
                {defaultQuery.error instanceof Error
                  ? defaultQuery.error.message
                  : "Failed to load Google reviews"}
              </p>
            </div>
          )}

          {defaultQuery.isSuccess && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900">Total Reviews</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {defaultQuery.data.totalReviews}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900">Average Rating</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-green-600">
                      {defaultQuery.data.averageRating}/5
                    </p>
                    <div className="flex">
                      {renderStars(defaultQuery.data.averageRating)}
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-medium text-purple-900">Reviews Shown</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {defaultQuery.data.reviews.length}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {defaultQuery.data.reviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        {review.authorPhoto && (
                          <Image
                            src={review.authorPhoto}
                            alt={review.author}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full"
                          />
                        )}
                        <div>
                          <h4 className="font-medium">{review.author}</h4>
                          <div className="flex items-center gap-2">
                            <ReviewSourceBadge source="google" />
                            <Badge variant="outline" className="text-xs">
                              {review.relativeTime}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating)}
                        </div>
                        <p className="text-sm text-gray-600">
                          {review.rating}/5
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-800 text-sm leading-relaxed">
                      &ldquo;
                      {review.text.length > 200
                        ? review.text.substring(0, 200) + "..."
                        : review.text}
                      &rdquo;
                    </p>
                  </div>
                ))}

                {defaultQuery.data.reviews.length > 3 && (
                  <p className="text-sm text-gray-600 text-center">
                    ... and {defaultQuery.data.reviews.length - 3} more reviews
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Property-Specific Test */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Property-Specific Reviews Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              type="text"
              placeholder="Enter property name to test..."
              value={propertyName}
              onChange={(e) => setPropertyName(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleTestProperty}
              disabled={!propertyName.trim()}
            >
              Test Property
            </Button>
          </div>

          {testProperty && (
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-4">
                Testing property: <strong>{testProperty}</strong>
              </p>

              {propertyQuery.isLoading && (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-gray-600">Loading property reviews...</p>
                </div>
              )}

              {propertyQuery.isError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <h3 className="font-medium text-red-800">
                      Error Loading Property Reviews
                    </h3>
                  </div>
                  <p className="text-sm text-red-700">
                    {propertyQuery.error instanceof Error
                      ? propertyQuery.error.message
                      : "Failed to load property reviews"}
                  </p>
                </div>
              )}

              {propertyQuery.isSuccess && (
                <div>
                  <div className="bg-gray-50 rounded-md p-4 mb-4">
                    <h3 className="font-medium mb-2">API Response Summary:</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Property:</span>
                        <br />
                        <span className="font-medium">
                          {propertyQuery.data.propertyName}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Place ID:</span>
                        <br />
                        <span className="font-mono text-xs bg-gray-200 px-1 rounded">
                          {propertyQuery.data.placeId || "Not found"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Reviews:</span>
                        <br />
                        <span className="font-medium">
                          {propertyQuery.data.totalReviews}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Shown:</span>
                        <br />
                        <span className="font-medium">
                          {propertyQuery.data.reviews.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {propertyQuery.data.reviews.length > 0 ? (
                    <div className="space-y-3">
                      {propertyQuery.data.reviews.slice(0, 2).map((review) => (
                        <div key={review.id} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm">
                                {review.author}
                              </h4>
                              <Badge variant="secondary" className="text-xs">
                                {review.language}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              {renderStars(review.rating)}
                              <span className="text-sm ml-1">
                                {review.rating}/5
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700">
                            &ldquo;{review.text.substring(0, 150)}...&rdquo;
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No reviews found for this property</p>
                      <p className="text-sm">
                        This might mean the property name doesn&apos;t match any
                        configured Place ID
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium mb-2">1. Environment Variables</h3>
              <p className="text-gray-600 mb-2">
                Add to your{" "}
                <code className="bg-gray-100 px-1 rounded">.env.local</code>:
              </p>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                {`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
GOOGLE_PLACE_ID=your_default_place_id
# Add property-specific place IDs as needed`}
              </pre>
            </div>

            <div>
              <h3 className="font-medium mb-2">
                2. Configure Property Mappings
              </h3>
              <p className="text-gray-600">
                Update the{" "}
                <code className="bg-gray-100 px-1 rounded">
                  GOOGLE_PLACE_IDS
                </code>{" "}
                mapping in{" "}
                <code className="bg-gray-100 px-1 rounded">
                  /src/app/api/reviews/google/route.ts
                </code>
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">3. Documentation</h3>
              <p className="text-gray-600">
                See{" "}
                <code className="bg-gray-100 px-1 rounded">
                  GOOGLE_PLACES_SETUP.md
                </code>{" "}
                for detailed setup instructions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debug Info */}
      {process.env.NODE_ENV === "development" && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
              {JSON.stringify(
                {
                  environment: process.env.NODE_ENV,
                  hasApiKey: !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
                  defaultQuery: {
                    isLoading: defaultQuery.isLoading,
                    isError: defaultQuery.isError,
                    isSuccess: defaultQuery.isSuccess,
                    dataLength: defaultQuery.data?.reviews?.length || 0,
                  },
                  propertyQuery: testProperty
                    ? {
                        property: testProperty,
                        isLoading: propertyQuery.isLoading,
                        isError: propertyQuery.isError,
                        isSuccess: propertyQuery.isSuccess,
                        dataLength: propertyQuery.data?.reviews?.length || 0,
                      }
                    : null,
                },
                null,
                2,
              )}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
