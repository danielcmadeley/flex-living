# Hostaway Reviews API Integration

This document describes the implementation of the Hostaway Reviews API integration for fetching and normalizing review data.

## Overview

The integration provides a complete solution for:
- Token management with automatic refresh
- Fetching reviews from Hostaway API
- Normalizing review data for consistent frontend usage
- Caching and error handling
- Secure credential management via environment variables

## Configuration

### Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Hostaway API Configuration
HOSTAWAY_BASE_URL=https://api.hostaway.com/v1
HOSTAWAY_CLIENT_ID=61148
HOSTAWAY_CLIENT_SECRET=f94377ebbbb479490bb3ec364649168dc443dda2e4830facaf5de2e74ccc9152
```

**Required Environment Variables:**
- `HOSTAWAY_CLIENT_ID`: Your Hostaway account ID
- `HOSTAWAY_CLIENT_SECRET`: Your Hostaway API secret key
- `HOSTAWAY_BASE_URL`: Hostaway API base URL (optional, defaults to production URL)

## API Endpoints

### GET `/api/reviews/hostaway`

Fetches and normalizes reviews from the Hostaway API.

#### Query Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `listingId` | number | Filter by specific listing ID | - |
| `type` | string | Filter by review type (`host-to-guest`, `guest-to-host`) | - |
| `status` | string | Filter by status (`published`, `pending`, `draft`) | - |
| `limit` | number | Maximum number of reviews to return | - |
| `offset` | number | Number of reviews to skip (for pagination) | - |
| `groupBy` | string | Group results by `listing` or `type` | - |
| `sortOrder` | string | Sort order `asc` or `desc` | `desc` |
| `includeStats` | boolean | Include statistical data in response | `false` |

#### Example Requests

```bash
# Basic request
GET /api/reviews/hostaway

# With filters and statistics
GET /api/reviews/hostaway?type=guest-to-host&includeStats=true&sortOrder=asc

# Grouped by listing
GET /api/reviews/hostaway?groupBy=listing&includeStats=true

# Pagination
GET /api/reviews/hostaway?limit=10&offset=20
```

#### Response Format

```json
{
  "status": "success",
  "data": [
    {
      "id": 7453,
      "type": "host-to-guest",
      "status": "published",
      "overallRating": 10,
      "comment": "Shane and family are wonderful! Would definitely host again :)",
      "categories": {
        "cleanliness": 10,
        "communication": 10,
        "respect_house_rules": 10
      },
      "submittedAt": "2020-08-21T22:45:14.000Z",
      "guestName": "Shane Finkelstein",
      "listingName": "2B N1 A - 29 Shoreditch Heights",
      "channel": "hostaway"
    }
  ],
  "total": 3,
  "statistics": {
    "overall": 9.7,
    "categories": {
      "cleanliness": 9.7,
      "communication": 9.7,
      "respect_house_rules": 10
    },
    "totalReviews": 3,
    "reviewTypes": {
      "host-to-guest": 2,
      "guest-to-host": 1
    }
  }
}
```

## Architecture

### Token Management

The `HostawayService` class implements automatic token management:

1. **Token Storage**: Tokens are stored in memory with expiration tracking
2. **Auto Refresh**: Tokens are automatically refreshed before expiration
3. **Error Handling**: 403 errors trigger automatic token refresh
4. **Safety Buffer**: Tokens are refreshed 5 minutes before actual expiration
5. **Environment Validation**: Validates required credentials on initialization

### Data Normalization

Raw Hostaway review data is transformed into a consistent format:

- **Unified Structure**: All reviews follow the same `NormalizedReview` interface
- **Category Mapping**: Review categories are mapped to standardized names
- **Date Handling**: Timestamps are converted to JavaScript Date objects
- **Rating Calculation**: Overall ratings are calculated when not provided

### Utility Functions

The integration includes several utility functions for data manipulation:

- `normalizeHostawayReviews()`: Convert raw API data to normalized format
- `groupReviewsByListing()`: Group reviews by property listing
- `groupReviewsByType()`: Group reviews by type (host-to-guest, guest-to-host)
- `sortReviewsByDate()`: Sort reviews by submission date
- `calculateAverageRatings()`: Calculate average ratings across categories

## Setup Instructions

1. **Clone the repository** and install dependencies:
   ```bash
   pnpm install
   ```

2. **Create environment file**:
   ```bash
   cp .env.local.example .env.local
   ```

3. **Update credentials** in `.env.local` with your Hostaway API credentials

4. **Start development server**:
   ```bash
   pnpm dev
   ```

5. **Test the integration**:
   - Visit `/api/reviews/hostaway` to test the API endpoint
   - Visit `/reviews-demo` to see the demo interface

## Usage Examples

### Frontend Integration

```typescript
// Fetch all reviews with statistics
const response = await fetch('/api/reviews/hostaway?includeStats=true');
const data = await response.json();

if (data.status === 'success') {
  console.log('Reviews:', data.data);
  console.log('Statistics:', data.statistics);
}

// Fetch reviews for specific listing
const listingReviews = await fetch('/api/reviews/hostaway?listingId=123');
const listingData = await listingReviews.json();

// Fetch and group by type
const groupedReviews = await fetch('/api/reviews/hostaway?groupBy=type');
const grouped = await groupedReviews.json();
```

### React Component

```tsx
import { useState, useEffect } from 'react';
import { NormalizedReview } from '@/lib/types/hostaway';

function ReviewsList() {
  const [reviews, setReviews] = useState<NormalizedReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await fetch('/api/reviews/hostaway?includeStats=true');
        const data = await response.json();
        
        if (data.status === 'success') {
          setReviews(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, []);

  if (loading) return <div>Loading reviews...</div>;

  return (
    <div>
      {reviews.map(review => (
        <div key={review.id} className="review-card">
          <h3>{review.guestName}</h3>
          <p>{review.comment}</p>
          <div>Rating: {review.overallRating}/10</div>
        </div>
      ))}
    </div>
  );
}
```

## Error Handling

The API handles various error scenarios:

1. **Network Errors**: Connection issues with Hostaway API
2. **Authentication Errors**: Invalid or expired tokens
3. **Configuration Errors**: Missing environment variables
4. **Rate Limiting**: API rate limit exceeded
5. **Data Validation**: Invalid or malformed response data

Error responses follow this format:

```json
{
  "status": "error",
  "data": [],
  "total": 0,
  "message": "Detailed error message"
}
```

## Caching

The API includes caching headers for optimal performance:

- **Cache-Control**: `public, s-maxage=300, stale-while-revalidate=600`
- **CDN Caching**: 5 minutes with 10 minutes stale-while-revalidate
- **Browser Caching**: Enabled for static data

## Security Best Practices

1. **Environment Variables**: All sensitive credentials stored in `.env.local`
2. **API Key Protection**: Never expose credentials in client-side code
3. **Input Validation**: All user inputs are validated
4. **CORS Configuration**: Appropriate CORS policies for production
5. **Token Security**: Secure token storage and automatic refresh

## Testing

To test the integration:

1. **Visit Demo Page**: Navigate to `/reviews-demo` to see the API in action
2. **API Testing**: Use tools like Postman or curl to test endpoints directly
3. **Browser DevTools**: Monitor network requests and responses

### Demo Commands

```bash
# Test the API endpoint directly
curl http://localhost:3000/api/reviews/hostaway

# Test with parameters
curl "http://localhost:3000/api/reviews/hostaway?includeStats=true&sortOrder=asc"
```

## Mock Data

Since the Hostaway API is sandboxed with no reviews, the integration uses mock data that follows the exact structure of real Hostaway responses. This ensures the normalization and processing logic works correctly when connected to a live API.

The mock data includes:
- Different review types (host-to-guest, guest-to-host)
- Various rating categories
- Realistic timestamps and guest information
- Multiple properties/listings

## File Structure

```
flex-living/
├── .env.local                          # Environment variables
├── app/
│   ├── api/
│   │   └── reviews/
│   │       └── hostaway/
│   │           └── route.ts            # API endpoint
│   └── reviews-demo/
│       └── page.tsx                    # Demo interface
├── lib/
│   ├── services/
│   │   └── hostaway.ts                 # Hostaway service class
│   ├── types/
│   │   └── hostaway.ts                 # TypeScript interfaces
│   └── utils/
│       └── reviewNormalizer.ts         # Data normalization utilities
└── HOSTAWAY_API.md                     # This documentation
```

## Future Enhancements

1. **Database Storage**: Store tokens in a database for persistence across restarts
2. **Retry Logic**: Implement exponential backoff for failed requests
3. **Webhook Support**: Handle real-time review updates via webhooks
4. **Batch Processing**: Support for bulk review operations
5. **Advanced Filtering**: More sophisticated filtering and search capabilities
6. **Real-time Updates**: WebSocket support for live review updates
7. **Performance Monitoring**: Add metrics and monitoring for API performance

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**:
   ```
   Error: HOSTAWAY_CLIENT_ID environment variable is required
   ```
   Solution: Ensure `.env.local` file exists with proper credentials

2. **Token Refresh Failures**:
   ```
   Error: Failed to get access token: 401 Unauthorized
   ```
   Solution: Verify your client ID and secret are correct

3. **Network Timeouts**:
   ```
   Error: Network error occurred
   ```
   Solution: Check internet connection and Hostaway API status

### Debug Mode

To enable verbose logging, add to your `.env.local`:
```bash
DEBUG=hostaway:*
```

This will output detailed information about token management and API calls.