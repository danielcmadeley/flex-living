import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

// Rate limiting configurations for different endpoint types
export const RATE_LIMIT_CONFIGS = {
  // General API endpoints - more restrictive
  api: {
    requests: 100,
    window: "1 h",
    description: "General API endpoints",
  },

  // Authentication endpoints - very restrictive
  auth: {
    requests: 5,
    window: "15 m",
    description: "Authentication endpoints",
  },

  // Data fetching endpoints - moderate
  data: {
    requests: 200,
    window: "1 h",
    description: "Data fetching endpoints",
  },

  // Mutation endpoints (POST, PUT, DELETE) - restrictive
  mutation: {
    requests: 50,
    window: "1 h",
    description: "Data mutation endpoints",
  },

  // External API proxies - very restrictive due to costs
  external: {
    requests: 20,
    window: "1 h",
    description: "External API proxy endpoints",
  },

  // Admin operations - very restrictive
  admin: {
    requests: 30,
    window: "1 h",
    description: "Admin operation endpoints",
  },
} as const;

// Create rate limiters for each configuration
export const rateLimiters = {
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      RATE_LIMIT_CONFIGS.api.requests,
      RATE_LIMIT_CONFIGS.api.window,
    ),
    analytics: true,
    prefix: "ratelimit:api",
  }),

  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      RATE_LIMIT_CONFIGS.auth.requests,
      RATE_LIMIT_CONFIGS.auth.window,
    ),
    analytics: true,
    prefix: "ratelimit:auth",
  }),

  data: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      RATE_LIMIT_CONFIGS.data.requests,
      RATE_LIMIT_CONFIGS.data.window,
    ),
    analytics: true,
    prefix: "ratelimit:data",
  }),

  mutation: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      RATE_LIMIT_CONFIGS.mutation.requests,
      RATE_LIMIT_CONFIGS.mutation.window,
    ),
    analytics: true,
    prefix: "ratelimit:mutation",
  }),

  external: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      RATE_LIMIT_CONFIGS.external.requests,
      RATE_LIMIT_CONFIGS.external.window,
    ),
    analytics: true,
    prefix: "ratelimit:external",
  }),

  admin: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      RATE_LIMIT_CONFIGS.admin.requests,
      RATE_LIMIT_CONFIGS.admin.window,
    ),
    analytics: true,
    prefix: "ratelimit:admin",
  }),
} as const;

// Type definitions
export type RateLimitType = keyof typeof rateLimiters;

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  pending: Promise<unknown>;
}

// Helper function to get client identifier
export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers (for different deployment environments)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  // Use the first available IP, fallback to a default
  const ip =
    forwarded?.split(",")[0]?.trim() || realIp || cfConnectingIp || "127.0.0.1";

  return ip;
}

// Helper function to determine rate limit type based on endpoint
export function determineRateLimitType(
  pathname: string,
  method: string,
): RateLimitType {
  // Authentication endpoints
  if (
    pathname.includes("/auth/") ||
    pathname.includes("/login") ||
    pathname.includes("/register")
  ) {
    return "auth";
  }

  // Admin endpoints
  if (pathname.includes("/admin/")) {
    return "admin";
  }

  // External API endpoints (like Google reviews)
  if (
    pathname.includes("/reviews/google") ||
    pathname.includes("/reviews/hostaway")
  ) {
    return "external";
  }

  // Mutation operations
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    return "mutation";
  }

  // Data fetching operations
  if (method === "GET") {
    return "data";
  }

  // Default to general API rate limit
  return "api";
}

// Rate limit response headers
export function createRateLimitHeaders(result: RateLimitResult) {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": new Date(result.reset * 1000).toISOString(),
  };
}

// Rate limit error response
export function createRateLimitErrorResponse(result: RateLimitResult) {
  return {
    error: "Rate limit exceeded",
    message: `Too many requests. Limit: ${result.limit} requests per hour.`,
    rateLimitInfo: {
      limit: result.limit,
      remaining: result.remaining,
      reset: new Date(result.reset * 1000).toISOString(),
    },
  };
}
