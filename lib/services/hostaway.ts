interface TokenStorage {
  token: string;
  expiresAt: number;
}

class HostawayService {
  private static instance: HostawayService;
  private baseUrl = 'https://api.hostaway.com/v1';
  private clientId = '61148';
  private clientSecret = 'f94377ebbbb479490bb3ec364649168dc443dda2e4830facaf5de2e74ccc9152';
  private tokenStorage: TokenStorage | null = null;

  private constructor() {}

  static getInstance(): HostawayService {
    if (!HostawayService.instance) {
      HostawayService.instance = new HostawayService();
    }
    return HostawayService.instance;
  }

  private isTokenValid(): boolean {
    if (!this.tokenStorage) return false;
    return Date.now() < this.tokenStorage.expiresAt;
  }

  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.isTokenValid()) {
      return this.tokenStorage!.token;
    }

    // Generate new token
    const data = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      scope: 'general'
    });

    try {
      const response = await fetch(`${this.baseUrl}/accessTokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cache-Control': 'no-cache'
        },
        body: data
      });

      if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.status} ${response.statusText}`);
      }

      const tokenData = await response.json();

      // Store token with expiration time (subtract 5 minutes for safety)
      this.tokenStorage = {
        token: tokenData.access_token,
        expiresAt: Date.now() + (tokenData.expires_in * 1000) - (5 * 60 * 1000)
      };

      return tokenData.access_token;
    } catch (error) {
      console.error('Error getting Hostaway access token:', error);
      throw error;
    }
  }

  private async makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = await this.getAccessToken();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // If we get 403, token might be expired, try once more with new token
    if (response.status === 403) {
      // Clear stored token and try again
      this.tokenStorage = null;
      const newToken = await this.getAccessToken();

      const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${newToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!retryResponse.ok) {
        throw new Error(`API request failed: ${retryResponse.status} ${retryResponse.statusText}`);
      }

      return retryResponse.json();
    }

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getReviews(params?: {
    listingId?: number;
    type?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<any> {
    // Since the API is sandboxed with no reviews, we'll return mock data
    // In a real implementation, you would use:
    // const queryParams = new URLSearchParams();
    // if (params?.listingId) queryParams.append('listingId', params.listingId.toString());
    // if (params?.type) queryParams.append('type', params.type);
    // if (params?.status) queryParams.append('status', params.status);
    // if (params?.limit) queryParams.append('limit', params.limit.toString());
    // if (params?.offset) queryParams.append('offset', params.offset.toString());
    // return this.makeAuthenticatedRequest(`/reviews?${queryParams.toString()}`);

    // Mock data based on the provided JSON structure
    return this.getMockReviews();
  }

  private getMockReviews() {
    return {
      status: "success",
      result: [
        {
          id: 7453,
          type: "host-to-guest",
          status: "published",
          rating: null,
          publicReview: "Shane and family are wonderful! Would definitely host again :)",
          reviewCategory: [
            {
              category: "cleanliness",
              rating: 10
            },
            {
              category: "communication",
              rating: 10
            },
            {
              category: "respect_house_rules",
              rating: 10
            }
          ],
          submittedAt: "2020-08-21 22:45:14",
          guestName: "Shane Finkelstein",
          listingName: "2B N1 A - 29 Shoreditch Heights"
        },
        {
          id: 7454,
          type: "guest-to-host",
          status: "published",
          rating: 9,
          publicReview: "Great location and very clean apartment. Host was responsive and helpful.",
          reviewCategory: [
            {
              category: "cleanliness",
              rating: 9
            },
            {
              category: "communication",
              rating: 10
            },
            {
              category: "location",
              rating: 10
            },
            {
              category: "value",
              rating: 8
            }
          ],
          submittedAt: "2020-08-20 15:30:00",
          guestName: "Maria Rodriguez",
          listingName: "2B N1 A - 29 Shoreditch Heights"
        },
        {
          id: 7455,
          type: "host-to-guest",
          status: "published",
          rating: null,
          publicReview: "Excellent guests! Left the place spotless and were very respectful.",
          reviewCategory: [
            {
              category: "cleanliness",
              rating: 10
            },
            {
              category: "communication",
              rating: 9
            },
            {
              category: "respect_house_rules",
              rating: 10
            }
          ],
          submittedAt: "2020-08-19 09:15:22",
          guestName: "John Smith",
          listingName: "1B Central London - Modern Flat"
        }
      ]
    };
  }
}

export default HostawayService;
