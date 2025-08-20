import { NextRequest, NextResponse } from "next/server";
import {
  getRateLimitStatus,
  getClientIdentifier,
  rateLimiters,
  RATE_LIMIT_CONFIGS,
  testRedisConnection,
} from "@/lib/rate-limit";
import { withRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/utils/logger";

// GET endpoint to check rate limit status
export const GET = withRateLimit(
  async (request: NextRequest) => {
    const adminLogger = logger.child("admin-rate-limit");

    try {
      const { searchParams } = new URL(request.url);
      const clientId =
        searchParams.get("clientId") || getClientIdentifier(request);
      const type =
        (searchParams.get("type") as keyof typeof rateLimiters) || "api";

      // Test Redis connection
      const redisConnected = await testRedisConnection();

      // Get rate limit status for the client
      const rateLimitStatus = await getRateLimitStatus(clientId, type);

      // Get all rate limit configurations
      const configurations = Object.entries(RATE_LIMIT_CONFIGS).map(
        ([key, config]) => ({
          type: key,
          ...config,
        }),
      );

      adminLogger.info("Rate limit status checked", {
        clientId,
        type,
        redisConnected,
        rateLimitStatus: rateLimitStatus.success ? rateLimitStatus.data : null,
      });

      return NextResponse.json({
        success: true,
        redis: {
          connected: redisConnected,
          status: redisConnected ? "operational" : "disconnected",
        },
        client: {
          identifier: clientId,
          currentStatus: rateLimitStatus.success ? rateLimitStatus.data : null,
          error: rateLimitStatus.success ? null : rateLimitStatus.error,
        },
        configurations,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      adminLogger.error("Failed to get rate limit status", error);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to retrieve rate limit status",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    }
  },
  { type: "admin" },
);

// POST endpoint to test rate limiting
export const POST = withRateLimit(
  async (request: NextRequest) => {
    const adminLogger = logger.child("admin-rate-limit-test");

    try {
      const body = await request.json();
      const { clientId, type = "api", requests = 1 } = body;

      if (!clientId) {
        return NextResponse.json(
          {
            success: false,
            error: "Client ID is required for testing",
          },
          { status: 400 },
        );
      }

      if (requests > 10) {
        return NextResponse.json(
          {
            success: false,
            error: "Cannot test more than 10 requests at once",
          },
          { status: 400 },
        );
      }

      const rateLimiter = rateLimiters[type as keyof typeof rateLimiters];
      if (!rateLimiter) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid rate limit type: ${type}`,
            availableTypes: Object.keys(rateLimiters),
          },
          { status: 400 },
        );
      }

      // Perform test requests
      const results = [];
      for (let i = 0; i < requests; i++) {
        const result = await rateLimiter.limit(clientId);
        results.push({
          attempt: i + 1,
          success: result.success,
          remaining: result.remaining,
          limit: result.limit,
          reset: new Date(result.reset * 1000).toISOString(),
        });

        // Small delay between requests
        if (i < requests - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      adminLogger.info("Rate limit testing completed", {
        clientId,
        type,
        requestCount: requests,
        successfulRequests: results.filter((r) => r.success).length,
      });

      return NextResponse.json({
        success: true,
        test: {
          clientId,
          type,
          requestCount: requests,
          results,
          summary: {
            successful: results.filter((r) => r.success).length,
            blocked: results.filter((r) => !r.success).length,
            finalStatus: results[results.length - 1],
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      adminLogger.error("Rate limit testing failed", error);

      return NextResponse.json(
        {
          success: false,
          error: "Rate limit testing failed",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    }
  },
  { type: "admin" },
);

// DELETE endpoint to reset rate limits for a client
export const DELETE = withRateLimit(
  async (request: NextRequest) => {
    const adminLogger = logger.child("admin-rate-limit-reset");

    try {
      const { searchParams } = new URL(request.url);
      const clientId = searchParams.get("clientId");
      const type = searchParams.get("type") as keyof typeof rateLimiters;

      if (!clientId) {
        return NextResponse.json(
          {
            success: false,
            error: "Client ID is required for reset",
          },
          { status: 400 },
        );
      }

      // Import redis directly for manual operations
      const { redis } = await import("@/lib/rate-limit/redis");

      const resetResults = [];

      if (type && rateLimiters[type]) {
        // Reset specific rate limiter
        const prefix = `ratelimit:${type}:${clientId}`;
        const keys = await redis.keys(`${prefix}*`);

        if (keys.length > 0) {
          await redis.del(...keys);
          resetResults.push({ type, keysDeleted: keys.length });
        } else {
          resetResults.push({ type, keysDeleted: 0 });
        }
      } else {
        // Reset all rate limiters for the client
        for (const [rateLimitType] of Object.entries(rateLimiters)) {
          const prefix = `ratelimit:${rateLimitType}:${clientId}`;
          const keys = await redis.keys(`${prefix}*`);

          if (keys.length > 0) {
            await redis.del(...keys);
          }

          resetResults.push({
            type: rateLimitType,
            keysDeleted: keys.length,
          });
        }
      }

      adminLogger.info("Rate limit reset completed", {
        clientId,
        type: type || "all",
        resetResults,
      });

      return NextResponse.json({
        success: true,
        reset: {
          clientId,
          type: type || "all",
          results: resetResults,
          totalKeysDeleted: resetResults.reduce(
            (sum, r) => sum + r.keysDeleted,
            0,
          ),
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      adminLogger.error("Rate limit reset failed", error);

      return NextResponse.json(
        {
          success: false,
          error: "Rate limit reset failed",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    }
  },
  { type: "admin" },
);
