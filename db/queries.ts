import { db, reviews, type Review, type NewReview } from "./index";
import { eq, desc, and, ilike, count, avg } from "drizzle-orm";
import { mockReviews } from "../src/data/mockReviews";

export class ReviewsQueries {
  // Get all reviews with optional filters
  static async getAll(filters?: {
    type?: string;
    status?: string;
    listingName?: string;
    limit?: number;
  }): Promise<Review[]> {
    try {
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

      let query = db.select().from(reviews);

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }

      query = query.orderBy(desc(reviews.submittedAt)) as any;

      if (filters?.limit) {
        query = query.limit(filters.limit) as any;
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
        console.log("Mock data already exists, skipping seed.");
        return existingReviews;
      }

      // Prepare mock data for database insertion (remove id field)
      const reviewsForDb = mockReviews.map(({ id, ...review }) => review);

      // Insert mock data
      const result = await db.insert(reviews).values(reviewsForDb).returning();
      console.log(`✅ Seeded ${result.length} mock reviews`);
      return result;
    } catch (error) {
      console.error("Error seeding mock data:", error);
      return [];
    }
  }

  // Count total reviews
  static async count(): Promise<number> {
    try {
      const result = await db.select({ count: count() }).from(reviews);
      return Number(result[0]?.count) || 0;
    } catch (error) {
      console.error("Error counting reviews:", error);
      return 0;
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
