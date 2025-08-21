import { db, reviews, type Review, type NewReview } from "./index";
import { eq, desc, and, or, ilike, count, avg } from "drizzle-orm";
import { mockReviews } from "@/data/mockReviews";

export class ReviewsQueries {
  // Get all reviews with optional filters and pagination
  static async getAll(filters?: {
    type?: string;
    status?: string;
    listingName?: string;
    searchTerm?: string;
    limit?: number;
    offset?: number;
  }): Promise<Review[]> {
    try {
      // Build query conditions
      const conditions = [];

      if (filters?.type) {
        conditions.push(eq(reviews.type, filters.type));
      }
      if (filters?.status) {
        conditions.push(eq(reviews.status, filters.status));
      }
      if (filters?.listingName) {
        conditions.push(ilike(reviews.listingName, `%${filters.listingName}%`));
      }
      if (filters?.searchTerm) {
        const searchTerm = `%${filters.searchTerm}%`;
        conditions.push(
          or(
            ilike(reviews.guestName, searchTerm),
            ilike(reviews.publicReview, searchTerm),
            ilike(reviews.listingName, searchTerm),
          ),
        );
      }

      // Build base query
      const baseQuery = db.select().from(reviews);

      // Apply conditions if any
      const queryWithConditions =
        conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

      // Build final query with ordering and pagination
      let query = queryWithConditions.orderBy(desc(reviews.submittedAt));

      // Apply pagination using type assertion to work around Drizzle TypeScript issues
      if (filters?.limit !== undefined) {
        if (filters?.offset !== undefined) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          query = (query as any).limit(filters.limit).offset(filters.offset);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          query = (query as any).limit(filters.limit);
        }
      } else if (filters?.offset !== undefined) {
        // If only offset is provided, we need to add a reasonable limit to avoid issues
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        query = (query as any).limit(1000).offset(filters.offset);
      }

      return await query;
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return [];
    }
  }

  // Get review by ID
  static async getById(id: number): Promise<Review | null> {
    try {
      const result = await db
        .select()
        .from(reviews)
        .where(eq(reviews.id, id))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Error fetching review by ID:", error);
      return null;
    }
  }

  // Create new review
  static async create(
    reviewData: Omit<NewReview, "createdAt" | "updatedAt">,
  ): Promise<Review | null> {
    try {
      const result = await db
        .insert(reviews)
        .values({
          ...reviewData,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error("Error creating review:", error);
      return null;
    }
  }

  // Update review
  static async update(
    id: number,
    updates: Partial<NewReview>,
  ): Promise<Review | null> {
    try {
      const result = await db
        .update(reviews)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(reviews.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error("Error updating review:", error);
      return null;
    }
  }

  // Delete review
  static async delete(id: number): Promise<boolean> {
    try {
      await db.delete(reviews).where(eq(reviews.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting review:", error);
      return false;
    }
  }

  // Get reviews statistics
  static async getStats() {
    try {
      const stats = await db
        .select({
          totalReviews: count(reviews.id),
          averageRating: avg(reviews.rating),
        })
        .from(reviews);

      const reviewTypes = await db
        .select({
          type: reviews.type,
          count: count(reviews.id),
        })
        .from(reviews)
        .groupBy(reviews.type);

      return {
        total: Number(stats[0]?.totalReviews) || 0,
        averageRating: Number(stats[0]?.averageRating) || 0,
        reviewTypes: reviewTypes.reduce(
          (acc, item) => {
            acc[item.type] = Number(item.count);
            return acc;
          },
          {} as Record<string, number>,
        ),
      };
    } catch (error) {
      console.error("Error fetching stats:", error);
      return {
        total: 0,
        averageRating: 0,
        reviewTypes: {},
      };
    }
  }

  // Search reviews by guest name
  static async search(
    searchTerm: string,
    limit: number = 10,
  ): Promise<Review[]> {
    try {
      return await db
        .select()
        .from(reviews)
        .where(ilike(reviews.guestName, `%${searchTerm}%`))
        .limit(limit)
        .orderBy(desc(reviews.submittedAt));
    } catch (error) {
      console.error("Error searching reviews:", error);
      return [];
    }
  }

  // Seed database with mock data
  static async seedMockData(): Promise<Review[]> {
    try {
      // Check if data already exists
      const existingReviews = await this.getAll({ limit: 1 });
      if (existingReviews.length > 0) {
        return existingReviews;
      }

      // Prepare mock data for database insertion (remove id field)
      const reviewsForDb = mockReviews.map((mockReview) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _, ...review } = mockReview;
        return review;
      });

      // Insert mock data
      const result = await db.insert(reviews).values(reviewsForDb).returning();
      return result;
    } catch (error) {
      console.error("Error seeding mock data:", error);
      return [];
    }
  }

  // Force reseed - clears existing data and seeds fresh
  static async forceReseed(): Promise<Review[]> {
    try {
      await db.delete(reviews);

      const reviewsForDb = mockReviews.map((mockReview) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _, ...review } = mockReview;
        return review;
      });

      const result = await db.insert(reviews).values(reviewsForDb).returning();
      return result;
    } catch (error) {
      console.error("Error force reseeding:", error);
      return [];
    }
  }

  // Seed without checking for existing data
  static async forceSeedMockData(): Promise<Review[]> {
    try {
      // Prepare mock data for database insertion (remove id field)
      const reviewsForDb = mockReviews.map((mockReview) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _, ...review } = mockReview;
        return review;
      });

      // Insert mock data without checking for existing
      const result = await db.insert(reviews).values(reviewsForDb).returning();
      return result;
    } catch (error) {
      console.error("Error force seeding mock data:", error);
      return [];
    }
  }

  // Clear all reviews
  static async clearAllReviews(): Promise<boolean> {
    try {
      await db.delete(reviews);
      return true;
    } catch (error) {
      console.error("Error clearing reviews:", error);
      return false;
    }
  }

  // Count total reviews with optional filters
  static async count(filters?: {
    type?: string;
    status?: string;
    listingName?: string;
    searchTerm?: string;
  }): Promise<number> {
    try {
      // Build query conditions (same as getAll)
      const conditions = [];

      if (filters?.type) {
        conditions.push(eq(reviews.type, filters.type));
      }
      if (filters?.status) {
        conditions.push(eq(reviews.status, filters.status));
      }
      if (filters?.listingName) {
        conditions.push(ilike(reviews.listingName, `%${filters.listingName}%`));
      }
      if (filters?.searchTerm) {
        const searchTerm = `%${filters.searchTerm}%`;
        conditions.push(
          or(
            ilike(reviews.guestName, searchTerm),
            ilike(reviews.publicReview, searchTerm),
            ilike(reviews.listingName, searchTerm),
          ),
        );
      }

      // Build count query
      const baseQuery = db.select({ count: count() }).from(reviews);

      // Apply conditions if any
      const finalQuery =
        conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

      const result = await finalQuery;
      return Number(result[0]?.count) || 0;
    } catch (error) {
      console.error("Error counting reviews:", error);
      return 0;
    }
  }

  // Get paginated reviews with total count
  static async getPaginated(filters?: {
    type?: string;
    status?: string;
    listingName?: string;
    searchTerm?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ reviews: Review[]; total: number }> {
    try {
      // Get total count with same filters (excluding pagination)
      const total = await this.count({
        type: filters?.type,
        status: filters?.status,
        listingName: filters?.listingName,
        searchTerm: filters?.searchTerm,
      });

      // Get paginated reviews
      const reviewsData = await this.getAll(filters);

      return {
        reviews: reviewsData,
        total,
      };
    } catch (error) {
      console.error("Error fetching paginated reviews:", error);
      return {
        reviews: [],
        total: 0,
      };
    }
  }

  // Update review status
  static async updateStatus(
    reviewId: number,
    status: "published" | "pending" | "draft",
  ): Promise<Review | null> {
    try {
      const updatedReview = await db
        .update(reviews)
        .set({
          status,
          updatedAt: new Date(),
        })
        .where(eq(reviews.id, reviewId))
        .returning();

      return updatedReview.length > 0 ? updatedReview[0] : null;
    } catch (error) {
      console.error("Error updating review status:", error);
      throw error;
    }
  }

  // Get reviews by listing name
  static async getByListing(listingName: string): Promise<Review[]> {
    try {
      return await db
        .select()
        .from(reviews)
        .where(ilike(reviews.listingName, `%${listingName}%`))
        .orderBy(desc(reviews.submittedAt));
    } catch (error) {
      console.error("Error fetching reviews by listing:", error);
      return [];
    }
  }

  // Get recent reviews
  static async getRecent(limit: number = 5): Promise<Review[]> {
    try {
      return await db
        .select()
        .from(reviews)
        .orderBy(desc(reviews.submittedAt))
        .limit(limit);
    } catch (error) {
      console.error("Error fetching recent reviews:", error);
      return [];
    }
  }
}
