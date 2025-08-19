import { pgTable, serial, text, timestamp, integer, varchar, jsonb } from 'drizzle-orm/pg-core';

// Reviews table that matches the Hostaway API structure
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  type: varchar('type', { length: 20 }).notNull(), // 'host-to-guest' or 'guest-to-host'
  status: varchar('status', { length: 20 }).notNull().default('published'),
  rating: integer('rating'), // Overall rating (can be null)
  publicReview: text('public_review').notNull(),
  reviewCategory: jsonb('review_category').$type<Array<{
    category: string;
    rating: number;
  }>>().notNull().default([]),
  submittedAt: timestamp('submitted_at').notNull(),
  guestName: varchar('guest_name', { length: 200 }).notNull(),
  listingName: varchar('listing_name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Hostaway tokens table for secure token storage
export const hostawayTokens = pgTable('hostaway_tokens', {
  id: serial('id').primaryKey(),
  accessToken: text('access_token').notNull(),
  tokenType: varchar('token_type', { length: 20 }).notNull().default('Bearer'),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Export types
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
export type HostawayToken = typeof hostawayTokens.$inferSelect;
export type NewHostawayToken = typeof hostawayTokens.$inferInsert;
