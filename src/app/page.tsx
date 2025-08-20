"use client";

import { useState, useEffect } from "react";
import { NormalizedReview } from "@/lib/types/hostaway";
import Link from "next/link";
import { ErrorBoundary, ErrorFallback } from "@/components/ErrorBoundary";
import {
  ListingCardSkeleton,
  StatCardSkeleton,
} from "@/components/ui/skeleton";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { createListingSlug } from "@/lib/utils/slugs";

interface ReviewsResponse {
  status: "success" | "error";
  data: NormalizedReview[];
  total: number;
  message?: string;
  statistics?: {
    overall: number;
    categories: Record<string, number>;
    totalReviews: number;
    reviewTypes: Record<string, number>;
  };
}

interface ListingSummary {
  name: string;
  reviewCount: number;
  averageRating: number;
  latestReview: Date;
  sampleReview: string;
}

export default function ListingsPage() {
  const [, setReviews] = useState<NormalizedReview[]>([]);
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ReviewsResponse["statistics"] | null>(
    null,
  );
  const [retryCount, setRetryCount] = useState(0);

  // Pagination for listings
  const LISTINGS_PER_PAGE = 6;
  const { currentPage, totalPages, startIndex, endIndex, goToPage } =
    usePagination({
      totalItems: listings.length,
      itemsPerPage: LISTINGS_PER_PAGE,
      initialPage: 1,
    });

  const paginatedListings = listings.slice(startIndex, endIndex);

  const fetchReviews = async (includeStats = false) => {
    setLoading(true);
    setError(null);

    try {
      const url = `/api/reviews/hostaway?status=published${includeStats ? "&includeStats=true" : ""}`;
      const response = await fetch(url);
      const data: ReviewsResponse = await response.json();

      if (data.status === "success") {
        setReviews(data.data);
        if (data.statistics) {
          setStats(data.statistics);
        }

        // Process reviews into listings
        const listingsMap = new Map<
          string,
          {
            reviews: NormalizedReview[];
            totalRating: number;
            ratingCount: number;
          }
        >();

        data.data.forEach((review) => {
          if (!listingsMap.has(review.listingName)) {
            listingsMap.set(review.listingName, {
              reviews: [],
              totalRating: 0,
              ratingCount: 0,
            });
          }

          const listing = listingsMap.get(review.listingName)!;
          listing.reviews.push(review);

          if (review.overallRating) {
            listing.totalRating += review.overallRating;
            listing.ratingCount++;
          }
        });

        const listingSummaries: ListingSummary[] = Array.from(
          listingsMap.entries(),
        )
          .map(([name, data]) => ({
            name,
            reviewCount: data.reviews.length,
            averageRating:
              data.ratingCount > 0 ? data.totalRating / data.ratingCount : 0,
            latestReview: new Date(
              Math.max(
                ...data.reviews.map((r) => new Date(r.submittedAt).getTime()),
              ),
            ),
            sampleReview: data.reviews[0]?.comment || "",
          }))
          .sort((a, b) => b.reviewCount - a.reviewCount);

        setListings(listingSummaries);
      } else {
        setError(data.message || "Failed to fetch reviews");
      }
    } catch (err) {
      setError("Network error occurred");
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(true);
  }, [retryCount]);

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    setError(null);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="text-yellow-400">
          ★
        </span>,
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-yellow-400">
          ☆
        </span>,
      );
    }

    const emptyStars = 10 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-300">
          ☆
        </span>,
      );
    }

    return stars;
  };

  const content = (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                Flex Living Properties
              </h1>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                Public View
              </span>
            </div>
            <p className="text-gray-600 mb-2">
              Explore our premium properties and read guest reviews
            </p>
            <p className="text-sm text-gray-500">
              Quality accommodations across London&apos;s premium locations
            </p>
          </div>
          <a
            href="/dashboard"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Manager Dashboard
          </a>
        </div>
      </div>

      <div className="mb-6 flex gap-4">
        <button
          onClick={() => fetchReviews(true)}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh Properties"}
        </button>

        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2">📍</span>
          {listings.length} properties available
        </div>
      </div>

      {error && (
        <ErrorFallback
          error={new Error(error)}
          onRetry={handleRetry}
          title="Failed to load properties"
          description="We couldn't load the property listings. Please try again."
        />
      )}

      {/* Loading State for Statistics */}
      {loading && !stats ? (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        </div>
      ) : (
        stats && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded shadow">
                <h3 className="font-medium text-gray-700">Properties</h3>
                <span className="text-2xl font-bold">{listings.length}</span>
              </div>

              <div className="bg-white p-4 rounded shadow">
                <h3 className="font-medium text-gray-700">Overall Rating</h3>
                <div className="flex items-center mt-1">
                  <span className="text-2xl font-bold">{stats.overall}</span>
                  <span className="text-sm text-gray-500 ml-1">/10</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded shadow">
                <h3 className="font-medium text-gray-700">Total Reviews</h3>
                <span className="text-2xl font-bold">{stats.totalReviews}</span>
              </div>

              <div className="bg-white p-4 rounded shadow">
                <h3 className="font-medium text-gray-700">
                  Avg Reviews per Property
                </h3>
                <span className="text-2xl font-bold">
                  {listings.length > 0
                    ? Math.round(stats.totalReviews / listings.length)
                    : 0}
                </span>
              </div>
            </div>

            {Object.keys(stats.categories).length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium text-gray-700 mb-2">
                  Category Ratings
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(stats.categories).map(
                    ([category, rating]) => (
                      <div
                        key={category}
                        className="bg-white p-2 rounded text-sm"
                      >
                        <div className="font-medium capitalize">
                          {category.replace("_", " ")}
                        </div>
                        <div className="text-lg font-bold">
                          {typeof rating === "number" ? rating : 0}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
        )
      )}

      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h2 className="text-xl font-semibold">
            Our Properties ({listings.length})
          </h2>
          {listings.length > LISTINGS_PER_PAGE && (
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, listings.length)} of{" "}
              {listings.length} properties
            </div>
          )}
        </div>

        {/* Pagination Top */}
        {listings.length > LISTINGS_PER_PAGE && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        )}

        {/* Loading State for Listings */}
        {loading && listings.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedListings.map((listing) => (
              <Link
                key={listing.name}
                href={`/listings/${createListingSlug(listing.name)}`}
                className="group"
              >
                <div className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                        {listing.name}
                      </h3>
                      <div className="flex items-center mt-2 gap-3">
                        {listing.averageRating > 0 && (
                          <div className="flex items-center">
                            <div className="flex items-center mr-1">
                              {renderStars(listing.averageRating)}
                            </div>
                            <span className="text-sm font-medium">
                              {listing.averageRating.toFixed(1)}/10
                            </span>
                          </div>
                        )}
                        <span className="text-sm text-gray-500">
                          {listing.reviewCount} review
                          {listing.reviewCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div>Latest:</div>
                      <div>{formatDate(listing.latestReview)}</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-600 text-sm line-clamp-2">
                      &ldquo;
                      {listing.sampleReview.length > 100
                        ? listing.sampleReview.substring(0, 100) + "..."
                        : listing.sampleReview}
                      &rdquo;
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="mr-1">📍</span>
                      <span>London Property</span>
                    </div>
                    <div className="text-blue-600 text-sm font-medium group-hover:text-blue-700">
                      View Reviews →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination Bottom */}
        {listings.length > LISTINGS_PER_PAGE && !loading && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          </div>
        )}

        {listings.length === 0 && !loading && !error && (
          <div className="text-center py-12 text-gray-500">
            <div className="mb-4 text-4xl">🏠</div>
            <div className="text-lg font-medium mb-2">No properties found</div>
            <div className="text-sm">
              Properties will appear here once reviews are published
            </div>
            <div className="text-xs mt-2 text-gray-400">
              Only verified properties with published reviews are displayed
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <ErrorBoundary
      fallback={
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Error Loading Properties
            </h1>
            <p className="text-gray-600 mb-6">
              We encountered an error while loading the property listings.
              Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
            >
              Refresh Page
            </button>
          </div>
        </div>
      }
    >
      {content}
    </ErrorBoundary>
  );
}
