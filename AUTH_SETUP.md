# Authentication Setup with Supabase

This guide will help you set up Supabase authentication for the Flex Living manager dashboard.

## Prerequisites

- Supabase project already created (from DATABASE_SETUP.md)
- Next.js project with Supabase database configured

## 1. Environment Variables

Add these environment variables to your `.env` file:

```env
# Supabase Auth Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Getting Your Supabase Credentials

1. Go to your Supabase dashboard
2. Navigate to **Settings** → **API**
3. Copy the following:
   - **Project URL** (use for `NEXT_PUBLIC_SUPABASE_URL`)
   - **Project API keys** → **anon public** (use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

## 2. Configure Supabase Auth

### Enable Email Authentication

1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Under **Auth Providers**, ensure **Email** is enabled
3. Configure **Site URL** to `http://localhost:3000` for development
4. Add production URL when deploying

### Configure Redirect URLs

1. In **Authentication** → **URL Configuration**
2. Add these redirect URLs:
   - `http://localhost:3000/dashboard` (development)
   - `https://yourdomain.com/dashboard` (production)

## 3. Create Manager User

### Option A: Using Supabase Dashboard
1. Go to **Authentication** → **Users**
2. Click **Add user**
3. Enter manager email and password
4. Click **Create user**

### Option B: Using SQL (Recommended for production)
```sql
-- Create manager user with encrypted password
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'manager@flexliving.com',
  crypt('your-secure-password', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);
```

## 4. Test Authentication

1. Start your development server:
   ```bash
   pnpm dev
   ```

2. Navigate to `http://localhost:3000/dashboard`
   - You should be redirected to `/login`

3. Try to log in with your manager credentials
   - On successful login, you should be redirected to `/dashboard`

4. Test logout functionality
   - Click the "Sign out" button in the dashboard
   - You should be redirected back to `/login`

## 5. Security Considerations

### Row Level Security (RLS)
Consider enabling RLS on your database tables to ensure managers can only access their own data:

```sql
-- Enable RLS on reviews table
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Managers can view all reviews" ON reviews
  FOR ALL TO authenticated
  USING (true);
```

### Password Requirements
Consider adding password requirements in Supabase:

1. Go to **Authentication** → **Settings**
2. Under **Password Requirements**, configure:
   - Minimum length (e.g., 8 characters)
   - Require uppercase, lowercase, numbers, symbols

## 6. Production Deployment

When deploying to production:

1. Update environment variables with production URLs
2. Configure production redirect URLs in Supabase
3. Set up proper CORS settings
4. Consider enabling email confirmation for new users
5. Set up password reset functionality

## 7. Troubleshooting

### Common Issues

**"Invalid login credentials"**
- Verify email and password are correct
- Check if user exists in Supabase Auth dashboard
- Ensure email is confirmed (if email confirmation is enabled)

**Redirect loops**
- Check middleware configuration
- Verify redirect URLs are properly configured
- Ensure environment variables are set correctly

**Session not persisting**
- Check if cookies are being set properly
- Verify middleware is running on protected routes
- Check browser developer tools for auth-related cookies

### Debug Mode
Add this to your login page for debugging:

```typescript
// Add to login page for debugging
useEffect(() => {
  const checkUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    console.log('Current user:', user)
    console.log('Auth error:', error)
  }
  checkUser()
}, [])
```

## 8. Next Steps

Once authentication is working:

1. Build the main dashboard UI components
2. Add role-based permissions if needed
3. Implement review management features
4. Add audit logging for manager actions

## Support

If you encounter issues:
- Check Supabase documentation: https://supabase.com/docs/guides/auth
- Review Next.js SSR guide: https://supabase.com/docs/guides/auth/server-side/nextjs
- Check the Supabase community: https://github.com/supabase/supabase/discussions