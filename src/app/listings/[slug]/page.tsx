"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { ErrorBoundary, ErrorFallback } from "@/components/ErrorBoundary";
import {
  Pagination,
  PaginationInfo,
  usePagination,
} from "@/components/ui/pagination";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  ReviewCardSkeleton,
  PropertyHeaderSkeleton,
  StatCardSkeleton,
} from "@/components/ui/skeleton";
import {
  ListingFilters,
  useListingFilters,
  type FilterOptions,
} from "@/components/ListingFilters";
import { slugToListingName } from "@/lib/utils/slugs";
import { useListingByName } from "@/hooks/use-listings";

export default function ListingPage() {
  const params = useParams();
  const slug = params.slug as string;

  // Decode slug for use with the hook
  const decodedSlug = decodeURIComponent(slug);

  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: "date",
    sortOrder: "desc",
    reviewType: "all",
  });

  // Fetch reviews for this specific listing - pass the slug directly
  const {
    data: reviews = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useListingByName(decodedSlug);

  // Ensure reviews is always an array
  const safeReviews = reviews || [];

  // Apply filters to reviews
  const filteredReviews = useListingFilters(safeReviews, filters);

  // Get available categories for filtering
  const availableCategories = Array.from(
    new Set(
      safeReviews.flatMap((review) => Object.keys(review.categories || {})),
    ),
  );

  // Pagination
  const REVIEWS_PER_PAGE = 5;
  const { currentPage, totalPages, startIndex, endIndex, goToPage } =
    usePagination({
      totalItems: filteredReviews.length,
      itemsPerPage: REVIEWS_PER_PAGE,
      initialPage: 1,
    });

  const paginatedReviews = filteredReviews.slice(startIndex, endIndex);

  // Get listing name from reviews or convert from slug as fallback
  const listingName =
    safeReviews.length > 0
      ? safeReviews[0].listingName
      : slugToListingName(decodedSlug);
  // Calculate stats from reviews
  const rawCategories = safeReviews.reduce(
    (acc, review) => {
      Object.entries(review.categories || {}).forEach(([category, rating]) => {
        if (!acc[category]) acc[category] = [];
        if (rating !== undefined) acc[category].push(rating);
      });
      return acc;
    },
    {} as Record<string, number[]>,
  );

  // Convert category arrays to averages
  const averagedCategories: Record<string, number> = {};
  Object.keys(rawCategories).forEach((category) => {
    const ratings = rawCategories[category];
    if (ratings && ratings.length > 0) {
      averagedCategories[category] =
        ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    }
  });

  const stats =
    safeReviews.length > 0
      ? {
          overall:
            safeReviews.reduce(
              (sum, review) => sum + (review.overallRating || 0),
              0,
            ) / safeReviews.length,
          totalReviews: safeReviews.length,
          categories: averagedCategories,
          reviewTypes: {
            "host-to-guest": safeReviews.filter(
              (r) => r.type === "host-to-guest",
            ).length,
            "guest-to-host": safeReviews.filter(
              (r) => r.type === "guest-to-host",
            ).length,
          },
        }
      : null;

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
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: "All Properties", href: "/" },
            { label: listingName, isActive: true },
          ]}
        />
      </div>

      {/* Header */}
      {isLoading && !listingName ? (
        <PropertyHeaderSkeleton />
      ) : (
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {listingName}
                </h1>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                  Verified Property
                </span>
              </div>
              <p className="text-gray-600 mb-2">
                Guest reviews for this premium London property
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>📍 London, UK</span>
                {stats && (
                  <>
                    <span>★ {stats.overall}/10 overall rating</span>
                    <span>{stats.totalReviews} published reviews</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href="/"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium"
              >
                ← Back to Properties
              </Link>
              <Link
                href="/dashboard"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium"
              >
                Manager Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && safeReviews.length === 0 && (
        <div className="space-y-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-gray-600">
              Loading {listingName} reviews...
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <ReviewCardSkeleton key={i} />
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <ErrorFallback
          error={error as Error}
          onRetry={() => refetch()}
          title="Failed to load reviews"
          description={`We couldn't load reviews for ${listingName}. Please try again.`}
        />
      )}

      {/* Statistics */}
      {stats && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Property Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-medium text-gray-700">Overall Rating</h3>
              <div className="flex items-center mt-1">
                <span className="text-2xl font-bold">{stats.overall}</span>
                <span className="text-sm text-gray-500 ml-1">/10</span>
                <div className="ml-2 flex items-center">
                  {renderStars(stats.overall)}
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-medium text-gray-700">Total Reviews</h3>
              <span className="text-2xl font-bold">{stats.totalReviews}</span>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-medium text-gray-700">Review Types</h3>
              <div className="text-sm">
                <div>
                  Host to Guest: {stats.reviewTypes["host-to-guest"] || 0}
                </div>
                <div>
                  Guest to Host: {stats.reviewTypes["guest-to-host"] || 0}
                </div>
              </div>
            </div>
          </div>

          {Object.keys(stats.categories).length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium text-gray-700 mb-2">
                Category Ratings
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                {Object.entries(stats.categories).map(([category, rating]) => (
                  <div
                    key={category}
                    className="bg-white p-3 rounded text-sm text-center"
                  >
                    <div className="font-medium capitalize text-gray-700 mb-1">
                      {category.replace("_", " ")}
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {typeof rating === "number" && !isNaN(Number(rating))
                        ? Number(rating).toFixed(1)
                        : "N/A"}
                    </div>
                    <div className="text-xs text-gray-500">/10</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reviews */}
      {!isLoading && !isError && (
        <div className="space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h2 className="text-xl font-semibold">
              Guest Reviews ({safeReviews.length})
            </h2>
            {safeReviews.length > 0 && (
              <PaginationInfo
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredReviews.length}
                itemsPerPage={REVIEWS_PER_PAGE}
              />
            )}
          </div>

          {/* Advanced Filters */}
          {safeReviews.length > 0 && (
            <ListingFilters
              onFiltersChange={setFilters}
              reviewCount={filteredReviews.length}
              availableCategories={availableCategories}
              isLoading={isLoading}
            />
          )}

          {/* Pagination Top */}
          {filteredReviews.length > REVIEWS_PER_PAGE && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          )}

          {paginatedReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white border rounded-lg p-6 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{review.guestName}</h3>
                  <div className="flex items-center mt-1 gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        review.type === "host-to-guest"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {review.type === "host-to-guest"
                        ? "Host → Guest"
                        : "Guest → Host"}
                    </span>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                      Published
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(review.submittedAt)}
                    </span>
                  </div>
                </div>

                {review.overallRating && (
                  <div className="text-right">
                    <div className="flex items-center">
                      {renderStars(review.overallRating)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {review.overallRating}/10
                    </div>
                  </div>
                )}
              </div>

              <p className="text-gray-800 mb-4 text-base leading-relaxed">
                &ldquo;{review.comment}&rdquo;
              </p>

              {Object.keys(review.categories).length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-sm text-gray-700 mb-3">
                    Category Ratings:
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {Object.entries(review.categories)
                      .filter(([, rating]) => rating !== undefined)
                      .map(([category, rating]) => (
                        <div
                          key={category}
                          className="bg-gray-50 p-2 rounded text-center"
                        >
                          <div className="capitalize font-medium text-xs text-gray-700 mb-1">
                            {category.replace("_", " ")}
                          </div>
                          <div className="text-sm font-bold text-blue-600">
                            {Number(rating)}/10
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Pagination Bottom */}
          {filteredReviews.length > REVIEWS_PER_PAGE && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
              />
            </div>
          )}

          {filteredReviews.length === 0 &&
            safeReviews.length > 0 &&
            !isLoading &&
            !isError && (
              <div className="text-center py-12 text-gray-500">
                <div className="mb-4 text-4xl">🔍</div>
                <div className="text-lg font-medium mb-2">
                  No reviews match your filters
                </div>
                <div className="text-sm">
                  Try adjusting your filters to see more reviews for{" "}
                  {listingName}
                </div>
                <button
                  onClick={() =>
                    setFilters({
                      sortBy: "date",
                      sortOrder: "desc",
                      reviewType: "all",
                    })
                  }
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}

          {safeReviews.length === 0 && !isLoading && !isError && (
            <div className="text-center py-12 text-gray-500">
              <div className="mb-4 text-4xl">📝</div>
              <div className="text-lg font-medium mb-2">
                No published reviews found
              </div>
              <div className="text-sm">
                Reviews for {listingName} will appear here once they are
                published
              </div>
              <div className="text-xs mt-2 text-gray-400">
                Only verified reviews from actual guests are displayed
              </div>
              <div className="mt-6">
                <Link
                  href="/"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  ← Back to all properties
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      {safeReviews.length > 0 && !isLoading && !isError && (
        <div className="mt-12 pt-6 border-t">
          <div className="text-center">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← View all Flex Living properties
            </Link>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <ErrorBoundary
      fallback={
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Error Loading Property
            </h1>
            <p className="text-gray-600 mb-6">
              We encountered an error while loading{" "}
              {listingName || "this property"}. Please try refreshing the page.
            </p>
            <Link
              href="/"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
            >
              ← Back to Properties
            </Link>
          </div>
        </div>
      }
    >
      {content}
    </ErrorBoundary>
  );
}
