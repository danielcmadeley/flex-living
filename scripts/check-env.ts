#!/usr/bin/env tsx

import { config } from "dotenv";

// Load environment variables from .env
config({ path: ".env" });

function checkEnvironment() {
  console.log("🔍 Checking environment configuration...\n");

  const requiredVars = [
    "DATABASE_URL",
    "HOSTAWAY_CLIENT_ID",
    "HOSTAWAY_CLIENT_SECRET",
    "HOSTAWAY_BASE_URL",
  ];

  const missingVars = [];
  const validVars = [];

  requiredVars.forEach((varName) => {
    const value = process.env[varName];
    if (!value) {
      missingVars.push(varName);
    } else {
      validVars.push(varName);
    }
  });

  // Show valid variables
  if (validVars.length > 0) {
    console.log("✅ Found environment variables:");
    validVars.forEach((varName) => {
      const value = process.env[varName];
      if (varName.includes("SECRET") || varName.includes("PASSWORD")) {
        console.log(`   ${varName}: ${"*".repeat(20)}...`);
      } else if (varName === "DATABASE_URL") {
        // Mask sensitive parts of database URL
        const maskedUrl = value!.replace(/:([^:@]+)@/, ":****@");
        console.log(`   ${varName}: ${maskedUrl}`);
      } else {
        console.log(`   ${varName}: ${value}`);
      }
    });
    console.log("");
  }

  // Show missing variables
  if (missingVars.length > 0) {
    console.log("❌ Missing environment variables:");
    missingVars.forEach((varName) => {
      console.log(`   ${varName}`);
    });
    console.log("");

    console.log("📋 Setup Instructions:");
    console.log("");
    console.log("1. Create a Supabase project at https://supabase.com");
    console.log(
      "2. Get your DATABASE_URL from: Settings → Database → Connection string",
    );
    console.log("3. Create/update your .env file with:");
    console.log("");

    missingVars.forEach((varName) => {
      switch (varName) {
        case "DATABASE_URL":
          console.log(
            `   ${varName}=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres`,
          );
          break;
        case "HOSTAWAY_CLIENT_ID":
          console.log(`   ${varName}=61148`);
          break;
        case "HOSTAWAY_CLIENT_SECRET":
          console.log(
            `   ${varName}=f94377ebbbb479490bb3ec364649168dc443dda2e4830facaf5de2e74ccc9152`,
          );
          break;
        case "HOSTAWAY_BASE_URL":
          console.log(`   ${varName}=https://api.hostaway.com/v1`);
          break;
        default:
          console.log(`   ${varName}=your_value_here`);
      }
    });
    console.log("");
    console.log("4. Then run this command again to verify");
    console.log("");
    return false;
  }

  // Test database URL format
  if (process.env.DATABASE_URL) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl.startsWith("postgresql://")) {
      console.log(
        '⚠️  Warning: DATABASE_URL should start with "postgresql://"',
      );
      console.log("   Current format:", dbUrl.split("://")[0] + "://...");
      console.log("");
    }
  }

  console.log("🎉 Environment configuration looks good!");
  console.log("");
  console.log("🚀 Next steps:");
  console.log("1. Run: pnpm db:migrate");
  console.log("2. Run: pnpm db:seed");
  console.log("3. Run: pnpm dev");
  console.log("4. Visit: http://localhost:3000/api/health");
  console.log("");

  return true;
}

if (require.main === module) {
  const isValid = checkEnvironment();
  process.exit(isValid ? 0 : 1);
}

export { checkEnvironment };
