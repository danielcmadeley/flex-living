import { z } from "zod";

// Authentication schemas
export const loginSchema = z.object({
  email: z.email().min(1, "Email is required"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export const userSchema = z.object({
  id: z.string(),
  email: z.email(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Review schemas
export const reviewTypeSchema = z.enum(["host-to-guest", "guest-to-host"]);
export const reviewStatusSchema = z.enum(["published", "pending", "draft"]);

export const reviewCategorySchema = z.object({
  category: z.string(),
  rating: z.number().min(1).max(10),
});

export const normalizedReviewSchema = z.object({
  id: z.number(),
  type: reviewTypeSchema,
  status: reviewStatusSchema,
  overallRating: z.number().min(1).max(10).nullable(),
  comment: z.string(),
  categories: z.record(z.string(), z.number().optional()),
  submittedAt: z.date(),
  guestName: z.string(),
  listingName: z.string(),
  channel: z.string().optional(),
});

// API query schemas
export const reviewQuerySchema = z.object({
  type: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val === "null" || val === "undefined") return undefined;
      return val as "host-to-guest" | "guest-to-host";
    })
    .pipe(reviewTypeSchema.optional()),
  status: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val === "null" || val === "undefined") return undefined;
      return val as "published" | "pending" | "draft";
    })
    .pipe(reviewStatusSchema.optional()),
  listingName: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val === "null" || val === "undefined") return undefined;
      return val;
    }),
  limit: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val === "null" || val === "undefined") return undefined;
      const parsed = parseInt(val);
      return isNaN(parsed) ? undefined : parsed;
    }),
  sortOrder: z
    .string()
    .default("desc")
    .transform((val) => {
      if (val === "asc" || val === "desc") return val;
      return "desc";
    }),
  includeStats: z
    .string()
    .optional()
    .transform((val) => val === "true")
    .default(false),
  groupBy: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val === "null" || val === "undefined") return undefined;
      return val as "listing" | "type";
    })
    .pipe(z.enum(["listing", "type"]).optional()),
});

// API response schemas
export const reviewsApiResponseSchema = z.object({
  status: z.enum(["success", "error"]),
  data: z.array(normalizedReviewSchema),
  total: z.number(),
  message: z.string().optional(),
  statistics: z
    .object({
      overall: z.number(),
      categories: z.record(z.string(), z.number()),
      totalReviews: z.number(),
      reviewTypes: z.record(z.string(), z.number()),
    })
    .optional(),
});

// Environment variables schema
export const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  DATABASE_URL: z.string().url(),
  HOSTAWAY_CLIENT_ID: z.string().optional(),
  HOSTAWAY_CLIENT_SECRET: z.string().optional(),
  HOSTAWAY_BASE_URL: z.string().url().optional(),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type User = z.infer<typeof userSchema>;
export type ReviewType = z.infer<typeof reviewTypeSchema>;
export type ReviewStatus = z.infer<typeof reviewStatusSchema>;
export type ReviewCategory = z.infer<typeof reviewCategorySchema>;
export type NormalizedReview = z.infer<typeof normalizedReviewSchema>;
export type ReviewQuery = z.infer<typeof reviewQuerySchema>;
export type ReviewsApiResponse = z.infer<typeof reviewsApiResponseSchema>;
export type EnvConfig = z.infer<typeof envSchema>;
