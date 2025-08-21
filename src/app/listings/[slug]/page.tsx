"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { ErrorBoundary, ErrorFallback } from "@/components/ErrorBoundary";
import { Header } from "@/components/Header";
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
  CombinedListingFilters,
  useCombinedListingFilters,
  type CombinedFilterOptions,
} from "@/components/CombinedListingFilters";
import {
  ReviewSourceBadge,
  ReviewSourceSummary,
} from "@/components/ui/review-source-badge";
import { slugToListingName } from "@/lib/utils/slugs";
import { useCombinedListingReviews } from "@/hooks/use-combined-listing-reviews";
import { PropertyMap } from "@/components/ui/google-map";
import { getPropertyLocation } from "@/lib/utils/locations";
import { getAllPropertyImages, imageToProps } from "@/lib/utils/images";

export default function ListingPage() {
  const params = useParams();
  const slug = params.slug as string;

  // Decode slug for use with the hook
  const decodedSlug = decodeURIComponent(slug);

  const [filters, setFilters] = useState<CombinedFilterOptions>({
    sortBy: "date",
    sortOrder: "desc",
    reviewType: "all",
    sourceFilter: "all",
  });

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

  // Fetch combined reviews for this specific listing
  const {
    data: combinedData,
    isLoading,
    isError,
    error,
  } = useCombinedListingReviews({
    listingName: slugToListingName(decodedSlug),
    includeGoogleReviews: true,
    enabled: !!decodedSlug,
  });

  const reviews = combinedData?.reviews || [];
  const stats = combinedData?.stats;

  // Apply filters to reviews
  const filteredReviews = useCombinedListingFilters(reviews, filters);

  // Get available categories and languages for filtering
  const availableCategories = Array.from(
    new Set(reviews.flatMap((review) => Object.keys(review.categories || {}))),
  );

  const availableLanguages = Array.from(
    new Set(reviews.map((review) => review.language).filter(Boolean)),
  ) as string[];

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
    combinedData?.propertyName ||
    (reviews.length > 0
      ? reviews[0].listingName
      : slugToListingName(decodedSlug));

  // Get property images
  const propertyImages = getAllPropertyImages(listingName);

  // Keyboard navigation for image gallery
  useEffect(() => {
    if (!showImageModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          setSelectedImageIndex((prev) => Math.max(0, prev - 1));
          break;
        case "ArrowRight":
          e.preventDefault();
          setSelectedImageIndex((prev) =>
            Math.min(propertyImages.length - 1, prev + 1),
          );
          break;
        case "Escape":
          e.preventDefault();
          setShowImageModal(false);
          break;
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          e.preventDefault();
          const index = parseInt(e.key) - 1;
          if (index < propertyImages.length) {
            setSelectedImageIndex(index);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showImageModal, propertyImages.length]);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const normalizedRating = rating > 5 ? rating / 2 : rating; // Handle both 1-5 and 1-10 scales
    const fullStars = Math.floor(normalizedRating);
    const hasHalfStar = normalizedRating % 1 !== 0;

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

    const emptyStars = 5 - Math.ceil(normalizedRating);
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
    <>
      <Header />
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
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span>📍 London, UK</span>
                  {stats && (
                    <>
                      <span>
                        ★ {(stats.overall / 2).toFixed(1)}/5 overall rating
                      </span>
                      <span>{stats.totalReviews} total reviews</span>
                    </>
                  )}
                </div>
                {stats && (
                  <ReviewSourceSummary
                    sources={stats.sources}
                    className="mt-2"
                  />
                )}
              </div>
              <div className="flex gap-2">
                <Link
                  href="/listings"
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
        {isLoading && reviews.length === 0 && (
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
            onRetry={() => window.location.reload()}
            title="Failed to load reviews"
            description={`We couldn't load reviews for ${listingName}. Please try again.`}
          />
        )}

        {/* Enhanced Statistics */}
        {stats && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Property Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded shadow">
                <h3 className="font-medium text-gray-700">Overall Rating</h3>
                <div className="flex items-center mt-1">
                  <span className="text-2xl font-bold">
                    {(stats.overall / 2).toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">/5</span>
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
                <h3 className="font-medium text-gray-700">Google Reviews</h3>
                <div className="text-sm">
                  <div className="text-lg font-bold text-blue-600">
                    {stats.sources.google.count}
                  </div>
                  {stats.sources.google.averageRating > 0 && (
                    <div className="text-xs text-gray-500">
                      Avg: {(stats.sources.google.averageRating / 2).toFixed(1)}
                      /5
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white p-4 rounded shadow">
                <h3 className="font-medium text-gray-700">Verified Guests</h3>
                <div className="text-sm">
                  <div className="text-lg font-bold text-green-600">
                    {stats.sources.hostaway.count}
                  </div>
                  {stats.sources.hostaway.averageRating > 0 && (
                    <div className="text-xs text-gray-500">
                      Avg:{" "}
                      {(stats.sources.hostaway.averageRating / 2).toFixed(1)}
                      /5
                    </div>
                  )}
                </div>
              </div>
            </div>

            {Object.keys(stats.categories).length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium text-gray-700 mb-2">
                  Category Ratings (from verified guests)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                  {Object.entries(stats.categories).map(
                    ([category, rating]) => (
                      <div
                        key={category}
                        className="bg-white p-3 rounded text-sm text-center"
                      >
                        <div className="font-medium capitalize text-gray-700 mb-1">
                          {category.replace("_", " ")}
                        </div>
                        <div className="text-lg font-bold text-blue-600">
                          {typeof rating === "number" && !isNaN(Number(rating))
                            ? (Number(rating) / 2).toFixed(1)
                            : "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">/5</div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Property Image Gallery */}
        {propertyImages && propertyImages.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 md:p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Property Gallery</h2>
              <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full">
                {propertyImages.length} Photos
              </span>
            </div>

            {/* Main Image Display */}
            <div className="mb-4 md:mb-6">
              <div className="relative group">
                <Image
                  src={propertyImages[selectedImageIndex].url}
                  alt={propertyImages[selectedImageIndex].alt}
                  width={800}
                  height={600}
                  className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg cursor-pointer transition-transform group-hover:scale-[1.02]"
                  onClick={() => setShowImageModal(true)}
                  priority={selectedImageIndex === 0}
                />
                <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                  {selectedImageIndex + 1} / {propertyImages.length}
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="bg-white/90 text-gray-800 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                    🔍 Click to enlarge
                  </span>
                </div>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 mb-4">
              {propertyImages.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative aspect-square overflow-hidden rounded-md transition-all hover:scale-105 ${
                    selectedImageIndex === index
                      ? "ring-2 ring-blue-500 ring-offset-2 scale-105"
                      : "hover:opacity-80"
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={image.alt}
                    width={100}
                    height={100}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {index === 0 && (
                    <div className="absolute top-1 left-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-1.5 py-0.5 rounded text-xs font-medium shadow-sm">
                      Main
                    </div>
                  )}
                  {selectedImageIndex === index && (
                    <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Image Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={() =>
                  setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))
                }
                disabled={selectedImageIndex === 0}
                className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                ← Previous
              </button>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-800">
                  {propertyImages[selectedImageIndex].alt}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Click image for full size • Use ← → keys
                </div>
              </div>
              <button
                onClick={() =>
                  setSelectedImageIndex(
                    Math.min(propertyImages.length - 1, selectedImageIndex + 1),
                  )
                }
                disabled={selectedImageIndex === propertyImages.length - 1}
                className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Image Modal */}
        {showImageModal && (
          <div
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setShowImageModal(false)}
          >
            <div
              className="relative max-w-6xl w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70 p-3 rounded-full backdrop-blur-sm transition-colors z-10"
                title="Close (Esc)"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Image Counter */}
              <div className="absolute top-4 left-4 bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-sm z-10">
                <div className="flex items-center gap-2">
                  <span>
                    {selectedImageIndex + 1} of {propertyImages.length}
                  </span>
                  {selectedImageIndex === 0 && (
                    <span className="bg-blue-500 px-2 py-1 rounded text-xs">
                      Main
                    </span>
                  )}
                </div>
              </div>

              {/* Main Modal Image */}
              <div className="relative max-h-full max-w-full flex items-center justify-center">
                <Image
                  src={propertyImages[selectedImageIndex].url}
                  alt={propertyImages[selectedImageIndex].alt}
                  width={propertyImages[selectedImageIndex].width || 800}
                  height={propertyImages[selectedImageIndex].height || 600}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
              </div>

              {/* Image Caption */}
              <div className="absolute bottom-4 left-4 bg-black/60 text-white px-4 py-2 rounded-lg backdrop-blur-sm max-w-md">
                <div className="font-medium">
                  {propertyImages[selectedImageIndex].alt}
                </div>
                <div className="text-sm text-gray-300 mt-1">
                  {listingName} • Photo {selectedImageIndex + 1}
                </div>
              </div>

              {/* Navigation Arrows */}
              <div className="absolute inset-y-0 left-4 flex items-center">
                <button
                  onClick={() =>
                    setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))
                  }
                  disabled={selectedImageIndex === 0}
                  className="bg-black/50 text-white p-4 rounded-full hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-sm transition-all hover:scale-110"
                  title="Previous image (←)"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
              </div>

              <div className="absolute inset-y-0 right-4 flex items-center">
                <button
                  onClick={() =>
                    setSelectedImageIndex(
                      Math.min(
                        propertyImages.length - 1,
                        selectedImageIndex + 1,
                      ),
                    )
                  }
                  disabled={selectedImageIndex === propertyImages.length - 1}
                  className="bg-black/50 text-white p-4 rounded-full hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-sm transition-all hover:scale-110"
                  title="Next image (→)"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>

              {/* Thumbnail Strip */}
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 max-w-4xl w-full px-4">
                <div className="flex gap-2 overflow-x-auto pb-2 justify-center">
                  {propertyImages.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden transition-all ${
                        selectedImageIndex === index
                          ? "ring-2 ring-white ring-offset-2 ring-offset-black/50 opacity-100 scale-110"
                          : "opacity-60 hover:opacity-80 hover:scale-105"
                      }`}
                      title={`Image ${index + 1}: ${image.alt} (Press ${index + 1})`}
                    >
                      <Image
                        src={image.url}
                        alt={image.alt}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                      {index < 9 && (
                        <div className="absolute top-0.5 right-0.5 bg-black/70 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                          {index + 1}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Property Location Map */}
        {stats && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Property Location</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PropertyMap
                  propertyName={listingName}
                  height="400px"
                  className="rounded-lg shadow-sm"
                  showDirectionsLink={true}
                />
              </div>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded shadow">
                  <h3 className="font-medium text-gray-700 mb-2">
                    Location Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <span>📍</span>
                      <span>London, UK</span>
                    </div>
                    {(() => {
                      const location = getPropertyLocation(listingName);
                      return location ? (
                        <>
                          {location.neighborhood && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <span>🏘️</span>
                              <span>{location.neighborhood}</span>
                            </div>
                          )}
                          {location.description && (
                            <div className="mt-3 p-3 bg-gray-50 rounded text-xs text-gray-600">
                              {location.description}
                            </div>
                          )}
                        </>
                      ) : null;
                    })()}
                  </div>
                </div>
                <div className="bg-white p-4 rounded shadow">
                  <h3 className="font-medium text-gray-700 mb-2">
                    Getting There
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>🚇 Near major transport links</div>
                    <div>🚶 Walking distance to attractions</div>
                    <div>🅿️ Parking options available</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reviews */}
        {!isLoading && !isError && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <h2 className="text-xl font-semibold">
                Guest Reviews ({reviews.length})
              </h2>
              {reviews.length > 0 && (
                <PaginationInfo
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredReviews.length}
                  itemsPerPage={REVIEWS_PER_PAGE}
                />
              )}
            </div>

            {/* Enhanced Filters */}
            {reviews.length > 0 && (
              <CombinedListingFilters
                onFiltersChange={setFilters}
                reviewCount={filteredReviews.length}
                availableCategories={availableCategories}
                availableLanguages={availableLanguages}
                sourceStats={stats?.sources}
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
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{review.author}</h3>
                      {review.authorPhoto ? (
                        <img
                          src={review.authorPhoto}
                          alt={review.author}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.author)}&background=3B82F6&color=fff&size=32`;
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                          {review.author.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <ReviewSourceBadge
                        source={review.source}
                        type={review.type}
                      />
                      <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                        Published
                      </span>
                      <span className="text-sm text-gray-500">
                        {review.relativeTime || formatDate(review.submittedAt)}
                      </span>
                    </div>
                    {review.language && review.language !== "en" && (
                      <div className="text-xs text-gray-500 mb-2">
                        Language: {review.language.toUpperCase()}
                        {review.translated && " (translated)"}
                      </div>
                    )}
                  </div>

                  {review.overallRating && (
                    <div className="text-right">
                      <div className="flex items-center">
                        {renderStars(review.overallRating)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {review.source === "google"
                          ? `${review.rating}/5`
                          : `${review.overallRating}/10`}
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-gray-800 mb-4 text-base leading-relaxed">
                  &ldquo;{review.comment}&rdquo;
                </p>

                {review.source === "hostaway" &&
                  Object.keys(review.categories).length > 0 && (
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

                {review.authorUrl && (
                  <div className="border-t pt-3 mt-3">
                    <a
                      href={review.authorUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      View on Google →
                    </a>
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
              reviews.length > 0 &&
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
                        sourceFilter: "all",
                      })
                    }
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              )}

            {reviews.length === 0 && !isLoading && !isError && (
              <div className="text-center py-12 text-gray-500">
                <div className="mb-4 text-4xl">📝</div>
                <div className="text-lg font-medium mb-2">No reviews found</div>
                <div className="text-sm">
                  Reviews for {listingName} will appear here once they are
                  available from Google or verified guests
                </div>
                <div className="text-xs mt-2 text-gray-400">
                  We show both Google reviews and verified guest reviews
                </div>
                <div className="mt-6">
                  <Link
                    href="/listings"
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
        {reviews.length > 0 && !isLoading && !isError && (
          <div className="mt-12 pt-6 border-t">
            <div className="text-center">
              <Link
                href="/listings"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← View all Flex Living properties
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
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
              href="/listings"
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
