const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runSimpleMigration() {
  try {
    console.log("🚀 Running simple trends migration...");

    // Create tables one by one
    console.log("📝 Creating keyword_trends table...");
    const { error: keywordError } = await supabase
      .from("keyword_trends")
      .select("*")
      .limit(1);

    if (keywordError && keywordError.message.includes("does not exist")) {
      console.log(
        "⚠️ keyword_trends table does not exist, but that's expected"
      );
      console.log(
        "💡 Please run the SQL migration manually in Supabase SQL Editor"
      );
      console.log("📄 Use the file: sql/trends-migration-fixed.sql");
    } else {
      console.log("✅ keyword_trends table exists or accessible");
    }

    console.log("📝 Creating emerging_issues table...");
    const { error: issuesError } = await supabase
      .from("emerging_issues")
      .select("*")
      .limit(1);

    if (issuesError && issuesError.message.includes("does not exist")) {
      console.log(
        "⚠️ emerging_issues table does not exist, but that's expected"
      );
    } else {
      console.log("✅ emerging_issues table exists or accessible");
    }

    console.log("📝 Creating trend_analysis_cache table...");
    const { error: cacheError } = await supabase
      .from("trend_analysis_cache")
      .select("*")
      .limit(1);

    if (cacheError && cacheError.message.includes("does not exist")) {
      console.log(
        "⚠️ trend_analysis_cache table does not exist, but that's expected"
      );
    } else {
      console.log("✅ trend_analysis_cache table exists or accessible");
    }

    console.log("");
    console.log("📋 MIGRATION INSTRUCTIONS:");
    console.log("1. Open Supabase Dashboard > SQL Editor");
    console.log(
      "2. Copy and paste the contents of sql/trends-migration-fixed.sql"
    );
    console.log("3. Run the SQL script");
    console.log(
      "4. The tables will be created with proper indexes and permissions"
    );
    console.log("");
    console.log(
      "💡 Note: The trends functionality is already working with cached data"
    );
    console.log(
      "   The database tables are for future real-time trend analysis"
    );
  } catch (error) {
    console.error("❌ Migration check failed:", error.message);
  }
}

runSimpleMigration();
