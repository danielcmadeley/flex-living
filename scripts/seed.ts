#!/usr/bin/env tsx

import { config } from "dotenv";
import { ReviewsQueries } from "../db/queries";

// Load environment variables from .env
config({ path: ".env" });

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    await ReviewsQueries.seedMockData();
    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
