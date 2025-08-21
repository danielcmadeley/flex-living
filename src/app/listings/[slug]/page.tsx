"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import {
  CombinedListingFilters,
  useCombinedListingFilters,
  type CombinedFilterOptions,
} from "@/components/CombinedListingFilters";
import { ErrorBoundary, ErrorFallback } from "@/components/ErrorBoundary";
import { Header } from "@/components/Header";
import { PropertyMap } from "@/components/ui/google-map";
import {
  Pagination,
  PaginationInfo,
  usePagination,
} from "@/components/ui/pagination";
import {
  ReviewSourceBadge,
  ReviewSourceSummary,
} from "@/components/ui/review-source-badge";
import {
  PropertyHeaderSkeleton,
  ReviewCardSkeleton,
  StatCardSkeleton,
} from "@/components/ui/skeleton";
import { useCombinedListingReviews } from "@/hooks/use-combined-listing-reviews";
import { getAllPropertyImages } from "@/lib/utils/images";
import { getPropertyLocation } from "@/lib/utils/locations";
import { slugToListingName } from "@/lib/utils/slugs";

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

  const [selectedDates] = useState({
    checkIn: new Date(Date.now() + 24 * 60 * 60 * 1000),
    checkOut: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  });
  const [guests, setGuests] = useState(1);
  const [couponCode, setCouponCode] = useState("");

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

  const formatDateLong = (date: Date | string) => {
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

  const calculateNights = () => {
    const diffTime =
      selectedDates.checkOut.getTime() - selectedDates.checkIn.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const basePrice = 213.36;
  const cleaningFee = 95.25;
  const nights = calculateNights();
  const totalPrice = basePrice * nights + cleaningFee;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const content = (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="max-w-7xl mx-auto w-full px-6 flex-1">
        {/* Loading State */}
        {isLoading && reviews.length === 0 && (
          <div className="flex flex-col space-y-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-gray-600">
                Loading {listingName} details...
              </div>
            </div>
            <div className="h-96 bg-gray-200 animate-pulse rounded-lg"></div>
            <PropertyHeaderSkeleton />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            title="Failed to load property"
            description={`We couldn't load details for ${listingName}. Please try again.`}
          />
        )}

        {/* Main Content - Vertical Layout */}
        {!isLoading && !isError && (
          <div className="flex flex-col space-y-8 pb-12">
            {/* 1. Property Image Gallery */}
            {propertyImages && propertyImages.length > 0 && (
              <div className="flex flex-col">
                {/* Main Image Display */}
                <div className="mb-4">
                  <div className="relative group">
                    <Image
                      src={propertyImages[selectedImageIndex].url}
                      alt={propertyImages[selectedImageIndex].alt}
                      width={1200}
                      height={600}
                      className="w-full h-64 md:h-96 lg:h-[500px] object-cover rounded-lg shadow-lg"
                      priority={selectedImageIndex === 0}
                    />
                    <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                      {selectedImageIndex + 1} / {propertyImages.length}
                    </div>
                  </div>
                </div>

                {/* Thumbnail Gallery */}
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 mb-4">
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
                      Image {selectedImageIndex + 1} of {propertyImages.length}
                    </div>
                  </div>
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
                    className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {/* 2. Title and Property Statistics */}
            <div className="flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                      {listingName}
                    </h1>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Verified Property
                    </span>
                  </div>
                  <p className="text-gray-600 text-lg mb-3">
                    Premium London serviced apartment with exceptional amenities
                  </p>
                  <div className="flex items-center gap-6 text-gray-600 mb-4">
                    <span className="flex items-center gap-1">
                      📍 London, UK
                    </span>
                    {stats && (
                      <>
                        <span className="flex items-center gap-1">
                          ★ {(stats.overall / 2).toFixed(1)}/5 overall rating
                        </span>
                        <span>{stats.totalReviews} reviews</span>
                      </>
                    )}
                  </div>
                  {stats && (
                    <ReviewSourceSummary
                      sources={stats.sources}
                      className="mb-4"
                    />
                  )}
                </div>
                <div className="flex gap-2 ml-6">
                  <Link
                    href="/listings"
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium"
                  >
                    ← All Properties
                  </Link>
                  <Link
                    href="/dashboard"
                    className="bg-[#284E4C] hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium"
                  >
                    Dashboard
                  </Link>
                </div>
              </div>

              {/* Enhanced Statistics */}
              {stats && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Property Statistics
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded shadow">
                      <h3 className="font-medium text-gray-700">
                        Overall Rating
                      </h3>
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
                      <h3 className="font-medium text-gray-700">
                        Total Reviews
                      </h3>
                      <span className="text-2xl font-bold">
                        {stats.totalReviews}
                      </span>
                    </div>

                    <div className="bg-white p-4 rounded shadow">
                      <h3 className="font-medium text-gray-700">
                        Google Reviews
                      </h3>
                      <div className="text-sm">
                        <div className="text-lg font-bold text-blue-600">
                          {stats.sources.google.count}
                        </div>
                        {stats.sources.google.averageRating > 0 && (
                          <div className="text-xs text-gray-500">
                            Avg:{" "}
                            {(stats.sources.google.averageRating / 2).toFixed(
                              1,
                            )}
                            /5
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded shadow">
                      <h3 className="font-medium text-gray-700">
                        Verified Guests
                      </h3>
                      <div className="text-sm">
                        <div className="text-lg font-bold text-green-600">
                          {stats.sources.hostaway.count}
                        </div>
                        {stats.sources.hostaway.averageRating > 0 && (
                          <div className="text-xs text-gray-500">
                            Avg:{" "}
                            {(stats.sources.hostaway.averageRating / 2).toFixed(
                              1,
                            )}
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
                                {typeof rating === "number" &&
                                !isNaN(Number(rating))
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
            </div>

            {/* 3. About This Property */}
            <div className="flex flex-col bg-white rounded-lg border p-6 relative">
              <h2 className="text-2xl font-semibold mb-4">
                About This Property
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Welcome to {listingName}, a stunning premium serviced
                  apartment located in the heart of London. This beautifully
                  appointed property offers the perfect blend of luxury,
                  comfort, and convenience for both short and extended stays.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Our property features modern furnishings, high-end appliances,
                  and thoughtful amenities designed to make your stay as
                  comfortable as possible. Whether you&apos;re visiting London
                  for business or leisure, you&apos;ll find everything you need
                  for a memorable stay.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Located in one of London&apos;s most desirable neighborhoods,
                  you&apos;ll have easy access to world-class dining, shopping,
                  and cultural attractions, while enjoying the peace and privacy
                  of your own beautifully appointed apartment.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">🏠</span>
                  <div>
                    <div className="font-medium text-gray-900">
                      Entire Apartment
                    </div>
                    <div className="text-sm text-gray-600">
                      Private space for you
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">✨</span>
                  <div>
                    <div className="font-medium text-gray-900">
                      Recently Renovated
                    </div>
                    <div className="text-sm text-gray-600">
                      Modern & updated
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">🌟</span>
                  <div>
                    <div className="font-medium text-gray-900">
                      Highly Rated
                    </div>
                    <div className="text-sm text-gray-600">
                      Excellent guest reviews
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content with Sticky Booking Widget */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left Column - Main Content */}
              <div className="flex-1 space-y-6">
                {/* 4. Amenities */}
                <div className="flex flex-col bg-white rounded-lg border p-6">
                  <h2 className="text-2xl font-semibold mb-4">Amenities</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Essential Amenities
                      </h3>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-3">
                          <span className="text-green-600">✓</span>
                          <span>Free high-speed WiFi throughout</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="text-green-600">✓</span>
                          <span>Fully equipped modern kitchen</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="text-green-600">✓</span>
                          <span>Washing machine & dryer</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="text-green-600">✓</span>
                          <span>Air conditioning & heating</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="text-green-600">✓</span>
                          <span>Smart TV with streaming services</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Comfort & Convenience
                      </h3>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-3">
                          <span className="text-green-600">✓</span>
                          <span>Premium bedding & linens</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="text-green-600">✓</span>
                          <span>Professional housekeeping</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="text-green-600">✓</span>
                          <span>24/7 guest support</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="text-green-600">✓</span>
                          <span>Secure building access</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="text-green-600">✓</span>
                          <span>Concierge services available</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-blue-600">ℹ️</span>
                      <span className="font-medium text-blue-900">
                        Special Features
                      </span>
                    </div>
                    <p className="text-blue-800 text-sm">
                      This property includes premium amenities and services that
                      set it apart from standard accommodations. Our attention
                      to detail ensures a luxury experience throughout your
                      stay.
                    </p>
                  </div>
                </div>

                {/* 5. Stay Policies */}
                <div className="flex flex-col bg-white rounded-lg border p-6">
                  <h2 className="text-2xl font-semibold mb-4">Stay Policies</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Check-in & Check-out
                      </h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>
                          <strong>Check-in:</strong> 3:00 PM - 10:00 PM
                        </li>
                        <li>
                          <strong>Check-out:</strong> Before 11:00 AM
                        </li>
                        <li>
                          <strong>Late check-in:</strong> Available with prior
                          notice
                        </li>
                        <li>
                          <strong>Early check-in:</strong> Subject to
                          availability
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Guest Guidelines
                      </h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>
                          <strong>Maximum guests:</strong> As per booking
                          capacity
                        </li>
                        <li>
                          <strong>Age requirement:</strong> 21+ for primary
                          guest
                        </li>
                        <li>
                          <strong>Smoking:</strong> Non-smoking property
                        </li>
                        <li>
                          <strong>Parties/Events:</strong> Not permitted
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      House Rules
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Quiet Hours
                        </h4>
                        <p className="text-sm text-gray-700">
                          Please respect quiet hours from 10:00 PM to 8:00 AM to
                          ensure all guests can enjoy a peaceful stay.
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Property Care
                        </h4>
                        <p className="text-sm text-gray-700">
                          Please treat the property with care. Any damages will
                          be assessed and charged accordingly.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. Cancellation Policy */}
                <div className="flex flex-col bg-white rounded-lg border p-6">
                  <h2 className="text-2xl font-semibold mb-4">
                    Cancellation Policy
                  </h2>

                  <div className="mb-6">
                    <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
                      Flexible Cancellation Policy
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      We understand that travel plans can change. Our flexible
                      cancellation policy is designed to give you peace of mind
                      when booking your stay.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Cancellation Terms
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <span className="text-green-600 mt-1">✓</span>
                          <div>
                            <div className="font-medium">Free cancellation</div>
                            <div className="text-sm text-gray-600">
                              Up to 24 hours before check-in
                            </div>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-yellow-600 mt-1">⚠</span>
                          <div>
                            <div className="font-medium">Partial refund</div>
                            <div className="text-sm text-gray-600">
                              Less than 24 hours: 50% refund
                            </div>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-red-600 mt-1">✗</span>
                          <div>
                            <div className="font-medium">No refund</div>
                            <div className="text-sm text-gray-600">
                              No-show or same-day cancellation
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Important Notes
                      </h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-yellow-50 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <strong>Special Circumstances:</strong> We may offer
                            additional flexibility for medical emergencies or
                            extraordinary circumstances.
                          </p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Modification Policy:</strong> Date changes
                            are subject to availability and may incur additional
                            charges.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Need to cancel or modify your booking?</strong>{" "}
                      Contact our support team as soon as possible. We&apos;re
                      here to help make the process as smooth as possible.
                    </p>
                  </div>
                </div>

                {/* 7. Location */}
                <div className="flex flex-col bg-white rounded-lg border p-6">
                  <h2 className="text-2xl font-semibold mb-4">Location</h2>
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
                      <div className="bg-gray-50 p-4 rounded-lg">
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
                                  <div className="mt-3 p-3 bg-white rounded text-xs text-gray-600">
                                    {location.description}
                                  </div>
                                )}
                              </>
                            ) : null;
                          })()}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-700 mb-2">
                          Getting Around
                        </h3>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <span>🚇</span>
                            <span>Near major transport links</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>🚶</span>
                            <span>Walking distance to attractions</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>🅿️</span>
                            <span>Parking options available</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-700 mb-2">
                          Nearby Highlights
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>🏛️ Museums & galleries nearby</div>
                          <div>🍽️ Excellent dining options</div>
                          <div>🛍️ Shopping districts</div>
                          <div>🌳 Parks & green spaces</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 8. Reviews */}
                <div className="flex flex-col bg-white rounded-lg border p-6">
                  <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
                    <h2 className="text-2xl font-semibold">
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
                    <div className="mb-6">
                      <CombinedListingFilters
                        onFiltersChange={setFilters}
                        reviewCount={filteredReviews.length}
                        availableCategories={availableCategories}
                        availableLanguages={availableLanguages}
                        sourceStats={stats?.sources}
                        isLoading={isLoading}
                      />
                    </div>
                  )}

                  {/* Pagination Top */}
                  {filteredReviews.length > REVIEWS_PER_PAGE && (
                    <div className="mb-6">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={goToPage}
                      />
                    </div>
                  )}

                  {/* Reviews List */}
                  <div className="space-y-6">
                    {paginatedReviews.map((review) => (
                      <div
                        key={review.id}
                        className="bg-gray-50 border rounded-lg p-6"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">
                                {review.author}
                              </h3>
                              {review.authorPhoto ? (
                                <Image
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
                                {review.relativeTime ||
                                  formatDateLong(review.submittedAt)}
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
                                      className="bg-white p-2 rounded text-center"
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
                  </div>

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

                  {/* Empty States */}
                  {filteredReviews.length === 0 && reviews.length > 0 && (
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

                  {reviews.length === 0 && !isLoading && (
                    <div className="text-center py-12 text-gray-500">
                      <div className="mb-4 text-4xl">📝</div>
                      <div className="text-lg font-medium mb-2">
                        No reviews yet for {listingName}
                      </div>
                      <div className="text-sm">
                        Be the first to share your experience with future guests
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Sticky Booking Widget */}
              <div className="lg:w-96 lg:shrink-0">
                <div className="sticky top-6 bg-white border rounded-lg p-6 shadow-lg">
                  <div className="bg-[#284E4C] text-white px-4 py-3 rounded-lg mb-6">
                    <h3 className="text-xl font-semibold">Book your stay</h3>
                    <p className="text-slate-200 mt-1">
                      Select dates to see the total price
                    </p>
                  </div>

                  {/* Date Selection */}
                  <div className="border rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-gray-600">📅</span>
                      <span className="font-medium">
                        {formatDate(selectedDates.checkIn)} -{" "}
                        {formatDate(selectedDates.checkOut)}
                      </span>
                      <button className="ml-auto text-sm text-blue-600 hover:text-blue-700">
                        Change
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Check-in</span>
                        <div className="font-medium">Aug 21</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Check-out</span>
                        <div className="font-medium">Aug 23</div>
                      </div>
                    </div>
                  </div>

                  {/* Guest Selection */}
                  <div className="border rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">Guests</span>
                        <div className="text-sm text-gray-500">
                          {guests} guests
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setGuests(Math.max(1, guests - 1))}
                          className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-50"
                        >
                          −
                        </button>
                        <span className="font-medium w-8 text-center">
                          {guests}
                        </span>
                        <button
                          onClick={() => setGuests(Math.min(6, guests + 1))}
                          className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="border rounded-lg p-4 mb-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Base price ({nights} nights)</span>
                        <span>£{(basePrice * nights).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cleaning fee</span>
                        <span>£{cleaningFee.toFixed(2)}</span>
                      </div>
                      <hr />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>£{totalPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Coupon Code */}
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2 mb-2 text-sm">
                        <span>🎫</span>
                        <span>Have a coupon code?</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Enter code"
                          className="flex-1 px-3 py-2 border rounded text-sm"
                        />
                        <button className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded">
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button className="w-full bg-[#284E4C] text-white py-3 px-4 rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                      📅 Book Now
                    </button>
                    <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                      💬 Send Inquiry
                    </button>
                  </div>

                  {/* Instant Confirmation */}
                  <div className="mt-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-green-600">
                      <span>⚡</span>
                      <span>Instant confirmation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Navigation */}
            <div className="flex flex-col items-center pt-8 border-t">
              <Link
                href="/listings"
                className="text-blue-600 hover:text-blue-700 font-medium text-lg mb-2"
              >
                ← View all Flex Living properties
              </Link>
              <p className="text-sm text-gray-500 text-center">
                Discover more premium serviced apartments across London
              </p>
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
