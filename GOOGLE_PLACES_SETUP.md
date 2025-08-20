# Google Places API Integration Setup

This guide explains how to set up Google Places API integration to display Google reviews alongside your existing Hostaway reviews.

## Prerequisites

1. Google Cloud Platform account
2. Google Places API enabled
3. API key with Places API permissions

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Google Places API Configuration
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Property-specific Place IDs (optional - for multiple properties)
GOOGLE_PLACE_ID=your_default_place_id_here
GOOGLE_PLACE_ID_CENTRAL=place_id_for_central_london_property
GOOGLE_PLACE_ID_CANARY=place_id_for_canary_wharf_property
GOOGLE_PLACE_ID_KINGS=place_id_for_kings_cross_property

# Admin API key for managing place ID mappings (optional)
ADMIN_API_KEY=your_admin_api_key_for_place_id_management

# For testing: The system includes a fallback Place ID for The Savoy Hotel London
# This allows you to see Google reviews immediately for testing purposes
# Place ID: ChIJjx37cOYEdkgRAG8hdvJh_t8 (The Savoy Hotel London)
```

## Getting Your Google Places API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Places API:
   - Go to "APIs & Services" → "Library"
   - Search for "Places API"
   - Click "Enable"
4. Create credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the API key
5. Restrict the API key (recommended):
   - Click on the API key to edit it
   - Under "Application restrictions", select "HTTP referrers"
   - Add your domain(s)
   - Under "API restrictions", select "Restrict key"
   - Select "Places API"

## Finding Place IDs

### Method 1: Google Places API (Place Search)
Use the Place Search API to find your property:

```bash
curl "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=YOUR_PROPERTY_NAME&inputtype=textquery&fields=place_id,name,formatted_address&key=YOUR_API_KEY"
```

### Method 2: Google Maps
1. Go to [Google Maps](https://maps.google.com/)
2. Search for your property
3. Click on the property
4. Look at the URL - the Place ID is in the URL after `place/`
5. Or use the "Share" button and look for the Place ID in the share URL

### Method 3: Place ID Finder Tool
Use Google's [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id#find-id) tool.

## Property Mapping Configuration

Update the `GOOGLE_PLACE_IDS` mapping in `/src/app/api/reviews/google/route.ts`:

```typescript
const GOOGLE_PLACE_IDS: Record<string, string> = {
  "Your Property Name 1": process.env.GOOGLE_PLACE_ID_1 || "",
  "Your Property Name 2": process.env.GOOGLE_PLACE_ID_2 || "",
  // Testing example - The Savoy Hotel London
  "1B Central London Modern Flat": "ChIJjx37cOYEdkgRAG8hdvJh_t8",
  // Add more properties as needed
};
```

**Note**: The system includes a fallback Place ID (The Savoy Hotel London) so you can see Google reviews immediately for testing, even without configuring your own Place IDs.

The property names should match the listing names used in your Hostaway integration.

## API Endpoints

### GET /api/reviews/google
Fetch Google reviews for a property.

**Query Parameters:**
- `propertyName` (optional): Name of the property to get reviews for
- `language` (optional): Language code (default: 'en')

**Example:**
```bash
GET /api/reviews/google?propertyName=Flex%20Living%20-%20Central%20London&language=en
```

**Response:**
```json
{
  "reviews": [
    {
      "id": "google_1234567890_place_id",
      "source": "google",
      "author": "John Doe",
      "authorPhoto": "https://...",
      "rating": 5,
      "text": "Amazing property!",
      "createdAt": "2024-01-15T10:30:00Z",
      "relativeTime": "2 months ago",
      "language": "en",
      "overallRating": 10,
      "comment": "Amazing property!",
      "guestName": "John Doe",
      "submittedAt": "2024-01-15T10:30:00Z",
      "type": "guest-to-host",
      "status": "published",
      "categories": {
        "overall": 10,
        "experience": 10,
        "value": 10
      }
    }
  ],
  "averageRating": 4.8,
  "totalReviews": 127,
  "propertyName": "Flex Living - Central London",
  "placeId": "ChIJ...",
  "lastUpdated": "2024-01-15T12:00:00Z"
}
```

## Usage in Components

### Basic Usage
```typescript
import { useGoogleReviewsByProperty } from '@/hooks/use-google-reviews';

function PropertyReviews({ propertyName }: { propertyName: string }) {
  const { data, isLoading, error } = useGoogleReviewsByProperty(propertyName);
  
  if (isLoading) return <div>Loading reviews...</div>;
  if (error) return <div>Error loading reviews</div>;
  
  return (
    <div>
      {data?.reviews.map(review => (
        <div key={review.id}>
          <h3>{review.author}</h3>
          <p>{review.text}</p>
          <span>{review.rating}/5 stars</span>
        </div>
      ))}
    </div>
  );
}
```

### Combined Reviews (Google + Hostaway)
```typescript
import { useCombinedListingReviews } from '@/hooks/use-combined-listing-reviews';

function CombinedPropertyReviews({ listingName }: { listingName: string }) {
  const { data, isLoading } = useCombinedListingReviews({
    listingName,
    includeGoogleReviews: true,
  });
  
  return (
    <div>
      <h2>All Reviews ({data?.totalCount || 0})</h2>
      <div>
        Google: {data?.stats.sources.google.count || 0} reviews
        Verified: {data?.stats.sources.hostaway.count || 0} reviews
      </div>
      
      {data?.reviews.map(review => (
        <div key={review.id}>
          <h3>{review.author}</h3>
          <p>{review.comment}</p>
          <span>Source: {review.source}</span>
          <span>Rating: {review.overallRating}/10</span>
        </div>
      ))}
    </div>
  );
}
```

## Rate Limits and Caching

- Google Places API has rate limits (check your quota in Google Cloud Console)
- Reviews are cached for 1 hour by default
- Consider implementing additional caching if you have high traffic

## Error Handling

The API handles various error cases:
- Invalid Place ID: Returns 400 with error message
- API quota exceeded: Returns 429
- Invalid API key: Returns 403
- General errors: Returns 500 with error details

## Testing

1. Test with a single property first
2. Verify reviews are being fetched correctly
3. Check that ratings are properly converted (Google uses 1-5, your system uses 1-10)
4. Test error scenarios (invalid Place ID, API quota exceeded)

## Security Considerations

1. **API Key Security**: 
   - Use environment variables, never commit API keys
   - Restrict API key to specific domains/IPs
   - Use separate keys for development/production

2. **Rate Limiting**: 
   - Implement client-side rate limiting if needed
   - Monitor API usage in Google Cloud Console

3. **Data Privacy**: 
   - Google review data includes user information
   - Ensure compliance with privacy regulations
   - Consider implementing opt-out mechanisms

## Troubleshooting

### Common Issues

1. **No reviews returned**: 
   - Check if Place ID is correct
   - Verify the property has Google reviews
   - Check API key permissions

2. **API key errors**:
   - Ensure Places API is enabled
   - Check API key restrictions
   - Verify environment variables are set

3. **Quota exceeded**:
   - Check usage in Google Cloud Console
   - Consider upgrading billing account
   - Implement better caching

4. **CORS errors**:
   - API calls should go through your backend (`/api/reviews/google`)
   - Don't call Google API directly from frontend

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

This will log API responses and errors to the console.

## Next Steps

1. Set up Google Cloud account and enable Places API
2. Add environment variables to your `.env.local`
3. Update property mappings in the API route
4. Test with your properties
5. Deploy and monitor API usage

For support, check the [Google Places API documentation](https://developers.google.com/maps/documentation/places/web-service/overview).