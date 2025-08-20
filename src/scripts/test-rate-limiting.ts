#!/usr/bin/env tsx

/**
 * Rate Limiting Test Script
 *
 * This script tests the rate limiting functionality by making requests to various API endpoints
 * and verifying that rate limits are properly enforced.
 */

import { testRedisConnection } from "../lib/rate-limit/redis";
import { RATE_LIMIT_CONFIGS } from "../lib/rate-limit/config";

// Type definitions for API responses
interface AdminRateLimitResponse {
  success: boolean;
  redis: {
    connected: boolean;
    status: string;
  };
  client: {
    identifier: string;
    currentStatus: {
      limit: number;
      remaining: number;
      reset: string;
      limited: boolean;
    } | null;
  };
  configurations: Array<{
    type: string;
    requests: number;
    window: string;
    description: string;
  }>;
  timestamp: string;
}

interface TestResponse {
  success: boolean;
  test: {
    clientId: string;
    type: string;
    requestCount: number;
    results: unknown[];
    summary: {
      successful: number;
      blocked: number;
      finalStatus: unknown;
    };
  };
  timestamp: string;
}

// Color codes for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message: string) {
  log(`\n${"=".repeat(60)}`, "blue");
  log(message, "bright");
  log("=".repeat(60), "blue");
}

function logSection(message: string) {
  log(`\n${"-".repeat(40)}`, "cyan");
  log(message, "yellow");
  log("-".repeat(40), "cyan");
}

async function testRedisConnectivity() {
  logSection("Testing Redis Connectivity");

  try {
    const isConnected = await testRedisConnection();

    if (isConnected) {
      log("✅ Redis connection successful", "green");
      return true;
    } else {
      log("❌ Redis connection failed", "red");
      return false;
    }
  } catch (error) {
    log(
      `❌ Redis connection error: ${error instanceof Error ? error.message : "Unknown error"}`,
      "red",
    );
    return false;
  }
}

async function testRateLimitConfigurations() {
  logSection("Testing Rate Limit Configurations");

  log("Available rate limit configurations:", "blue");

  Object.entries(RATE_LIMIT_CONFIGS).forEach(([key, config]) => {
    log(`  ${key}:`, "cyan");
    log(`    Requests: ${config.requests}`, "reset");
    log(`    Window: ${config.window}`, "reset");
    log(`    Description: ${config.description}`, "reset");
  });
}

async function makeTestRequest(
  endpoint: string,
  method: string = "GET",
  body?: unknown,
): Promise<{
  success: boolean;
  status: number;
  headers: Record<string, string>;
  data?: unknown;
  error?: string;
}> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const url = `${baseUrl}${endpoint}`;

  try {
    const fetchOptions: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "RateLimitTestScript/1.0",
      },
    };

    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      if (
        key.toLowerCase().startsWith("x-ratelimit") ||
        key.toLowerCase() === "retry-after"
      ) {
        headers[key] = value;
      }
    });

    let data;
    try {
      data = await response.json();
    } catch {
      data = await response.text();
    }

    return {
      success: response.ok,
      status: response.status,
      headers,
      data,
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      headers: {},
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function testEndpointRateLimit(
  endpoint: string,
  expectedType: string,
  maxRequests: number = 10,
) {
  logSection(`Testing Rate Limit: ${endpoint} (${expectedType})`);

  const results = [];
  let rateLimitHit = false;

  for (let i = 1; i <= maxRequests; i++) {
    log(`Request ${i}/${maxRequests}...`, "blue");

    const result = await makeTestRequest(endpoint);
    results.push(result);

    if (result.headers["x-ratelimit-limit"]) {
      log(
        `  Rate Limit: ${result.headers["x-ratelimit-remaining"]}/${result.headers["x-ratelimit-limit"]} remaining`,
        "cyan",
      );
    }

    if (result.status === 429) {
      log(`  ❌ Rate limit exceeded (${result.status})`, "red");
      if (result.headers["retry-after"]) {
        log(
          `  ⏰ Retry after: ${result.headers["retry-after"]} seconds`,
          "yellow",
        );
      }
      rateLimitHit = true;
      break;
    } else if (result.success) {
      log(`  ✅ Request successful (${result.status})`, "green");
    } else {
      log(
        `  ⚠️ Request failed (${result.status}): ${result.error || "Unknown error"}`,
        "yellow",
      );
    }

    // Small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  return {
    endpoint,
    expectedType,
    totalRequests: results.length,
    successfulRequests: results.filter((r) => r.success).length,
    rateLimitHit,
    results,
  };
}

async function testMultipleEndpoints() {
  logSection("Testing Multiple Endpoints");

  const endpointsToTest = [
    { endpoint: "/api/admin/rate-limit", type: "admin", maxRequests: 5 },
    { endpoint: "/api/reviews/google", type: "external", maxRequests: 5 },
    { endpoint: "/api/reviews/hostaway", type: "data", maxRequests: 8 },
    { endpoint: "/api/seed", type: "admin", maxRequests: 5 },
  ];

  const testResults = [];

  for (const test of endpointsToTest) {
    const result = await testEndpointRateLimit(
      test.endpoint,
      test.type,
      test.maxRequests,
    );
    testResults.push(result);

    // Wait between endpoint tests
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return testResults;
}

async function testAdminEndpoint() {
  logSection("Testing Admin Rate Limit Endpoint");

  // Test GET endpoint for status
  log("Testing GET /api/admin/rate-limit...", "blue");
  const getResult = await makeTestRequest("/api/admin/rate-limit");

  if (getResult.success && getResult.data) {
    log("✅ Admin endpoint accessible", "green");
    const data = getResult.data as AdminRateLimitResponse;
    log(`  Redis Status: ${data.redis?.status || "unknown"}`, "cyan");
    log(`  Client ID: ${data.client?.identifier || "unknown"}`, "cyan");

    if (data.configurations) {
      log(`  Configurations loaded: ${data.configurations.length}`, "cyan");
    }
  } else {
    log(
      `❌ Admin endpoint failed: ${getResult.error || "Unknown error"}`,
      "red",
    );
  }

  // Test POST endpoint for testing
  log("\nTesting POST /api/admin/rate-limit (rate limit test)...", "blue");
  const testClientId = "test-client-12345";
  const postResult = await makeTestRequest("/api/admin/rate-limit", "POST", {
    clientId: testClientId,
    type: "api",
    requests: 3,
  });

  if (postResult.success && postResult.data) {
    log("✅ Rate limit testing successful", "green");
    const data = postResult.data as TestResponse;
    log(`  Client ID: ${data.test?.clientId || "unknown"}`, "cyan");
    log(
      `  Successful requests: ${data.test?.summary?.successful || 0}`,
      "cyan",
    );
    log(`  Blocked requests: ${data.test?.summary?.blocked || 0}`, "cyan");
  } else {
    log(
      `❌ Rate limit testing failed: ${postResult.error || "Unknown error"}`,
      "red",
    );
  }
}

async function generateReport(
  testResults: Array<{
    endpoint: string;
    expectedType: string;
    totalRequests: number;
    successfulRequests: number;
    rateLimitHit: boolean;
    results: unknown[];
  }>,
) {
  logHeader("Test Results Summary");

  log(`Total endpoints tested: ${testResults.length}`, "blue");

  testResults.forEach((result) => {
    log(`\n${result.endpoint} (${result.expectedType}):`, "cyan");
    log(`  Total requests: ${result.totalRequests}`, "reset");
    log(`  Successful requests: ${result.successfulRequests}`, "reset");
    log(
      `  Rate limit hit: ${result.rateLimitHit ? "✅ Yes" : "❌ No"}`,
      result.rateLimitHit ? "green" : "red",
    );
  });

  const allRateLimitsHit = testResults.every((r) => r.rateLimitHit);
  const someRateLimitsHit = testResults.some((r) => r.rateLimitHit);

  log("\nOverall Assessment:", "bright");
  if (allRateLimitsHit) {
    log("✅ All endpoints properly enforced rate limits", "green");
  } else if (someRateLimitsHit) {
    log("⚠️ Some endpoints enforced rate limits", "yellow");
  } else {
    log("❌ No rate limits were enforced (check configuration)", "red");
  }
}

async function main() {
  logHeader("Rate Limiting Test Suite");

  try {
    // Test Redis connectivity
    const redisConnected = await testRedisConnectivity();

    if (!redisConnected) {
      log("\n❌ Cannot proceed with tests - Redis is not connected", "red");
      log(
        "Please check your UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables",
        "yellow",
      );
      process.exit(1);
    }

    // Test configurations
    await testRateLimitConfigurations();

    // Test admin endpoint
    await testAdminEndpoint();

    // Test multiple endpoints
    const testResults = await testMultipleEndpoints();

    // Generate report
    await generateReport(testResults);

    log("\n✅ Rate limiting test suite completed!", "green");
  } catch (error) {
    log(
      `\n❌ Test suite failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      "red",
    );
    console.error(error);
    process.exit(1);
  }
}

// Run the test suite
if (require.main === module) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

export { main as runRateLimitTests };
