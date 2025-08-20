"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ErrorBoundary, ErrorFallback } from "@/components/ErrorBoundary";
import { Header } from "@/components/Header";
import { useListings } from "@/hooks/use-listings";
import { ListingsPageLoadingState } from "@/components/loading-states";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { createListingSlug } from "@/lib/utils/slugs";
import { MultiPropertyMap } from "@/components/ui/google-map";
import { getAllPropertyLocations } from "@/lib/utils/locations";
import {
  formatDate,
  renderStars,
  truncateText,
  formatCount,
  formatRating,
} from "@/lib/utils/formatting";
import { PAGINATION, RATINGS, TEXT_LIMITS } from "@/lib/constants";

export default function ListingsPage() {
  const { listings, statistics, isLoading, isError, error, refetch } =
    useListings();
  const router = useRouter();

  // Pagination configuration
  const { currentPage, totalPages, startIndex, endIndex, goToPage } =
    usePagination({
      totalItems: listings.length,
      itemsPerPage: PAGINATION.LISTINGS_PER_PAGE,
      initialPage: 1,
    });

  const paginatedListings = listings.slice(startIndex, endIndex);

  if (isLoading) {
    return <ListingsPageLoadingState />;
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
    <>
      <Header />
      {/* Full height container below header */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left side - Scrollable properties (2/3 width) */}
        <div className="w-[60%] overflow-y-auto">
          <div className="p-6">
            {/* Header section */}
            <div className="mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                      Flex Living Properties
                    </h1>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                      {listings.length} Properties
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">
                    Explore our premium properties and read guest reviews
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href="/"
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium text-sm"
                  >
                    ← Home
                  </Link>
                  <button
                    onClick={() => refetch()}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50 text-sm"
                  >
                    {isLoading ? "Loading..." : "Refresh"}
                  </button>
                </div>
              </div>
            </div>

            {/* Properties Grid */}
            {listings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="mb-4 text-4xl">🏠</div>
                <div className="text-lg font-medium mb-2">
                  No properties found
                </div>
                <div className="text-sm">
                  Properties will appear here once reviews are published
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paginatedListings.map((listing) => (
                    <Link
                      key={listing.name}
                      href={`/listings/${createListingSlug(listing.name)}`}
                      className="group"
                    >
                      <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer">
                        <div className="mb-3">
                          <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors mb-2">
                            {listing.name}
                          </h3>
                          <div className="flex items-center gap-3 mb-2">
                            {listing.averageRating > 0 && (
                              <div className="flex items-center">
                                <div className="flex items-center mr-1">
                                  {renderStars(listing.averageRating)}
                                </div>
                                <span className="text-sm font-medium">
                                  {formatRating(listing.averageRating)}/
                                  {RATINGS.MAX_RATING}
                                </span>
                              </div>
                            )}
                            <span className="text-sm text-gray-500">
                              {formatCount(listing.reviewCount, "review")}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                            &ldquo;
                            {truncateText(
                              listing.sampleReview,
                              TEXT_LIMITS.REVIEW_PREVIEW,
                            )}
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

                {/* Pagination */}
                {listings.length > PAGINATION.LISTINGS_PER_PAGE && (
                  <div className="mt-8 flex justify-center">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={goToPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right side - Fixed map (1/3 width) */}
        <div className="w-[40%] h-full">
          <MultiPropertyMap
            properties={getAllPropertyLocations().map((location) => ({
              name: location.name,
              lat: location.lat,
              lng: location.lng,
              placeId: location.placeId,
              address: location.address,
            }))}
            height="100%"
            className="w-full h-full"
            onPropertyClick={(propertyName) => {
              const slug = createListingSlug(propertyName);
              router.push(`/listings/${slug}`);
            }}
          />
        </div>
      </div>
    </>
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
