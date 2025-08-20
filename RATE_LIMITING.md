# Rate Limiting Implementation

This document describes the comprehensive rate limiting implementation for the Flex Living API using Upstash Redis.

## Overview

Rate limiting has been implemented across all API endpoints to protect against abuse, ensure fair usage, and manage costs for external API calls. The system uses Upstash Redis as the storage backend and provides flexible configuration for different endpoint types.

## Features

- ✅ **Multiple Rate Limit Types**: Different limits for different endpoint categories
- ✅ **Redis-backed Storage**: Uses Upstash Redis for distributed rate limiting
- ✅ **Automatic IP Detection**: Works with various deployment environments (Vercel, Cloudflare, etc.)
- ✅ **Sliding Window Algorithm**: More accurate than fixed window rate limiting
- ✅ **Rate Limit Headers**: Standard HTTP headers for client visibility
- ✅ **Admin Tools**: Endpoints for monitoring and testing rate limits
- ✅ **Fail-open Strategy**: Continues operation if Redis is unavailable
- ✅ **Comprehensive Logging**: Detailed logs for monitoring and debugging

## Rate Limit Configurations

| Type | Requests | Window | Description | Use Cases |
|------|----------|---------|-------------|-----------|
| `api` | 100 | 1 hour | General API endpoints | Default rate limit |
| `auth` | 5 | 15 minutes | Authentication endpoints | Login, register, password reset |
| `data` | 200 | 1 hour | Data fetching endpoints | GET requests for reviews, listings |
| `mutation` | 50 | 1 hour | Data mutation endpoints | POST, PUT, PATCH, DELETE operations |
| `external` | 20 | 1 hour | External API proxies | Google Places, third-party services |
| `admin` | 30 | 1 hour | Admin operations | Admin panel, diagnostics |

## Environment Variables

Add these to your `.env` file:

```env
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

## API Endpoints

### Protected Endpoints

All the following endpoints are now protected with rate limiting:

- `GET /api/reviews/google` - External API rate limit (20/hour)
- `GET /api/reviews/hostaway` - Data fetching rate limit (200/hour)
- `PATCH /api/reviews/[id]` - Mutation rate limit (50/hour)
- `DELETE /api/reviews/[id]` - Mutation rate limit (50/hour)
- `GET /api/seed` - Data fetching rate limit (200/hour)
- `POST /api/seed` - Admin rate limit (30/hour)

### Admin Endpoints

#### GET /api/admin/rate-limit

Get rate limit status and configuration information.

**Query Parameters:**
- `clientId` (optional): Specific client ID to check
- `type` (optional): Rate limit type to check

**Response:**
```json
{
  "success": true,
  "redis": {
    "connected": true,
    "status": "operational"
  },
  "client": {
    "identifier": "192.168.1.1",
    "currentStatus": {
      "limit": 100,
      "remaining": 95,
      "reset": "2024-01-01T12:00:00Z",
      "limited": false
    }
  },
  "configurations": [...],
  "timestamp": "2024-01-01T11:00:00Z"
}
```

#### POST /api/admin/rate-limit

Test rate limiting for a specific client.

**Request Body:**
```json
{
  "clientId": "test-client-123",
  "type": "api",
  "requests": 5
}
```

**Response:**
```json
{
  "success": true,
  "test": {
    "clientId": "test-client-123",
    "type": "api",
    "requestCount": 5,
    "results": [...],
    "summary": {
      "successful": 3,
      "blocked": 2,
      "finalStatus": {...}
    }
  }
}
```

#### DELETE /api/admin/rate-limit

Reset rate limits for a specific client.

**Query Parameters:**
- `clientId` (required): Client ID to reset
- `type` (optional): Specific rate limit type to reset

**Response:**
```json
{
  "success": true,
  "reset": {
    "clientId": "192.168.1.1",
    "type": "all",
    "results": [...],
    "totalKeysDeleted": 5
  }
}
```

## Rate Limit Headers

All API responses include rate limit information in headers:

- `X-RateLimit-Limit`: Maximum requests allowed in the time window
- `X-RateLimit-Remaining`: Number of requests remaining in the current window
- `X-RateLimit-Reset`: ISO timestamp when the rate limit resets
- `Retry-After`: Seconds to wait before retrying (only on 429 responses)

## Implementation Details

### Client Identification

The system identifies clients using the following priority order:

1. `x-forwarded-for` header (first IP)
2. `x-real-ip` header
3. `cf-connecting-ip` header (Cloudflare)
4. Fallback to `127.0.0.1`

### Rate Limit Types

Rate limits are automatically determined based on:

- **Path matching**: `/auth/`, `/admin/`, `/reviews/google`, etc.
- **HTTP method**: POST, PUT, PATCH, DELETE → `mutation`, GET → `data`
- **Default**: Falls back to `api` type

### Sliding Window Algorithm

Uses Upstash Ratelimit's sliding window implementation for more accurate rate limiting compared to fixed windows.

## Testing

### Manual Testing

Use the test script to verify rate limiting:

```bash
npm run test:rate-limit
```

This script will:
- Test Redis connectivity
- Display all rate limit configurations
- Test the admin endpoint
- Make requests to various endpoints to verify rate limits
- Generate a comprehensive report

### Testing Individual Endpoints

You can also test endpoints manually:

```bash
# Test Google reviews endpoint (should hit external rate limit quickly)
curl -X GET "http://localhost:3000/api/reviews/google" -v

# Test admin endpoint
curl -X GET "http://localhost:3000/api/admin/rate-limit" -v

# Test rate limit reset
curl -X DELETE "http://localhost:3000/api/admin/rate-limit?clientId=test-client&type=api" -v
```

## Error Responses

When rate limits are exceeded, endpoints return:

```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Limit: 100 requests per hour.",
  "rateLimitInfo": {
    "limit": 100,
    "remaining": 0,
    "reset": "2024-01-01T12:00:00Z"
  }
}
```

HTTP Status: `429 Too Many Requests`

## Monitoring and Observability

### Logging

All rate limit operations are logged with structured data:

```json
{
  "level": "info",
  "msg": "Rate limit check completed",
  "clientId": "192.168.1.1",
  "rateLimitType": "api",
  "success": true,
  "remaining": 95,
  "limit": 100,
  "reset": "2024-01-01T12:00:00Z"
}
```

### Redis Analytics

Upstash Ratelimit includes built-in analytics. You can view usage patterns in your Upstash dashboard.

## Configuration

### Customizing Rate Limits

To modify rate limits, edit `src/lib/rate-limit/config.ts`:

```typescript
export const RATE_LIMIT_CONFIGS = {
  api: {
    requests: 150, // Increase from 100
    window: "1 h",
    description: "General API endpoints",
  },
  // ... other configurations
};
```

### Adding New Rate Limit Types

1. Add configuration to `RATE_LIMIT_CONFIGS`
2. Add rate limiter to `rateLimiters` object
3. Update the `determineRateLimitType` function if needed

## Best Practices

### For API Consumers

- **Check Headers**: Always check rate limit headers to avoid hitting limits
- **Implement Backoff**: Use exponential backoff when receiving 429 responses
- **Cache Responses**: Cache API responses when possible to reduce requests
- **Respect Retry-After**: Wait the specified time before retrying

### For Developers

- **Monitor Usage**: Regularly check rate limit logs and analytics
- **Adjust Limits**: Fine-tune limits based on usage patterns
- **Test Changes**: Always test rate limit changes in development
- **Document Changes**: Update this documentation when modifying rate limits

## Troubleshooting

### Common Issues

1. **Rate limits not working**
   - Verify Redis connection
   - Check environment variables
   - Ensure middleware is properly configured

2. **Too restrictive rate limits**
   - Review usage patterns in logs
   - Consider increasing limits for specific endpoints
   - Use the admin endpoint to reset limits for testing

3. **Redis connectivity issues**
   - Verify Upstash credentials
   - Check network connectivity
   - The system will fail-open if Redis is unavailable

### Debug Commands

```bash
# Test Redis connection
curl -X GET "http://localhost:3000/api/admin/rate-limit"

# Check current rate limit status
curl -X GET "http://localhost:3000/api/admin/rate-limit?clientId=YOUR_IP"

# Reset rate limits for testing
curl -X DELETE "http://localhost:3000/api/admin/rate-limit?clientId=YOUR_IP"

# Run comprehensive tests
npm run test:rate-limit
```

## Security Considerations

- Rate limiting is based on IP address, which can be spoofed
- Consider implementing additional authentication-based rate limiting for sensitive endpoints
- Monitor for unusual patterns that might indicate abuse
- The system fails open (allows requests) if Redis is unavailable - monitor Redis health

## Future Enhancements

- User-based rate limiting (in addition to IP-based)
- Dynamic rate limit adjustment based on system load
- Rate limit exemptions for specific IP ranges
- Integration with authentication system for per-user limits
- Webhook notifications for rate limit violations