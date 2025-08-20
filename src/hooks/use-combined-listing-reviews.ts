import { useQuery } from "@tanstack/react-query";
import { useGoogleReviewsByProperty } from "./use-google-reviews";
import { useListingByName } from "./use-listings";
import { NormalizedReview } from "@/lib/types/hostaway";

// Combined review interface that works with both sources
export interface CombinedReview {
  id: string;
  source: "google" | "hostaway";
  author: string;
  authorPhoto?: string;
  authorUrl?: string;
  rating: number;
  overallRating: number;
  text: string;
  comment: string;
  createdAt: string;
  submittedAt: Date;
  relativeTime?: string;
  language?: string;
  translated?: boolean;
  guestName: string;
  listingName: string;
  propertyName: string;
  type: "host-to-guest" | "guest-to-host";
  status: "published" | "pending" | "draft";
  categories: Record<string, number | undefined>;
  // Google-specific fields
  originalLanguage?: string;
  // Hostaway-specific fields
  channel?: string;
}

// Interface for Google Places API review data
interface GoogleReviewResponse {
  reviews: Array<{
    id: string;
    source: "google";
    author: string;
    authorPhoto?: string;
    authorUrl?: string;
    rating: number;
    text: string;
    createdAt: string;
    relativeTime?: string;
    language?: string;
    originalLanguage?: string;
    translated?: boolean;
    propertyName: string;
  }>;
  averageRating: number;
  totalReviews: number;
}

// Interface for individual Google review from API
interface GoogleReviewItem {
  id: string;
  source: "google";
  author: string;
  authorPhoto?: string;
  authorUrl?: string;
  rating: number;
  overallRating: number;
  text: string;
  createdAt: string;
  relativeTime?: string;
  language?: string;
  originalLanguage?: string;
  translated?: boolean;
  propertyName: string;
}

export interface CombinedReviewsStats {
  overall: number;
  totalReviews: number;
  categories: Record<string, number>;
  reviewTypes: Record<string, number>;
  sources: {
    google: {
      count: number;
      averageRating: number;
      totalReviews: number;
    };
    hostaway: {
      count: number;
      averageRating: number;
      totalReviews: number;
    };
  };
}

export interface CombinedReviewsResponse {
  reviews: CombinedReview[];
  stats: CombinedReviewsStats;
  totalCount: number;
  propertyName: string;
  lastUpdated: string;
}

interface UseCombinedListingReviewsOptions {
  listingName?: string;
  includeGoogleReviews?: boolean;
  language?: string;
  enabled?: boolean;
}

export function useCombinedListingReviews(
  options: UseCombinedListingReviewsOptions = {},
) {
  const {
    listingName,
    includeGoogleReviews = true,
    language = "en",
    enabled = true,
  } = options;

  // Fetch Hostaway reviews
  const hostawayQuery = useListingByName(listingName);

  // Fetch Google reviews (only if enabled)
  const googleQuery = useGoogleReviewsByProperty(listingName || "", {
    language,
    enabled: includeGoogleReviews && !!listingName && enabled,
  });

  return useQuery<CombinedReviewsResponse>({
    queryKey: [
      "reviews",
      "combined",
      listingName,
      includeGoogleReviews,
      language,
    ],
    queryFn: async () => {
      const combinedReviews: CombinedReview[] = [];
      let propertyName = listingName || "Unknown Property";

      // Process Hostaway reviews
      const hostawayReviews = hostawayQuery.data || [];
      const normalizedHostawayReviews: CombinedReview[] = hostawayReviews.map(
        (review: NormalizedReview) => ({
          id: `hostaway_${review.id}`,
          source: "hostaway" as const,
          author: review.guestName,
          authorPhoto: undefined,
          authorUrl: undefined,
          rating: review.overallRating || 0,
          overallRating: review.overallRating || 0,
          text: review.comment,
          comment: review.comment,
          createdAt: new Date(review.submittedAt).toISOString(),
          submittedAt: new Date(review.submittedAt),
          relativeTime: getRelativeTime(new Date(review.submittedAt)),
          language: "en", // Hostaway reviews are typically in English
          translated: false,
          guestName: review.guestName,
          listingName: review.listingName,
          propertyName: review.listingName,
          type: review.type,
          status: review.status,
          categories: review.categories,
          channel: review.channel,
        }),
      );

      combinedReviews.push(...normalizedHostawayReviews);

      // Process Google reviews if enabled and available
      let googleReviews: GoogleReviewItem[] = [];
      if (includeGoogleReviews && googleQuery.data) {
        googleReviews = googleQuery.data.reviews || [];
        const normalizedGoogleReviews: CombinedReview[] = googleReviews.map(
          (review: GoogleReviewItem) => ({
            id: review.id,
            source: "google" as const,
            author: review.author,
            authorPhoto: review.authorPhoto,
            authorUrl: review.authorUrl,
            rating: review.rating,
            overallRating: review.rating * 2, // Convert 5-star to 10-star scale
            text: review.text,
            comment: review.text, // Use text as comment for Google reviews
            createdAt: review.createdAt,
            submittedAt: new Date(review.createdAt),
            relativeTime: review.relativeTime,
            language: review.language || "en",
            originalLanguage: review.language || "en",
            translated: false,
            guestName: review.author,
            listingName: propertyName,
            propertyName: propertyName,
            type: "guest-to-host" as const,
            status: "published" as const,
            categories: {},
          }),
        );

        combinedReviews.push(...normalizedGoogleReviews);
        propertyName = googleQuery.data.propertyName || propertyName;
      }

      // Sort all reviews by date (newest first)
      combinedReviews.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      // Calculate combined statistics
      const stats = calculateCombinedStats(
        normalizedHostawayReviews,
        googleReviews,
        googleQuery.data,
      );

      return {
        reviews: combinedReviews,
        stats,
        totalCount: combinedReviews.length,
        propertyName,
        lastUpdated: new Date().toISOString(),
      };
    },
    enabled:
      enabled &&
      !!listingName &&
      (hostawayQuery.isSuccess || !includeGoogleReviews),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

// Helper function to calculate relative time
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffWeeks === 1) return "a week ago";
  if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
  if (diffMonths === 1) return "a month ago";
  if (diffMonths < 12) return `${diffMonths} months ago`;
  if (diffYears === 1) return "a year ago";
  return `${diffYears} years ago`;
}

// Helper function to calculate combined statistics
function calculateCombinedStats(
  hostawayReviews: CombinedReview[],
  googleReviews: GoogleReviewItem[],
  googleData?: GoogleReviewResponse,
): CombinedReviewsStats {
  // Calculate overall rating from both review types
  const hostawayRatingSum = hostawayReviews.reduce(
    (sum, review) => sum + review.overallRating,
    0,
  );
  const googleRatingSum = googleReviews.reduce(
    (sum, review) => sum + review.rating * 2, // Convert 5-star to 10-star scale
    0,
  );

  const totalReviews = hostawayReviews.length + googleReviews.length;
  const overall =
    totalReviews > 0 ? (hostawayRatingSum + googleRatingSum) / totalReviews : 0;

  // Calculate category averages (primarily from Hostaway reviews)
  const categoryTotals: Record<string, { sum: number; count: number }> = {};
  hostawayReviews.forEach((review) => {
    Object.entries(review.categories).forEach(([category, rating]) => {
      if (rating !== undefined) {
        if (!categoryTotals[category]) {
          categoryTotals[category] = { sum: 0, count: 0 };
        }
        categoryTotals[category].sum += rating;
        categoryTotals[category].count += 1;
      }
    });
  });

  const categories: Record<string, number> = {};
  Object.entries(categoryTotals).forEach(([category, totals]) => {
    categories[category] = totals.sum / totals.count;
  });

  // Calculate review types
  const reviewTypes: Record<string, number> = {};
  hostawayReviews.forEach((review) => {
    reviewTypes[review.type] = (reviewTypes[review.type] || 0) + 1;
  });
  // Google reviews are always guest-to-host
  if (googleReviews.length > 0) {
    reviewTypes["guest-to-host"] =
      (reviewTypes["guest-to-host"] || 0) + googleReviews.length;
  }

  // Calculate source statistics
  const hostawayAverage =
    hostawayReviews.length > 0
      ? hostawayReviews.reduce((sum, r) => sum + r.overallRating, 0) /
        hostawayReviews.length
      : 0;

  const googleAverage = googleData?.averageRating
    ? googleData.averageRating * 2 // Convert from 1-5 to 1-10 scale
    : 0;

  return {
    overall: Number(overall.toFixed(1)),
    totalReviews: totalReviews,
    categories,
    reviewTypes,
    sources: {
      google: {
        count: googleReviews.length,
        averageRating: Number(googleAverage.toFixed(1)),
        totalReviews: googleData?.totalReviews || 0,
      },
      hostaway: {
        count: hostawayReviews.length,
        averageRating: Number(hostawayAverage.toFixed(1)),
        totalReviews: hostawayReviews.length,
      },
    },
  };
}

// Export the main hook with a simpler name
export const useListingReviews = useCombinedListingReviews;
