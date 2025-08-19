import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Load environment variables from .env
config({ path: ".env" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
