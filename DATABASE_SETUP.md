# Database Setup with Supabase & Drizzle

This guide will help you set up a Supabase database with Drizzle ORM for the Flex Living project using a clean, centralized mock data approach.

## Prerequisites

- Supabase account (free tier is sufficient)
- Node.js and pnpm installed

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `flex-living`
   - Database Password: (generate a strong password)
   - Region: Choose closest to your location
5. Click "Create new project"

## 2. Get Database Connection String

1. In your Supabase dashboard, go to **Settings** → **Database**
2. Scroll down to **Connection string**
3. Select **URI** tab
4. Copy the connection string (it looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your actual database password

## 3. Configure Environment Variables

1. Update your `.env.local` file:
   ```bash
   # Hostaway API Configuration
   HOSTAWAY_BASE_URL=https://api.hostaway.com/v1
   HOSTAWAY_CLIENT_ID=61148
   HOSTAWAY_CLIENT_SECRET=f94377ebbbb479490bb3ec364649168dc443dda2e4830facaf5de2e74ccc9152

   # Supabase Database Configuration
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```

## 4. Generate and Run Migrations

1. Generate migration files:
   ```bash
   pnpm db:generate
   ```

2. Apply migrations to your database:
   ```bash
   pnpm db:migrate
   ```

## 5. Seed Database with Mock Data

Populate your database with the centralized mock review data:

```bash
pnpm db:seed
```

This will create mock reviews from the centralized data file (`src/data/mockReviews.ts`).

## 6. Verify Setup

1. **Check tables in Supabase:**
   - Go to your Supabase dashboard
   - Navigate to **Table Editor**
   - You should see `reviews` and `hostaway_tokens` tables

2. **Test the API:**
   ```bash
   pnpm dev
   ```
   
   Then visit: `http://localhost:3000/api/reviews/hostaway`

3. **View demo page:**
   Visit: `http://localhost:3000/reviews-demo`

4. **Check database health:**
   Visit: `http://localhost:3000/api/health`

## 7. Architecture & File Structure

### Centralized Mock Data (`src/data/mockReviews.ts`)
- Single source of truth for all mock review data
- Exported to database queries, API services, and tests
- Clean separation of data and logic

### Database Schema (`db/schema.ts`)
- **Reviews Table**: Matches Hostaway API structure exactly
- **Hostaway Tokens Table**: Secure token storage with expiration

### Database Queries (`db/queries.ts`)
- Simple CRUD operations with error handling
- Built-in filtering, search, and statistics
- Uses centralized mock data for seeding

### File Structure
```
flex-living/
├── src/
│   └── data/
│       └── mockReviews.ts          # Centralized mock data
├── db/
│   ├── schema.ts                   # Database schema
│   ├── index.ts                    # Database connection
│   └── queries.ts                  # Database operations
├── scripts/
│   └── seed.ts                     # Database seeding script
└── drizzle.config.ts               # Drizzle configuration
```

## Available Scripts

```bash
# Generate migration files
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Open Drizzle Studio (database GUI)
pnpm db:studio

# Seed database with centralized mock data
pnpm db:seed
```

## Code Quality Benefits

### Clean Architecture
- **Single Responsibility**: Each file has a clear purpose
- **DRY Principle**: Mock data is defined once and reused
- **Maintainability**: Easy to add/modify reviews in one place

### Centralized Mock Data
- All services use the same data source
- Easy to update review examples
- Consistent across API, database, and tests
- Type-safe exports with proper TypeScript typing

## Deployment on Vercel

When deploying to Vercel, add the same environment variables:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add:
   - `DATABASE_URL`: Your Supabase connection string
   - `HOSTAWAY_CLIENT_ID`: 61148
   - `HOSTAWAY_CLIENT_SECRET`: f94377ebbbb479490bb3ec364649168dc443dda2e4830facaf5de2e74ccc9152
   - `HOSTAWAY_BASE_URL`: https://api.hostaway.com/v1

## Troubleshooting

### Connection Issues
- Verify your DATABASE_URL is correct
- Check that your Supabase project is active
- Ensure your IP is not blocked (Supabase allows all IPs by default)

### Migration Issues
- Make sure you've run `pnpm db:generate` before `pnpm db:migrate`
- Check that your database credentials are correct

### Seeding Issues
- Ensure migrations have been applied first
- Check the console output for specific error messages
- Verify that `src/data/mockReviews.ts` exists

## Next Steps

- The API now uses the database with centralized mock data
- Token management is persistent across server restarts
- Add more reviews by updating `src/data/mockReviews.ts`
- Use Drizzle Studio (`pnpm db:studio`) to manage data visually
- All mock data changes automatically propagate to all services