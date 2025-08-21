# Flex Living Reviews Dashboard

A comprehensive reviews management system for Flex Living properties, integrating Hostaway and Google Reviews APIs to provide managers with actionable insights and control over public review displays.

## 🚀 Tech Stack

### Core Framework
- **Next.js 15** - Full-stack React framework with App Router
- **TypeScript** - Type-safe development with strict mode enabled
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development

### Database & Backend
- **Supabase** - PostgreSQL database with real-time capabilities
- **Drizzle ORM** - Type-safe database queries and migrations
- **Zod** - Runtime type validation and schema parsing

### State Management & Data Fetching
- **Zustand** - Lightweight state management with Immer for immutable updates
- **TanStack Query (React Query)** - Server state management with caching
- **TanStack Table** - Powerful table component for data display

### UI Components
- **Radix UI** - Accessible component primitives
- **Lucide React** - Modern icon library
- **Custom Component Library** - Built on top of Radix with Tailwind styling

### API Integration
- **Hostaway API** - Property management and review data
- **Google Places API** - Google Reviews integration
- **Rate Limiting** - Custom middleware for API protection

## 🏗️ Architecture Overview

### Project Structure
```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/reviews/       # API endpoints for review data
│   ├── dashboard/         # Manager dashboard interface
│   └── listings/          # Public property pages
├── components/            # Reusable UI components
├── db/                   # Database schema and queries
├── hooks/                # Custom React hooks
├── lib/                  # Utilities, constants, and configurations
└── stores/               # Zustand state management
```

### Data Flow Architecture

1. **Data Sources** → Multiple review sources (Hostaway, Google Reviews)
2. **API Layer** → Normalization and validation (`/api/reviews/*`)
3. **State Management** → Zustand stores with TanStack Query caching
4. **UI Components** → React components with TypeScript interfaces
5. **Database** → Supabase PostgreSQL with Drizzle ORM

### Key Architectural Decisions

**1. API-First Design**
- Centralized review normalization in `/api/reviews/hostaway` and `/api/reviews/google`
- Consistent data structure across different review sources
- Rate limiting and error handling at the API level

**2. Component Composition**
- Modular components with single responsibility principle
- Compound component patterns for complex UI elements
- Separation of client and server components

**3. Type Safety**
- Zod schemas for runtime validation
- TypeScript interfaces for compile-time safety
- End-to-end type safety from database to UI

## 🔗 Google Reviews Integration

### Implementation Overview

The Google Reviews integration uses the Google Places API to fetch authentic guest reviews for properties. This provides managers with a complete view of their property's reputation across all platforms.

### Technical Implementation

**1. API Configuration**
```typescript
// Google Place IDs mapped to properties
const GOOGLE_PLACE_IDS: Record<string, string> = {
  "Property Name": "ChIJB9OTMDIbdkgRp0JWbQGZsS8",
  // ... other properties
};

// API endpoint: /api/reviews/google
```

**2. Review Normalization**
- Transforms Google's review format into our standard schema
- Handles multiple languages and translations
- Preserves original timestamps and author information

**3. Data Merging**
- Combines Google Reviews with Hostaway data
- Unified interface in the dashboard
- Source attribution for transparency

### Google Places API Costs & Considerations

#### 💰 Cost Structure (as of 2024)
- **Places API - Place Details**: $17 per 1,000 requests
- **Reviews are included** in Place Details requests
- **Minimum charge**: $200/month credit requirement
- **Request optimization**: Cached responses reduce API calls

#### Cost Optimization Strategies Implemented
1. **Smart Caching**: 6-hour cache for review data to minimize API calls
2. **Selective Updates**: Only fetch when property data changes
3. **Batch Processing**: Group requests for multiple properties
4. **Error Handling**: Graceful fallbacks to prevent unnecessary retries

#### 🚨 Drawbacks & Limitations

**1. Cost Implications**
- **High per-request cost**: $17/1000 requests can scale quickly
- **Monthly minimum**: $200 commitment regardless of usage
- **Scaling concerns**: Costs grow linearly with property portfolio

**2. API Limitations**
- **5 reviews maximum** per property in most cases
- **No real-time updates**: Reviews may be delayed
- **Rate limiting**: 100 requests per 100 seconds per user
- **Geographic restrictions**: Some regions have limited data

**3. Technical Challenges**
- **API key management**: Requires secure key rotation
- **Quota management**: Risk of hitting daily/monthly limits
- **Error handling**: API downtime affects review display
- **Data consistency**: Google's review sorting may change

**4. Business Considerations**
- **Limited control**: Cannot filter or moderate Google reviews
- **Review authenticity**: Potential for fake or biased reviews
- **Competitor visibility**: Public reviews visible to competition
- **Response management**: Requires separate Google My Business setup

### Alternative Approaches Considered

**1. Web Scraping** (Not Recommended)
- Violates Google's Terms of Service
- Unreliable due to anti-bot measures
- Legal and ethical concerns

**2. Third-party Services**
- Higher costs but simpler implementation
- Less control over data and caching
- Additional vendor dependency

**3. Google My Business API** (Limited)
- Only works for business-owned properties
- Requires business verification
- Limited review data access

## 🛠️ Key Features Implemented

### Manager Dashboard
- **Multi-view Interface**: Grid and table views for different use cases
- **Advanced Filtering**: By property, rating, status, date range, and source
- **Bulk Operations**: Mass status updates for review management
- **Real-time Search**: Instant filtering across all review content
- **Statistics Dashboard**: Performance metrics and trend analysis

### Review Management
- **Status Control**: Published/Pending/Draft workflow
- **Source Integration**: Unified view of Hostaway and Google reviews
- **Quality Indicators**: Rating distributions and category breakdowns
- **Export Capabilities**: Data export for reporting and analysis

### Public Display
- **Approved Reviews Only**: Only published reviews appear on property pages
- **Source Attribution**: Clear indication of review origin
- **Responsive Design**: Optimized for all device sizes
- **Performance Optimized**: Cached data and lazy loading

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- Supabase account and project
- Google Cloud Platform account (for Places API)

### Environment Variables
```bash
# Database
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."

# Google Places API
GOOGLE_PLACES_API_KEY="AIza..."

# Hostaway API
HOSTAWAY_CLIENT_ID="your-client-id"
HOSTAWAY_CLIENT_SECRET="your-client-secret"
```

### Installation & Setup
```bash
# Install dependencies
pnpm install

# Run database migrations
pnpm db:push

# Seed development data
pnpm dev
# Navigate to /dashboard/seed to populate sample data

# Start development server
pnpm dev
```

### Production Deployment
```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## 📊 Performance & Monitoring

### Built-in Features
- **Rate Limiting**: Prevents API abuse and manages costs
- **Error Boundaries**: Graceful error handling in UI
- **Loading States**: Skeleton screens and progressive loading
- **Caching Strategy**: Multiple levels of data caching

### Monitoring Recommendations
- Monitor Google API usage and costs in Google Cloud Console
- Track review fetch failures and implement alerting
- Monitor database performance for large datasets
- Set up cost alerts for API usage spikes

## 🔒 Security Considerations

- **API Key Protection**: Server-side only API key usage
- **Rate Limiting**: Prevents abuse and controls costs
- **Input Validation**: Zod schemas validate all inputs
- **Authentication**: Supabase auth integration
- **CORS Configuration**: Restricted origin policies

## 🎯 Future Enhancements

### Planned Features
- **Automated Review Responses**: Template-based response system
- **Advanced Analytics**: Sentiment analysis and trend prediction
- **Multi-language Support**: Automated translation capabilities
- **Review Aggregation**: Industry benchmarking and competitor analysis

### Scalability Considerations
- **Microservice Architecture**: Split review sources into separate services
- **Event-driven Updates**: Real-time review synchronization
- **CDN Integration**: Global content distribution
- **Database Sharding**: Handle large-scale property portfolios

---

## 📝 API Documentation

### Hostaway Reviews Endpoint
```
GET /api/reviews/hostaway
Query Parameters:
- status: published|pending|draft
- listingName: string
- includeStats: boolean
- limit: number
- sortOrder: asc|desc
```

### Google Reviews Endpoint
```
GET /api/reviews/google
Query Parameters:
- propertyName: string
- language: string (optional)
- refresh: boolean (force cache refresh)
```

### Combined Reviews Endpoint
```
GET /api/reviews/combined/[propertyName]
Returns: Merged Hostaway and Google reviews for a property
```

---

**Built with ❤️ for Flex Living property management**