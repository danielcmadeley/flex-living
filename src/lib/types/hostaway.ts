// Re-export types from Zod schemas for backward compatibility
export type {
  ReviewType,
  ReviewStatus,
  ReviewCategory,
  NormalizedReview,
  ReviewsApiResponse,
} from "../schemas";

// Legacy interfaces for Hostaway API (keeping for existing integrations)
export interface HostawayTokenResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
}

export interface HostawayToken {
  access_token: string;
  expires_at: number;
  token_type: string;
}

export interface HostawayReviewCategory {
  category: string;
  rating: number;
}

export interface HostawayReview {
  id: number;
  type: string;
  status: string;
  rating: number | null;
  publicReview: string;
  reviewCategory: HostawayReviewCategory[];
  submittedAt: string;
  guestName: string;
  listingName: string;
}

export interface HostawayReviewsResponse {
  status: string;
  result: HostawayReview[];
}
