#!/usr/bin/env tsx

import { config } from "dotenv";
import { ReviewsQueries } from "@/db/queries";

// Load environment variables from .env
config({ path: ".env" });

async function displayHelp() {
  console.log(`
🌱 Flex Living Database Seeding Script

Usage: npm run db:seed [command]

Commands:
  seed      - Add sample data only if database is empty (default)
  force     - Add sample data regardless of existing data
  reseed    - Clear all data and reseed with sample data
  clear     - Clear all data from database
  count     - Show current database record count
  status    - Show detailed database status
  help      - Show this help message

Examples:
  npm run db:seed
  npm run db:seed force
  npm run db:seed reseed
  npm run db:seed clear
`);
}

async function showStatus() {
  console.log("📊 Database Status:");

  try {
    const count = await ReviewsQueries.count();
    const stats = await ReviewsQueries.getStats();

    console.log(`Total reviews: ${count}`);
    console.log(`Average rating: ${stats.averageRating.toFixed(1)}/10`);

    if (Object.keys(stats.reviewTypes).length > 0) {
      console.log("Review types:");
      Object.entries(stats.reviewTypes).forEach(([type, typeCount]) => {
        console.log(`  - ${type}: ${typeCount}`);
      });
    }
  } catch (error) {
    console.error("❌ Error fetching database status:", error);
  }
}

async function seed(command: string = "seed") {
  const validCommands = [
    "seed",
    "force",
    "reseed",
    "clear",
    "count",
    "status",
    "help",
  ];

  if (!validCommands.includes(command)) {
    console.error(`❌ Invalid command: ${command}`);
    await displayHelp();
    process.exit(1);
  }

  if (command === "help") {
    await displayHelp();
    return;
  }

  if (command === "status") {
    await showStatus();
    return;
  }

  console.log(
    `🌱 ${command === "seed" ? "Seeding" : command === "force" ? "Force seeding" : command === "reseed" ? "Reseeding" : command === "clear" ? "Clearing" : "Counting"} database...`,
  );

  try {
    let result;

    switch (command) {
      case "seed":
        result = await ReviewsQueries.seedMockData();
        if (result.length === 0) {
          console.log(
            "ℹ️ Database already contains data. Use 'force' or 'reseed' to override.",
          );
        } else {
          console.log(`✅ Seeded ${result.length} reviews successfully!`);
        }
        break;

      case "force":
        result = await ReviewsQueries.forceSeedMockData();
        console.log(`✅ Force seeded ${result.length} reviews successfully!`);
        break;

      case "reseed":
        result = await ReviewsQueries.forceReseed();
        console.log(
          `✅ Cleared and reseeded ${result.length} reviews successfully!`,
        );
        break;

      case "clear":
        const cleared = await ReviewsQueries.clearAllReviews();
        if (cleared) {
          console.log("✅ Database cleared successfully!");
        } else {
          console.log("❌ Failed to clear database.");
        }
        break;

      case "count":
        const count = await ReviewsQueries.count();
        console.log(`📊 Database contains ${count} reviews`);
        break;
    }

    // Show final status for all operations except count and clear
    if (!["count", "clear"].includes(command)) {
      console.log("");
      await showStatus();
    }
  } catch (error) {
    console.error("❌ Error during database operation:", error);
    process.exit(1);
  }
}

// Get command from command line arguments
const command = process.argv[2] || "seed";
seed(command);
