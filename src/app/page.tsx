"use client";

import Link from "next/link";
import { ErrorBoundary, ErrorFallback } from "@/components/ErrorBoundary";
import { useFeaturedListings } from "@/hooks/use-listings";
import { HomePageLoadingState } from "@/components/loading-states";
import { createListingSlug } from "@/lib/utils/slugs";

export default function HomePage() {
  const { listings, isLoading, isError, error, refetch } =
    useFeaturedListings(6);

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

  if (isLoading) {
    return <HomePageLoadingState />;
  }

  if (isError) {
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
                onClick={() => refetch()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        }
      >
        <ErrorFallback
          error={error as Error}
          onRetry={() => refetch()}
          title="Failed to load properties"
          description="We couldn't load the property listings. Please try again."
        />
      </ErrorBoundary>
    );
  }

  const content = (
    <div className="max-w-6xl mx-auto p-6">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Flex Living
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          Premium accommodations across London&apos;s finest locations
        </p>
        <p className="text-gray-500">
          Discover exceptional stays with outstanding guest reviews
        </p>
      </div>

      {/* Featured Properties Section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Featured Properties
          </h2>
          <Link
            href="/listings"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            View All Properties →
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="mb-4 text-4xl">🏠</div>
            <div className="text-lg font-medium mb-2">
              No properties available
            </div>
            <div className="text-sm">
              Properties will appear here once reviews are published
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
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
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <Link
          href="/listings"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-medium transition-colors"
        >
          Explore All Properties
        </Link>
      </div>

      {/* Additional Info */}
      <div className="mt-12 text-center">
        <p className="text-gray-500 text-sm">
          Property manager?{" "}
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Access your dashboard
          </Link>
        </p>
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
