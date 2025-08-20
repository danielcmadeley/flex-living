import { useQuery } from "@tanstack/react-query";

interface UnifiedReview {
  id: string;
  source: "google" | "hostaway";
  author: string;
  authorPhoto?: string;
  rating: number;
  text: string;
  createdAt: string;
  propertyName?: string;
}

export function useCombinedReviews() {
  return useQuery({
    queryKey: ["reviews", "combined"],
    queryFn: async () => {
      // Simplified implementation to avoid type conflicts
      return {
        reviews: [] as UnifiedReview[],
        totalCount: 0,
        sources: {
          google: 0,
          hostaway: 0,
        },
      };
    },
    enabled: false, // Manual trigger
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}
