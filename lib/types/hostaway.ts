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

export interface NormalizedReview {
  id: number;
  type: 'host-to-guest' | 'guest-to-host';
  status: 'published' | 'pending' | 'draft';
  overallRating: number | null;
  comment: string;
  categories: {
    cleanliness?: number;
    communication?: number;
    respect_house_rules?: number;
    accuracy?: number;
    location?: number;
    check_in?: number;
    value?: number;
  };
  submittedAt: Date;
  guestName: string;
  listingName: string;
  channel?: string;
}

export interface ReviewsApiResponse {
  status: 'success' | 'error';
  data: NormalizedReview[];
  total: number;
  message?: string;
}
