# 🚀 Quick Start Guide - Supabase Database Setup

This guide will get you up and running with the Flex Living database in under 10 minutes.

## 📋 Prerequisites

- Node.js and pnpm installed
- A Supabase account (free tier is fine)

## 🎯 Step-by-Step Setup

### 1. Create Supabase Project

1. **Go to [supabase.com](https://supabase.com)** and sign up/login
2. **Click "New Project"**
3. **Fill in project details:**
   - Name: `flex-living` (or any name you prefer)
   - Database Password: Generate a strong password and **save it**
   - Region: Choose closest to your location
4. **Click "Create new project"**
5. **Wait for project creation** (takes 2-3 minutes)

### 2. Get Database Connection String

1. **In your Supabase dashboard, go to:**
   ```
   Settings → Database → Connection string
   ```

2. **Select the "URI" tab**

3. **Copy the connection string** (it looks like this):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

4. **Replace `[YOUR-PASSWORD]` with your actual database password**

### 3. Configure Environment Variables

1. **Create `.env.local` file in your project root:**
   ```bash
   touch .env.local
   ```

2. **Add the following content** (replace with your actual DATABASE_URL):
   ```env
   # Supabase Database Configuration
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres

   # Hostaway API Configuration
   HOSTAWAY_BASE_URL=https://api.hostaway.com/v1
   HOSTAWAY_CLIENT_ID=61148
   HOSTAWAY_CLIENT_SECRET=f94377ebbbb479490bb3ec364649168dc443dda2e4830facaf5de2e74ccc9152
   ```

### 4. Verify Configuration

Run the environment check:
```bash
pnpm db:check
```

✅ **Expected output:** "Environment configuration looks good!"

❌ **If it fails:** Double-check your `.env.local` file and DATABASE_URL

### 5. Generate and Run Migrations

```bash
# Generate migration files
pnpm db:generate

# Apply migrations to database
pnpm db:migrate
```

✅ **Expected output:** Migration files created and applied successfully

### 6. Seed Database with Mock Data

```bash
pnpm db:seed
```

✅ **Expected output:** "Seeded X mock reviews"

### 7. Test Your Setup

1. **Start the development server:**
   ```bash
   pnpm dev
   ```

2. **Test the API endpoints:**
   - Health check: http://localhost:3000/api/health
   - Reviews API: http://localhost:3000/api/reviews/hostaway
   - Demo page: http://localhost:3000/reviews-demo

3. **Check your Supabase dashboard:**
   - Go to **Table Editor**
   - You should see `reviews` and `hostaway_tokens` tables
   - The `reviews` table should have mock data

## 🎉 You're Done!

Your database is now set up and ready to use. Here's what you've accomplished:

- ✅ Supabase database connected
- ✅ Tables created with proper schema
- ✅ Mock data loaded
- ✅ API endpoints working
- ✅ Token management configured

## 🛠️ Available Commands

```bash
# Database operations
pnpm db:check        # Check environment configuration
pnpm db:generate     # Generate migration files
pnpm db:migrate      # Apply migrations
pnpm db:seed         # Seed with mock data
pnpm db:studio       # Open database GUI

# Development
pnpm dev            # Start development server
pnpm build          # Build for production
```

## 🔍 Troubleshooting

### Environment Issues
- **"Missing environment variables"** → Check your `.env.local` file
- **"Database connection failed"** → Verify your DATABASE_URL is correct

### Migration Issues
- **"No schema files found"** → Run `pnpm db:generate` first
- **"Permission denied"** → Check your Supabase project is active

### Seeding Issues
- **"Error seeding database"** → Ensure migrations ran successfully
- **"Mock data already exists"** → This is normal, data won't be duplicated

## 🚀 Deployment to Vercel

1. **Push your code to GitHub**
2. **Connect to Vercel**
3. **Add environment variables in Vercel dashboard:**
   - Go to: Settings → Environment Variables
   - Add all variables from your `.env.local`
4. **Deploy!**

## 📚 Next Steps

- Explore the database schema in `db/schema.ts`
- Check out the API documentation in `HOSTAWAY_API.md`
- Add more mock data in `src/data/mockReviews.ts`
- Use Drizzle Studio (`pnpm db:studio`) for visual database management

## 💡 Pro Tips

- **Keep your DATABASE_URL secure** - never commit it to version control
- **Use Drizzle Studio** for easy database browsing and editing
- **The mock data is centralized** in `src/data/mockReviews.ts` for easy maintenance
- **Token management is automatic** - no need to manually refresh API tokens

---

**Need help?** Check the full documentation in `DATABASE_SETUP.md` or the API docs in `HOSTAWAY_API.md`.