import { useQuery } from "@tanstack/react-query";
import { useGoogleReviews } from "./useGoogleReviews";
import { useHostawayReviews } from "./useHostawayReviews";
import { useSupabaseReviews } from "./useSupabaseReviews";

interface UnifiedReview {
  id: string;
  source: "google" | "hostaway" | "supabase";
  author: string;
  authorPhoto?: string;
  rating: number;
  text: string;
  createdAt: string;
  propertyName?: string; // For Hostaway reviews
}

export function useCombinedReviews() {
  const googleQuery = useGoogleReviews();
  const hostawayQuery = useHostawayReviews();
  const supabaseQuery = useSupabaseReviews();

  return useQuery({
    queryKey: ["reviews", "combined"],
    queryFn: async () => {
      const results = await Promise.allSettled([
        googleQuery.refetch(),
        hostawayQuery.refetch(),
        supabaseQuery.refetch(),
      ]);

      const allReviews: UnifiedReview[] = [];

      results.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value.data) {
          const reviews = result.value.data.reviews || result.value.data;
          allReviews.push(...reviews);
        }
      });

      // Sort by date (newest first)
      allReviews.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      return {
        reviews: allReviews,
        totalCount: allReviews.length,
        sources: {
          google: googleQuery.data?.totalReviews || 0,
          hostaway: hostawayQuery.data?.length || 0,
          supabase: supabaseQuery.data?.length || 0,
        },
      };
    },
    enabled: false, // Manual trigger
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}
