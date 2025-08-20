import { NextRequest, NextResponse } from "next/server";
import {
  rateLimiters,
  getClientIdentifier,
  determineRateLimitType,
  createRateLimitHeaders,
  createRateLimitErrorResponse,
  type RateLimitType,
} from "./config";
import { logger } from "@/lib/utils/logger";

// Higher-order function to wrap API routes with rate limiting
export function withRateLimit<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
  options?: {
    type?: RateLimitType;
    skipSuccessful?: boolean;
  },
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const rateLimitLogger = logger.child("rate-limit");

    try {
      // Determine the rate limit type
      const rateLimitType =
        options?.type ||
        determineRateLimitType(new URL(request.url).pathname, request.method);

      // Get client identifier
      const clientId = getClientIdentifier(request);

      // Get the appropriate rate limiter
      const rateLimiter = rateLimiters[rateLimitType];

      rateLimitLogger.debug("Checking rate limit", {
        clientId,
        rateLimitType,
        pathname: new URL(request.url).pathname,
        method: request.method,
      });

      // Check rate limit
      const result = await rateLimiter.limit(clientId);

      // Log rate limit info
      rateLimitLogger.info("Rate limit check completed", {
        clientId,
        rateLimitType,
        success: result.success,
        remaining: result.remaining,
        limit: result.limit,
        reset: result.reset,
      });

      // If rate limit exceeded, return error response
      if (!result.success) {
        rateLimitLogger.warn("Rate limit exceeded", {
          clientId,
          rateLimitType,
          pathname: new URL(request.url).pathname,
        });

        return NextResponse.json(createRateLimitErrorResponse(result), {
          status: 429,
          headers: {
            ...createRateLimitHeaders(result),
            "Retry-After": Math.ceil(
              (result.reset * 1000 - Date.now()) / 1000,
            ).toString(),
          },
        });
      }

      // Continue with the original handler
      const response = await handler(request, ...args);

      // Add rate limit headers to successful responses
      if (!options?.skipSuccessful) {
        const headers = createRateLimitHeaders(result);
        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      }

      return response;
    } catch (error) {
      rateLimitLogger.error("Rate limiting error", error);

      // If rate limiting fails, continue without it (fail open)
      rateLimitLogger.warn(
        "Rate limiting failed, continuing without rate limit",
      );
      return handler(request, ...args);
    }
  };
}

// Standalone rate limit check function
export async function checkRateLimit(
  request: NextRequest,
  type?: RateLimitType,
): Promise<{
  success: boolean;
  response?: NextResponse;
  headers: Record<string, string>;
}> {
  const rateLimitLogger = logger.child("rate-limit-check");

  try {
    // Determine the rate limit type
    const rateLimitType =
      type ||
      determineRateLimitType(new URL(request.url).pathname, request.method);

    // Get client identifier
    const clientId = getClientIdentifier(request);

    // Get the appropriate rate limiter
    const rateLimiter = rateLimiters[rateLimitType];

    // Check rate limit
    const result = await rateLimiter.limit(clientId);

    rateLimitLogger.debug("Standalone rate limit check", {
      clientId,
      rateLimitType,
      success: result.success,
      remaining: result.remaining,
    });

    const headers = createRateLimitHeaders(result);

    if (!result.success) {
      return {
        success: false,
        response: NextResponse.json(createRateLimitErrorResponse(result), {
          status: 429,
          headers: {
            ...headers,
            "Retry-After": Math.ceil(
              (result.reset * 1000 - Date.now()) / 1000,
            ).toString(),
          },
        }),
        headers,
      };
    }

    return {
      success: true,
      headers,
    };
  } catch (error) {
    rateLimitLogger.error("Standalone rate limit check failed", error);

    // Fail open - return success if rate limiting fails
    return {
      success: true,
      headers: {},
    };
  }
}

// Utility to get current rate limit status for a client
export async function getRateLimitStatus(
  clientId: string,
  type: RateLimitType = "api",
) {
  try {
    const rateLimiter = rateLimiters[type];
    const result = await rateLimiter.limit(clientId);

    return {
      success: true,
      data: {
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
        limited: !result.success,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Export all rate limiting utilities
export * from "./config";
export * from "./redis";
