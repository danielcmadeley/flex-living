import { useQuery } from "@tanstack/react-query";

interface GoogleReview {
  id: string;
  source: "google";
  author: string;
  authorPhoto?: string;
  authorUrl?: string;
  rating: number;
  text: string;
  createdAt: string;
  relativeTime: string;
  language: string;
  originalLanguage?: string;
  translated: boolean;
  propertyName: string;
  // Mapped to your review structure
  overallRating: number;
  comment: string;
  guestName: string;
  submittedAt: Date;
  type: "guest-to-host";
  status: "published";
  categories: {
    overall?: number;
    experience?: number;
    value?: number;
  };
}

interface GoogleReviewsResponse {
  reviews: GoogleReview[];
  averageRating: number;
  totalReviews: number;
  propertyName: string;
  placeId: string;
  lastUpdated: string;
  message?: string;
}

interface UseGoogleReviewsOptions {
  propertyName?: string;
  language?: string;
  enabled?: boolean;
}

export function useGoogleReviews(options: UseGoogleReviewsOptions = {}) {
  const { propertyName, language = "en", enabled = true } = options;

  return useQuery<GoogleReviewsResponse>({
    queryKey: ["reviews", "google", propertyName, language],
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      if (propertyName) {
        searchParams.append("propertyName", propertyName);
      }

      if (language !== "en") {
        searchParams.append("language", language);
      }

      const url = `/api/reviews/google${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch Google reviews");
      }

      return response.json();
    },
    enabled,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: (failureCount, error) => {
      // Don't retry on client errors (4xx)
      if (error instanceof Error && error.message.includes("API key")) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

// Hook specifically for getting reviews for a single property
export function useGoogleReviewsByProperty(
  propertyName: string,
  options: Omit<UseGoogleReviewsOptions, "propertyName"> = {},
) {
  return useGoogleReviews({
    ...options,
    propertyName,
    enabled: !!propertyName && (options.enabled ?? true),
  });
}

// Hook for getting all Google reviews (default property)
export function useDefaultGoogleReviews(
  options: Omit<UseGoogleReviewsOptions, "propertyName"> = {},
) {
  return useGoogleReviews({
    ...options,
    propertyName: undefined,
  });
}
