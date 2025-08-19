'use client';

import { useQuery } from '@tanstack/react-query';
import { ReviewsApiResponse, ReviewQuery } from '@/lib/schemas';

interface UseReviewsOptions extends Partial<ReviewQuery> {
  enabled?: boolean;
}

export function useReviews(options: UseReviewsOptions = {}) {
  const { enabled = true, ...queryParams } = options;

  const query = useQuery({
    queryKey: ['reviews', queryParams],
    queryFn: async (): Promise<ReviewsApiResponse> => {
      const searchParams = new URLSearchParams();

      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value));
        }
      });

      const response = await fetch(`/api/reviews/hostaway?${searchParams.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch reviews: ${response.statusText}`);
      }

      return response.json();
    },
    enabled,
  });

  return {
    reviews: query.data?.data || [],
    statistics: query.data?.statistics,
    total: query.data?.total || 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useReviewsWithStats(options: UseReviewsOptions = {}) {
  return useReviews({
    ...options,
    includeStats: true,
  });
}

export function useReviewsByProperty(propertyName?: string) {
  return useReviews({
    listingName: propertyName,
    includeStats: true,
  });
}

export function useReviewsByType(type?: 'host-to-guest' | 'guest-to-host') {
  return useReviews({
    type,
    includeStats: true,
  });
}
