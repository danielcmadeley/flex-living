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
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Error Loading Properties
              </h1>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                We encountered an error while loading the property listings.
                Please try refreshing the page.
              </p>
              <button
                onClick={() => refetch()}
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
          <div className="p-8">
            {/* Header section */}
            <div className="mb-8 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-4 justify-between text-sm mb-6">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="London"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    readOnly
                  />
                </div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Aug 21 - Aug 23"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    readOnly
                  />
                </div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="1 Guest"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    readOnly
                  />
                </div>
                <div className="flex-1">
                  <button className="w-full border border-gray-300 rounded-lg px-4 py-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 hover:text-gray-900">
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Filters
                    </span>
                  </button>
                </div>
              </div>
              <div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Furnished, flexible apartments available for short- to
                  medium-term rent by The Flex. From Covent Garden lofts to
                  Canary Wharf executive suites, our serviced apartments span
                  every neighbourhood in London. Book nightly, weekly, or
                  monthly stays and enjoy expertly designed spaces, high-speed
                  Wi-Fi, fully equipped kitchens and 24/7 local support—your
                  perfect London rental is ready whenever you are.
                </p>
              </div>
            </div>

            {/* Properties Grid */}
            {listings.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <div className="inline-flex items-center justify-center w-20 h-20  rounded-full mb-6">
                  <span className="text-3xl">🏠</span>
                </div>
                <div className="text-xl font-semibold mb-3 text-gray-700">
                  No properties found
                </div>
                <div className="text-gray-500">
                  Properties will appear here once reviews are published
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {paginatedListings.map((listing) => {
                    const mainImage = getMainPropertyImage(listing.name);
                    const imageProps = imageToProps(mainImage, {
                      className: "w-full h-56 object-cover rounded-t-xl",
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
                            className={`bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group-hover:scale-[1.02] ${
                              selectedProperty === listing.name
                                ? "ring-2 ring-blue-500 border-blue-300 shadow-lg"
                                : ""
                            }`}
                          >
                            {/* Property Image */}
                            <div className="relative overflow-hidden">
                              <Image
                                src={imageProps.src}
                                alt={imageProps.alt}
                                width={imageProps.width}
                                height={imageProps.height}
                                className={`${imageProps.className} group-hover:scale-105 transition-transform duration-500`}
                                loading={imageProps.loading}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = `https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&crop=center&auto=format&q=75`;
                                }}
                              />
                              <div className="absolute top-4 right-4">
                                <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-semibold rounded-full shadow-sm">
                                  Premium
                                </span>
                              </div>
                              {selectedProperty === listing.name && (
                                <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-[1px]"></div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>

                            {/* Property Details */}
                            <div className="p-6">
                              <div className="mb-4">
                                <h3 className="font-bold text-xl group-hover:text-blue-600 transition-colors duration-200 mb-3 line-clamp-1">
                                  {listing.name}
                                </h3>
                                <div className="flex items-center gap-4 mb-3">
                                  {listing.averageRating > 0 && (
                                    <div className="flex items-center">
                                      <div className="flex items-center mr-2">
                                        {renderStars(listing.averageRating)}
                                      </div>
                                      <span className="text-sm font-semibold text-gray-900">
                                        {formatRating(listing.averageRating)}/
                                        {RATINGS.MAX_RATING}
                                      </span>
                                    </div>
                                  )}
                                  <span className="text-sm text-gray-500">
                                    {formatCount(listing.reviewCount, "review")}
                                  </span>
                                </div>
                                <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
                                  &ldquo;
                                  {truncateText(
                                    listing.sampleReview,
                                    TEXT_LIMITS.REVIEW_PREVIEW,
                                  )}
                                  &rdquo;
                                </p>
                              </div>
                              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                <div className="flex items-center text-sm text-gray-500">
                                  <svg
                                    className="w-4 h-4 mr-2 text-gray-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  <span>London Property</span>
                                </div>
                                <div className="flex items-center text-blue-600 text-sm font-semibold group-hover:text-blue-700 transition-colors duration-200">
                                  <span>View Reviews</span>
                                  <svg
                                    className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform duration-200"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
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
                  <div className="mt-12 flex justify-center">
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
                    <div className="mt-8 text-center">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200">
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
        <div className="w-[40%] h-full relative">
          <div className="absolute inset-0 rounded-l-2xl overflow-hidden shadow-lg">
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
      </div>

      <div>
        <div className="max-w-6xl mx-auto px-8 py-16">
          {/* Main Content */}
          <div className="mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-8 leading-tight">
              Discover furnished monthly apartments for rent in London
            </h1>

            <div className="space-y-6 text-gray-700 leading-relaxed text-lg">
              <p>
                London&apos;s moods shift by neighbourhood—Regency terraces in
                Primrose Hill, riverside warehouses in Wapping, jazz-filled
                cellars in Soho - so choosing the right furnished apartment for
                rent in London shapes your whole experience. The Flex makes that
                choice simple with a hand-picked range that spans bright studios
                near Liverpool Street for consultants on tight timelines, calm
                one-beds in Battersea for remote workers, and larger homes in
                leafy Highgate for families settling in for a season. Whether
                your agenda calls for a short term flat rental in London, a
                flexible monthly rental in London or a longer serviced stay,
                you&apos;ll find a space that feels like home from the moment
                the key turns.
              </p>

              <p>
                Every reservation bundles the essentials - utilities,
                lightning-speed Wi-Fi, a fully stocked kitchen, premium linens
                and on-call local support - so evenings are for Tate Lates,
                Borough Market picnics or riverside runs, not utility set-up.
                Plans evolving? Your stay can glide into a longer short-term
                lease in London without the chaos of moving or broker fees,
                letting you extend that Thames-side chapter as long as
                opportunity knocks. With The Flex behind the door - no matter
                the postcode - you&apos;re free to script a London life that
                changes as quickly as the city itself.
              </p>
            </div>
          </div>

          {/* FAQ Section */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-10">
              Frequently Asked Questions
            </h2>

            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem
                value="item-1"
                className="border border-gray-200 rounded-xl px-6 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:no-underline py-6 hover:text-blue-600 transition-colors duration-200 bg-transparent">
                  Does The Flex offer both short term and long term rentals in
                  London?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-6 leading-relaxed">
                  Yes, The Flex offers flexible rental options ranging from
                  short-term stays of a few weeks to long-term arrangements
                  spanning several months or more. Our accommodations are
                  designed to adapt to your timeline, whether you need a brief
                  corporate stay or a more extended living arrangement while you
                  settle in London.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-2"
                className="border border-gray-200 rounded-xl px-6 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:no-underline py-6 hover:text-blue-600 transition-colors duration-200 bg-transparent">
                  Can I book a corporate apartment in London?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-6 leading-relaxed">
                  Absolutely. The Flex specializes in corporate housing
                  solutions for businesses of all sizes. We offer fully
                  furnished apartments with business-grade Wi-Fi, flexible lease
                  terms, and dedicated account management to handle multiple
                  bookings, making it simple for companies to accommodate
                  traveling employees, consultants, or teams on temporary
                  assignments.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-3"
                className="border border-gray-200 rounded-xl px-6 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:no-underline py-6 hover:text-blue-600 transition-colors duration-200 bg-transparent">
                  What is included in The Flex&apos;s serviced apartments in
                  London?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-6 leading-relaxed">
                  Every Flex apartment comes fully equipped with utilities,
                  high-speed Wi-Fi, a complete kitchen with appliances and
                  cookware, premium linens and towels, weekly housekeeping, and
                  24/7 local support. You&apos;ll also have access to laundry
                  facilities, and many properties include additional amenities
                  like gyms, concierge services, and communal spaces.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-4"
                className="border border-gray-200  rounded-xl px-6 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 bg-transparent hover:no-underline py-6 hover:text-blue-600 transition-colors duration-200">
                  Can a foreigner rent an apartment in London?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-6 leading-relaxed">
                  Yes, The Flex welcomes international guests and makes the
                  rental process straightforward for foreigners. We handle all
                  the necessary documentation and can assist with references and
                  deposits. Our team understands the unique challenges
                  international residents face and provides support throughout
                  your stay, from arrival to departure.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-5"
                className="border border-gray-200 rounded-xl px-6 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:no-underline py-6 hover:text-blue-600 transition-colors duration-200 bg-transparent">
                  How much is monthly rent in London?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-6 leading-relaxed">
                  Monthly rent varies significantly based on location, size, and
                  amenities. Our studio apartments typically start from £2,500
                  per month, one-bedroom apartments from £3,500, and larger
                  properties from £5,000 and up. Prices include all utilities,
                  services, and amenities, offering excellent value compared to
                  traditional rentals when you factor in the convenience and
                  included services.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );

  return (
    <ErrorBoundary
      fallback={
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
              <svg
                className="w-8 h-8 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Error Loading Properties
            </h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              We encountered an error while loading the property listings.
              Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
