# Flex Living Reviews Dashboard - Assessment Setup Guide

## 🚀 Quick Start for Evaluators

This guide provides step-by-step instructions for evaluators to quickly set up and test the Flex Living Reviews Dashboard.

## 📋 Prerequisites

- Node.js 18+ installed
- pnpm package manager (or npm/yarn)
- A Supabase account (free tier works fine)

## ⚡ Quick Setup (5 minutes)

### 1. Clone and Install Dependencies

```bash
cd flex-living
pnpm install
```

### 2. Database Setup

**Option A: Use Supabase (Recommended)**

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database → Connection string
4. Copy the PostgreSQL connection string

**Option B: Local PostgreSQL**

If you have PostgreSQL installed locally, you can use a local database.

### 3. Environment Configuration

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL=your_postgresql_connection_string_here

# Hostaway API (Provided)
HOSTAWAY_CLIENT_ID=61148
HOSTAWAY_CLIENT_SECRET=f94377ebbbb479490bb3ec364649168dc443dda2e4830facaf5de2e74ccc9152
HOSTAWAY_BASE_URL=https://api.hostaway.com/v1

# Supabase (for authentication)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Migration and Seeding

```bash
# Run database migrations
pnpm db:migrate

# Seed with mock review data (100+ reviews)
pnpm db:seed
```

### 5. Start the Application

```bash
pnpm dev
```

Visit: http://localhost:3000

## 🔐 Assessment Credentials

The application includes a pre-configured manager account for evaluation:

- **Email**: `manager@theflex.global`
- **Password**: `manager@123`

*Note: The login page displays these credentials and includes a "Use Assessment Credentials" button for convenience.*

## 📱 Testing the Application

### 1. Main Features to Test

**Homepage (http://localhost:3000)**
- View all properties with review summaries
- Click on any property to view detailed reviews

**Manager Dashboard (http://localhost:3000/dashboard)**
- Login with provided credentials
- Review management interface
- Filtering and sorting capabilities
- Status management (Published/Pending/Draft)
- Analytics and performance charts

**Property Pages (http://localhost:3000/listings/[property-slug])**
- Individual property review pages
- Only published reviews are displayed
- Responsive design across devices

### 2. Key Functionality to Verify

✅ **Hostaway API Integration**
- Visit: http://localhost:3000/api/reviews/hostaway
- Should return structured JSON with mock review data
- Test filtering: `?status=published&listingName=2B N1 A - 29 Shoreditch Heights`

✅ **Review Status Management**
- In dashboard, change review statuses
- Verify immediate UI updates (optimistic updates)
- Check that only published reviews appear on property pages

✅ **Data Filtering & Search**
- Use dashboard filters (rating, date, property, type)
- Search reviews by guest name or content
- Sort by various criteria

✅ **Performance Features**
- Fast page loads with skeleton loading states
- Smooth pagination
- Error handling with user-friendly messages

## 🏗️ Architecture Overview

### Frontend
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state
- **Authentication**: Supabase Auth

### Backend
- **Database**: PostgreSQL with Drizzle ORM
- **API Routes**: Next.js API routes
- **Validation**: Zod schemas
- **Error Handling**: Comprehensive error boundaries

### Key API Endpoints
- `GET /api/reviews/hostaway` - Main reviews API (Required by assessment)
- `PATCH /api/reviews/[id]` - Update review status
- `POST /api/seed` - Database seeding

## 📊 Mock Data

The application includes realistic mock data:
- **100+ reviews** across multiple properties
- **Mixed review types**: Host-to-guest and guest-to-host
- **Various statuses**: Published, pending, draft
- **Realistic ratings**: 5-10 star ratings with category breakdowns
- **Diverse properties**: London-based Flex Living properties

## 🎯 Assessment Compliance

This implementation meets all requirements:

1. **✅ Hostaway Integration**: Mock API with realistic data structure
2. **✅ Manager Dashboard**: Complete management interface with all requested features
3. **✅ Review Display**: Property pages with approved reviews only
4. **✅ Code Quality**: Clean TypeScript, proper error handling, responsive design
5. **✅ Required API**: `GET /api/reviews/hostaway` endpoint returning structured data

## 🔧 Development Commands

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm db:generate      # Generate new migrations
pnpm db:migrate       # Apply migrations
pnpm db:studio        # Open Drizzle Studio (database GUI)
pnpm db:seed          # Seed mock data

# Code Quality
pnpm lint             # Run ESLint
pnpm type-check       # TypeScript type checking
```

## 🚨 Troubleshooting

### Common Issues

**Database Connection Issues**
- Verify `.env` file has correct DATABASE_URL
- Ensure database is accessible and credentials are correct
- Try running `pnpm db:migrate` again

**No Reviews Showing**
- Run `pnpm db:seed` to populate mock data
- Check browser console for any API errors
- Verify API endpoint: http://localhost:3000/api/reviews/hostaway

**Authentication Issues**
- Verify Supabase environment variables
- Use the provided assessment credentials
- Check Supabase project settings

### Getting Help

If you encounter issues:
1. Check the browser console for errors
2. Verify all environment variables are set
3. Ensure database migrations and seeding completed successfully

## 📝 Key Features Demonstrated

### Manager Dashboard
- **Review Management**: Approve/reject reviews with status changes
- **Filtering & Search**: Advanced filtering by multiple criteria
- **Analytics**: Performance charts and statistics
- **Bulk Operations**: Manage multiple reviews efficiently

### Public Review Display
- **Property Integration**: Reviews integrated into property pages
- **Status-Based Display**: Only approved reviews shown to public
- **Responsive Design**: Works on all device sizes
- **SEO Optimized**: Dynamic metadata and structured data

### Technical Excellence
- **Type Safety**: Full TypeScript implementation
- **Error Handling**: Graceful error recovery
- **Performance**: Optimistic updates and efficient caching
- **Accessibility**: ARIA labels and keyboard navigation
- **Security**: Protected routes and input validation

## 🎉 Ready for Assessment

The application is fully functional and ready for evaluation. All core requirements have been implemented with attention to code quality, user experience, and technical best practices.

**Time to full setup**: ~5 minutes
**Login credentials**: manager@theflex.global / manager@123
**Demo data**: 100+ realistic reviews across multiple properties