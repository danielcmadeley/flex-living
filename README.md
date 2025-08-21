Flex Living Reviews Dashboard — Developer Guide (v0.1.0)

I built this system to pull reviews from Hostaway and Google Places, clean them into a single format, and give managers control over which reviews get published on property pages. Managers see everything in a moderation dashboard; only approved reviews make it out to the public.

Think of it as a reputation control center for Flex Living.

1) Getting It Running Locally
You’ll Need

Node.js 18+

pnpm

A Supabase project (or any Postgres DB if you’re just experimenting)

Google Cloud account with Places API enabled

Hostaway API credentials

(Optional) Upstash Redis for rate limiting

Environment

I keep my config in .env.local:

DATABASE_URL="postgresql://user:pass@host:5432/db"

NEXT_PUBLIC_SUPABASE_URL="https://<project>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon-key>"

GOOGLE_PLACES_API_KEY="<key>"

HOSTAWAY_CLIENT_ID="<id>"
HOSTAWAY_CLIENT_SECRET="<secret>"

# Optional: rate limiting
UPSTASH_REDIS_REST_URL="https://<id>.upstash.io"
UPSTASH_REDIS_REST_TOKEN="<token>"

Bootstrapping
pnpm install
pnpm db:generate   # generate SQL from schema
pnpm db:migrate    # apply migrations
pnpm dev           # start on http://localhost:3000


/dashboard/seed → fake data for testing

/dashboard → moderation dashboard

/listings → public property pages

Production
pnpm build
pnpm start


On deployment (Vercel works fine), I just set the same env vars in the hosting platform.

2) Tech Choices and Why I Picked Them

Next.js 15 + React 19 → future-proof with App Router and server components.

Tailwind v4 → import-only, zero-config styling.

Supabase + Drizzle ORM → Postgres I can trust, migrations I can control.

Zod → every boundary has runtime validation. I sleep better.

TanStack Query + Zustand → Query handles async state and retries; Zustand covers light UI state like filters.

Radix UI + Lucide + next-themes → consistent UI, theming, and accessibility without fuss.

Upstash Ratelimit → Google won’t eat my budget.

Vitest + Testing Library + MSW → fast tests with good API mocking.

The theme: type-safety, low maintenance, and guardrails against external APIs misbehaving.

3) How the Data Flows

Hostaway and Google reviews come in.

I run them through API routes that normalise everything into a single Review schema.

Google responses are cached for 6 hours to keep costs down.

Zustand and TanStack Query drive the dashboard state.

Supabase/Postgres keeps track of moderation state (published|pending|draft).

Everything that crosses the boundary goes through Zod schemas so I’m never working with unknown shapes.

4) API Behaviour in Practice

/api/reviews/hostaway → talks to Hostaway, with filters like status, listingName, limit.

/api/reviews/google → wraps Google Places “Place Details.” Usually only ~5 reviews max per property (Google limitation).

/api/reviews/combined/[propertyName] → merges both, dedupes, and sorts newest first.

Everything returns a standard Review object:

type Review = {
  id: string;
  source: "hostaway" | "google";
  externalId: string;
  propertyName: string;
  rating: number; // 1–5
  text: string;
  author?: { name?: string; avatarUrl?: string };
  createdAt: string;
  status: "published" | "pending" | "draft";
};


If I see 429, it means the rate limiter kicked in. If I see 502, it usually means Google or Hostaway had a bad day.

5) Google Reviews: What I Learned

Cost: A Place Details call is about $17 per 1,000. Google forces a $200/month minimum if I go beyond free credits.

Limits: The API only gives me around 5 reviews per property. Updates aren’t real-time.

Caching: I cache results for 6 hours. If I need fresh data, I can hit refresh=true — but I do this sparingly.

Moderation: I can’t filter Google reviews upstream. The dashboard decides whether they get published.

Bottom line: Google reviews add context but aren’t the full story. I treat Hostaway as the primary source.

6) Day-to-Day Development

I rely on these scripts:

pnpm dev              # run locally
pnpm db:studio        # open Drizzle Studio
pnpm seed             # populate fake data
pnpm test             # run tests
pnpm test:rate-limit  # exercise the 429 logic


Code lives in predictable places:

src/components → Radix-based UI

src/app/api/reviews → API routes

src/stores → Zustand state

Tests use Vitest + Testing Library + MSW (mock APIs instead of hitting Google/Hostaway directly).

7) Security and Ops

API keys stay server-side. I never expose them to the client.

CORS is restricted to known origins.

Everything goes through Zod validation.

Upstash rate limits make sure one property refresh loop doesn’t drain the budget.

I set up budget alerts in GCP because Google billing surprises are no joke.

8) What’s Next

Auto-response templates for managers.

Sentiment analysis for trends.

Proper multi-language support.

Event-driven sync once the property list grows.

TL;DR

The system is designed to be type-safe, cost-aware, and resilient to flaky APIs. If something breaks, I first check:

My env vars

DB migrations

Hostaway/Google credentials

Whether I hit the rate limiter

And yes — I’ve already blown past the free Google quota once. Don’t repeat my mistake.

Built with ❤️, but also with guardrails, so you don’t burn money or sanity when fetching reviews.
