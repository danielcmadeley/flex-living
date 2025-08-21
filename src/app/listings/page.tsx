"use client";

import { ErrorBoundary, ErrorFallback } from "@/components/ErrorBoundary";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

  // Get all property locations (map always shows all locations)
  const allPropertyLocations = getAllPropertyLocations();

  // Filter to only show locations that have database listings
  const databasePropertyLocations = allPropertyLocations.filter((location) =>
    listings.some((listing) => listing.name === location.name),
  );

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
      const visible = databasePropertyLocations
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
  }, [mapBounds, databasePropertyLocations, isPropertyInBounds]);

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

  // Memoize property data to prevent unnecessary re-renders (only database properties)
  const mapProperties = useMemo(
    () =>
      databasePropertyLocations.map((location) => ({
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
    [databasePropertyLocations, selectedProperty, visibleProperties],
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

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Main Content */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Discover furnished monthly apartments for rent in London
          </h1>

          <div className="space-y-6 text-gray-700 leading-relaxed">
            <p>
              London's moods shift by neighbourhood—Regency terraces in Primrose
              Hill, riverside warehouses in Wapping, jazz-filled cellars in Soho
              - so choosing the right furnished apartment for rent in London
              shapes your whole experience. The Flex makes that choice simple
              with a hand-picked range that spans bright studios near Liverpool
              Street for consultants on tight timelines, calm one-beds in
              Battersea for remote workers, and larger homes in leafy Highgate
              for families settling in for a season. Whether your agenda calls
              for a short term flat rental in London, a flexible monthly rental
              in London or a longer serviced stay, you'll find a space that
              feels like home from the moment the key turns.
            </p>

            <p>
              Every reservation bundles the essentials - utilities,
              lightning-speed Wi-Fi, a fully stocked kitchen, premium linens and
              on-call local support - so evenings are for Tate Lates, Borough
              Market picnics or riverside runs, not utility set-up. Plans
              evolving? Your stay can glide into a longer short-term lease in
              London without the chaos of moving or broker fees, letting you
              extend that Thames-side chapter as long as opportunity knocks.
              With The Flex behind the door - no matter the postcode - you're
              free to script a London life that changes as quickly as the city
              itself.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">FAQs</h2>

          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem
              value="item-1"
              className="border border-gray-200 rounded-lg px-6"
            >
              <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:no-underline py-6">
                Does The Flex offer both short term and long term rentals in
                London?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pb-6">
                Yes, The Flex offers flexible rental options ranging from
                short-term stays of a few weeks to long-term arrangements
                spanning several months or more. Our accommodations are designed
                to adapt to your timeline, whether you need a brief corporate
                stay or a more extended living arrangement while you settle in
                London.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-2"
              className="border border-gray-200 rounded-lg px-6"
            >
              <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:no-underline py-6">
                Can I book a corporate apartment in London?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pb-6">
                Absolutely. The Flex specializes in corporate housing solutions
                for businesses of all sizes. We offer fully furnished apartments
                with business-grade Wi-Fi, flexible lease terms, and dedicated
                account management to handle multiple bookings, making it simple
                for companies to accommodate traveling employees, consultants,
                or teams on temporary assignments.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-3"
              className="border border-gray-200 rounded-lg px-6"
            >
              <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:no-underline py-6">
                What is included in The Flex's serviced apartments in London?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pb-6">
                Every Flex apartment comes fully equipped with utilities,
                high-speed Wi-Fi, a complete kitchen with appliances and
                cookware, premium linens and towels, weekly housekeeping, and
                24/7 local support. You'll also have access to laundry
                facilities, and many properties include additional amenities
                like gyms, concierge services, and communal spaces.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-4"
              className="border border-gray-200 rounded-lg px-6"
            >
              <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:no-underline py-6">
                Can a foreigner rent an apartment in London?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pb-6">
                Yes, The Flex welcomes international guests and makes the rental
                process straightforward for foreigners. We handle all the
                necessary documentation and can assist with references and
                deposits. Our team understands the unique challenges
                international residents face and provides support throughout
                your stay, from arrival to departure.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-5"
              className="border border-gray-200 rounded-lg px-6"
            >
              <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:no-underline py-6">
                How much is monthly rent in London?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pb-6">
                Monthly rent varies significantly based on location, size, and
                amenities. Our studio apartments typically start from £2,500 per
                month, one-bedroom apartments from £3,500, and larger properties
                from £5,000 and up. Prices include all utilities, services, and
                amenities, offering excellent value compared to traditional
                rentals when you factor in the convenience and included
                services.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
      <Footer />
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
