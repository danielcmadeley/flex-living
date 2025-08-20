/**
 * Database utilities for seeding and database management operations
 */

export interface SeedResult {
  success: boolean;
  message: string;
  count?: number;
  data?: unknown;
}

export interface DatabaseStatus {
  totalReviews: number;
  statistics: {
    total: number;
    averageRating: number;
    reviewTypes: Record<string, number>;
  };
}

export type SeedAction = "seed" | "force" | "reseed" | "clear" | "count";

/**
 * Perform a seeding operation via API
 */
export async function performSeedOperation(
  action: SeedAction,
): Promise<SeedResult> {
  try {
    // Add timestamp to prevent browser caching
    const timestamp = Date.now();
    const response = await fetch(`/api/seed?action=${action}&t=${timestamp}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`Error during ${action} operation:`, error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get current database status
 */
export async function getDatabaseStatus(): Promise<DatabaseStatus | null> {
  try {
    // Add timestamp to prevent browser caching
    const timestamp = Date.now();
    const response = await fetch(`/api/seed?t=${timestamp}`, {
      method: "GET",
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error("Error fetching database status:", error);
    return null;
  }
}

/**
 * Seed database with sample data (safe operation - only if empty)
 */
export async function seedDatabase(): Promise<SeedResult> {
  return performSeedOperation("seed");
}

/**
 * Force seed database (ignores existing data)
 */
export async function forceSeedDatabase(): Promise<SeedResult> {
  return performSeedOperation("force");
}

/**
 * Clear and reseed database
 */
export async function reseedDatabase(): Promise<SeedResult> {
  return performSeedOperation("reseed");
}

/**
 * Clear all data from database
 */
export async function clearDatabase(): Promise<SeedResult> {
  return performSeedOperation("clear");
}

/**
 * Get count of records in database
 */
export async function getDatabaseCount(): Promise<SeedResult> {
  return performSeedOperation("count");
}

/**
 * Validate if database is empty
 */
export async function isDatabaseEmpty(): Promise<boolean> {
  try {
    const status = await getDatabaseStatus();
    return status ? status.totalReviews === 0 : true;
  } catch (error) {
    console.error("Error checking if database is empty:", error);
    return true;
  }
}

/**
 * Format database statistics for display
 */
export function formatDatabaseStats(stats: DatabaseStatus): string {
  const { totalReviews, statistics } = stats;
  const avgRating = statistics.averageRating.toFixed(1);

  let message = `${totalReviews} reviews`;

  if (totalReviews > 0) {
    message += ` (avg rating: ${avgRating}/10)`;
  }

  return message;
}

/**
 * Get human-readable action description
 */
export function getActionDescription(action: SeedAction): string {
  switch (action) {
    case "seed":
      return "Seeding database with sample data";
    case "force":
      return "Force seeding database (may create duplicates)";
    case "reseed":
      return "Clearing and reseeding database";
    case "clear":
      return "Clearing all database data";
    case "count":
      return "Getting database record count";
    default:
      return "Performing database operation";
  }
}

/**
 * Validate JSON data for custom seeding
 */
export function validateSeedData(jsonData: string): {
  valid: boolean;
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonData);

    if (!Array.isArray(parsed)) {
      return { valid: false, error: "Data must be an array of records" };
    }

    if (parsed.length === 0) {
      return { valid: false, error: "Array cannot be empty" };
    }

    // Basic validation - check if first item has required fields
    const firstItem = parsed[0];
    const requiredFields = ["guestName", "comment", "rating", "listingName"];

    for (const field of requiredFields) {
      if (!(field in firstItem)) {
        return {
          valid: false,
          error: `Missing required field: ${field}`,
        };
      }
    }

    return { valid: true };
  } catch {
    return {
      valid: false,
      error: "Invalid JSON format",
    };
  }
}

/**
 * Export database data (placeholder - would need actual implementation)
 */
export async function exportDatabaseData(): Promise<{
// _format?: "json" | "csv" // Reserved for future use
  success: boolean;
  data?: string;
  error?: string;
}> {
  // This would need to be implemented with an actual export API endpoint
  return {
    success: false,
    error: "Export functionality not yet implemented",
  };
}
