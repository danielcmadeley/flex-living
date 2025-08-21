"use client";

import { useQuery } from "@tanstack/react-query";
import { NormalizedReview } from "@/lib/types/hostaway";

interface ListingSummary {
  name: string;
  reviewCount: number;
  averageRating: number;
  latestReview: Date;
  sampleReview: string;
}

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

interface UseListingsOptions {
  enabled?: boolean;
  includeStats?: boolean;
}

export function useListings(options: UseListingsOptions = {}) {
  const { enabled = true, includeStats = true } = options;

  const query = useQuery({
    queryKey: ["listings", { includeStats }],
    queryFn: async (): Promise<{
      listings: ListingSummary[];
      statistics?: ReviewsResponse["statistics"];
    }> => {
      const searchParams = new URLSearchParams();
      searchParams.append("status", "published");

      if (includeStats) {
        searchParams.append("includeStats", "true");
      }

      const response = await fetch(
        `/api/reviews/hostaway?${searchParams.toString()}`,
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch listings: ${response.statusText}`);
      }

      const data: ReviewsResponse = await response.json();

      if (data.status !== "success") {
        throw new Error(data.message || "Failed to fetch listings");
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

      const listings: ListingSummary[] = Array.from(listingsMap.entries())
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

      return {
        listings,
        statistics: data.statistics,
      };
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    listings: query.data?.listings || [],
    statistics: query.data?.statistics,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useFeaturedListings(limit: number = 6) {
  const { listings, ...rest } = useListings();

  return {
    ...rest,
    listings: listings.slice(0, limit),
  };
}

export function useListingByName(listingName?: string) {
  return useQuery({
    queryKey: ["listing", listingName],
    queryFn: async () => {
      if (!listingName) return null;

      try {
        // First, get all available listings to find the best match
        const allListingsResponse = await fetch(
          "/api/reviews/hostaway?status=published&getAllListings=true",
        );

        if (!allListingsResponse.ok) {
          throw new Error(
            `Failed to fetch available listings: ${allListingsResponse.statusText}`,
          );
        }

        const allListingsData = await allListingsResponse.json();

        if (
          allListingsData.status !== "success" ||
          !allListingsData.availableListings
        ) {
          throw new Error("Failed to get available listings");
        }

        // Find the best matching listing name
        const { findBestMatchingListing, createListingSlug } = await import(
          "@/lib/utils/slugs"
        );

        // If listingName looks like a slug, convert it and find best match
        let targetListingName = listingName;
        if (listingName.includes("-")) {
          const potentialSlug = listingName;
          const bestMatch = findBestMatchingListing(
            potentialSlug,
            allListingsData.availableListings,
          );

          if (bestMatch) {
            targetListingName = bestMatch;
          }
        } else {
          // If it's already a listing name, try to find exact or fuzzy match
          const exactMatch = allListingsData.availableListings.find(
            (listing: string) =>
              listing.toLowerCase() === listingName.toLowerCase(),
          );
          if (exactMatch) {
            targetListingName = exactMatch;
          } else {
            // Try finding by slug conversion
            const slug = createListingSlug(listingName);

            const slugMatch = findBestMatchingListing(
              slug,
              allListingsData.availableListings,
            );

            if (slugMatch) {
              targetListingName = slugMatch;
            }
          }
        }

        // Now fetch reviews for the matched listing
        const searchParams = new URLSearchParams();
        searchParams.append("listingName", targetListingName);
        searchParams.append("status", "published");

        const reviewsUrl = `/api/reviews/hostaway?${searchParams.toString()}`;

        const response = await fetch(reviewsUrl);

        if (!response.ok) {
          throw new Error(`Failed to fetch listing: ${response.statusText}`);
        }

        const data: ReviewsResponse = await response.json();

        if (data.status !== "success") {
          throw new Error(data.message || "Failed to fetch listing");
        }

        return data.data;
      } catch (error) {
        console.error("Error in useListingByName:", error);
        throw error;
      }
    },
    enabled: !!listingName,
    staleTime: 1000 * 60 * 5,
  });
}
