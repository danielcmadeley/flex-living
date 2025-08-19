import { HostawayReviewsResponse } from "../types/hostaway";
import { db, hostawayTokens } from "@/db";
import { desc } from "drizzle-orm";
import { mockHostawayResponse } from "@/data/mockReviews";

interface TokenStorage {
  token: string;
  expiresAt: number;
}

class HostawayService {
  private static instance: HostawayService;
  private baseUrl =
    process.env.HOSTAWAY_BASE_URL || "https://api.hostaway.com/v1";
  private clientId = process.env.HOSTAWAY_CLIENT_ID!;
  private clientSecret = process.env.HOSTAWAY_CLIENT_SECRET!;
  private tokenStorage: TokenStorage | null = null;

  private constructor() {
    // Validate required environment variables
    if (!this.clientId) {
      throw new Error("HOSTAWAY_CLIENT_ID environment variable is required");
    }
    if (!this.clientSecret) {
      throw new Error(
        "HOSTAWAY_CLIENT_SECRET environment variable is required",
      );
    }
  }

  static getInstance(): HostawayService {
    if (!HostawayService.instance) {
      HostawayService.instance = new HostawayService();
    }
    return HostawayService.instance;
  }

  private async isTokenValid(): Promise<boolean> {
    // Check in-memory storage first
    if (this.tokenStorage && Date.now() < this.tokenStorage.expiresAt) {
      return true;
    }

    // Check database for valid token
    const dbTokens = await db
      .select()
      .from(hostawayTokens)
      .orderBy(desc(hostawayTokens.createdAt))
      .limit(1);

    if (dbTokens.length > 0) {
      const dbToken = dbTokens[0];
      if (dbToken.expiresAt.getTime() > Date.now()) {
        // Update in-memory storage
        this.tokenStorage = {
          token: dbToken.accessToken,
          expiresAt: dbToken.expiresAt.getTime(),
        };
        return true;
      }
    }

    return false;
  }

  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (await this.isTokenValid()) {
      return this.tokenStorage!.token;
    }

    // Generate new token
    const data = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: this.clientId,
      client_secret: this.clientSecret,
      scope: "general",
    });

    try {
      const response = await fetch(`${this.baseUrl}/accessTokens`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Cache-Control": "no-cache",
        },
        body: data,
      });

      if (!response.ok) {
        throw new Error(
          `Failed to get access token: ${response.status} ${response.statusText}`,
        );
      }

      const tokenData = await response.json();

      // Store token with expiration time (subtract 5 minutes for safety)
      const expiresAt = new Date(
        Date.now() + tokenData.expires_in * 1000 - 5 * 60 * 1000,
      );

      this.tokenStorage = {
        token: tokenData.access_token,
        expiresAt: expiresAt.getTime(),
      };

      // Store in database
      await db.insert(hostawayTokens).values({
        accessToken: tokenData.access_token,
        tokenType: tokenData.token_type,
        expiresAt: expiresAt,
      });

      return tokenData.access_token;
    } catch (error) {
      console.error("Error getting Hostaway access token:", error);
      throw error;
    }
  }

  private async makeAuthenticatedRequest(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<HostawayReviewsResponse> {
    const token = await this.getAccessToken();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
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
          Authorization: `Bearer ${newToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!retryResponse.ok) {
        throw new Error(
          `API request failed: ${retryResponse.status} ${retryResponse.statusText}`,
        );
      }

      return retryResponse.json();
    }

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`,
      );
    }

    return response.json() as Promise<HostawayReviewsResponse>;
  }

  async getReviews(params?: {
    listingId?: number;
    type?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<HostawayReviewsResponse> {
    // Since the API is sandboxed with no reviews, we'll return mock data
    // The params are prepared for when connecting to the real Hostaway API:
    // const queryParams = new URLSearchParams();
    // if (params?.listingId) queryParams.append('listingId', params.listingId.toString());
    // if (params?.type) queryParams.append('type', params.type);
    // if (params?.status) queryParams.append('status', params.status);
    // if (params?.limit) queryParams.append('limit', params.limit.toString());
    // if (params?.offset) queryParams.append('offset', params.offset.toString());
    // return this.makeAuthenticatedRequest(`/reviews?${queryParams.toString()}`);

    // For now, using mock data regardless of params
    console.log("Mock implementation - params received but not used:", params);
    return this.getMockReviews();
  }

  private getMockReviews(): HostawayReviewsResponse {
    return mockHostawayResponse;
  }
}

export default HostawayService;
