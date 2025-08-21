"use client";

import { ErrorBoundary, ErrorFallback } from "@/components/ErrorBoundary";
import { Header } from "@/components/Header";
import { ListingsPageLoadingState } from "@/components/loading-states";
import { MultiPropertyMap } from "@/components/ui/google-map";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { useListings } from "@/hooks/use-listings";
import { PAGINATION, RATINGS, TEXT_LIMITS } from "@/lib/constants";
import {
  formatCount,
  formatRating,
  renderStars,
  truncateText,
} from "@/lib/utils/formatting";
import { getMainPropertyImage, imageToProps } from "@/lib/utils/images";
import { getAllPropertyLocations } from "@/lib/utils/locations";
import { createListingSlug } from "@/lib/utils/slugs";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Types for map synchronization
interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Declare global google types for TypeScript
declare global {
  interface Window {
    google: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  }
}

export default function ListingsPage() {
  const { listings, isLoading, isError, error, refetch } = useListings();
  const router = useRouter();

  // Map synchronization state
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const [visibleProperties, setVisibleProperties] = useState<string[]>([]);
  const mapInstanceRef = useRef<unknown>(null);

  // Get all property locations
  const allPropertyLocations = getAllPropertyLocations();

  // Filter listings to only show those visible on the map
  const filteredListings = listings.filter(
    (listing) =>
      visibleProperties.length === 0 ||
      visibleProperties.includes(listing.name),
  );

  // Pagination configuration for filtered listings
  const { currentPage, totalPages, startIndex, endIndex, goToPage } =
    usePagination({
      totalItems: filteredListings.length,
      itemsPerPage: PAGINATION.LISTINGS_PER_PAGE,
      initialPage: 1,
    });

  const paginatedListings = filteredListings.slice(startIndex, endIndex);

  // Function to check if a property is within map bounds
  const isPropertyInBounds = useCallback(
    (property: { lat?: number; lng?: number }, bounds: MapBounds): boolean => {
      if (!property.lat || !property.lng) return false;
      return (
        property.lat <= bounds.north &&
        property.lat >= bounds.south &&
        property.lng <= bounds.east &&
        property.lng >= bounds.west
      );
    },
    [],
  );

  // Update visible properties when map bounds change
  useEffect(() => {
    if (mapBounds) {
      const visible = allPropertyLocations
        .filter((location) => isPropertyInBounds(location, mapBounds))
        .map((location) => location.name);
      setVisibleProperties((prev) => {
        // Only update if the arrays are different
        if (
          prev.length !== visible.length ||
          prev.some((name, index) => name !== visible[index])
        ) {
          return visible;
        }
        return prev;
      });
    }
  }, [mapBounds, allPropertyLocations, isPropertyInBounds]);

  // Handle map bounds change
  const handleMapBoundsChange = useCallback((bounds: MapBounds) => {
    setMapBounds((prevBounds) => {
      // Only update if bounds actually changed
      if (
        !prevBounds ||
        prevBounds.north !== bounds.north ||
        prevBounds.south !== bounds.south ||
        prevBounds.east !== bounds.east ||
        prevBounds.west !== bounds.west
      ) {
        return bounds;
      }
      return prevBounds;
    });
  }, []);

  // Handle property selection from map (for navigation only)
  const handlePropertySelect = useCallback(
    (propertyName: string) => {
      // Navigate to property details
      const slug = createListingSlug(propertyName);
      router.push(`/listings/${slug}`);
    },
    [router],
  );

  // Memoize property data to prevent unnecessary re-renders
  const mapProperties = useMemo(
    () =>
      allPropertyLocations.map((location) => ({
        name: location.name,
        lat: location.lat,
        lng: location.lng,
        placeId: location.placeId,
        address: location.address,
        isSelected: selectedProperty === location.name,
        isVisible:
          visibleProperties.length === 0 ||
          visibleProperties.includes(location.name),
      })),
    [allPropertyLocations, selectedProperty, visibleProperties],
  );

  if (isLoading) {
    return <ListingsPageLoadingState />;
  }

  if (isError) {
    return (
      <ErrorBoundary
        fallback={
          <div className="max-w-7xl mx-auto p-6">
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
                      {visibleProperties.length > 0 &&
                      visibleProperties.length < listings.length
                        ? `${filteredListings.length} of ${listings.length} Properties`
                        : `${listings.length} Properties`}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {paginatedListings.map((listing) => {
                    const mainImage = getMainPropertyImage(listing.name);
                    const imageProps = imageToProps(mainImage, {
                      className: "w-full h-48 object-cover rounded-t-lg",
                      loading: "lazy",
                    });

                    return (
                      <div key={listing.name} className="group">
                        <Link
                          href={`/listings/${createListingSlug(listing.name)}`}
                          className="block"
                          onClick={() => setSelectedProperty(listing.name)}
                        >
                          <div
                            className={`bg-white border rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden ${
                              selectedProperty === listing.name
                                ? "ring-2 ring-blue-500 border-blue-300"
                                : ""
                            }`}
                          >
                            {/* Property Image */}
                            <div className="relative">
                              <Image
                                src={imageProps.src}
                                alt={imageProps.alt}
                                width={imageProps.width}
                                height={imageProps.height}
                                className={imageProps.className}
                                loading={imageProps.loading}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = `https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&crop=center&auto=format&q=75`;
                                }}
                              />
                              <div className="absolute top-3 right-3">
                                <span className="px-2 py-1 bg-white/90 text-gray-800 text-xs font-medium rounded-full backdrop-blur-sm">
                                  Premium
                                </span>
                              </div>
                              {selectedProperty === listing.name && (
                                <div className="absolute inset-0 bg-blue-500/10"></div>
                              )}
                            </div>

                            {/* Property Details */}
                            <div className="p-4">
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
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {filteredListings.length > PAGINATION.LISTINGS_PER_PAGE && (
                  <div className="mt-8 flex justify-center">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={goToPage}
                    />
                  </div>
                )}

                {/* Show filtered results info */}
                {visibleProperties.length > 0 &&
                  visibleProperties.length < listings.length && (
                    <div className="mt-4 text-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Showing {filteredListings.length} of {listings.length}{" "}
                        properties in current map view
                      </div>
                    </div>
                  )}
              </>
            )}
          </div>
        </div>

        {/* Right side - Fixed map (1/3 width) */}
        <div className="w-[40%] h-full">
          <MultiPropertyMap
            properties={mapProperties}
            height="100%"
            className="w-full h-full"
            onPropertyClick={handlePropertySelect}
            onBoundsChange={handleMapBoundsChange}
            selectedProperty={selectedProperty}
            mapInstanceRef={mapInstanceRef}
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
