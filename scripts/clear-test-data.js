#!/usr/bin/env node

/**
 * Script to clear test data from Sapa Trenggalek database
 * Use this to reset the database for fresh testing
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables");
  console.log(
    "Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearTestData() {
  console.log("🧹 Starting test data cleanup...");

  try {
    // Get count of existing entries
    const { count, error: countError } = await supabase
      .from("data_entries")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("❌ Error counting entries:", countError.message);
      return;
    }

    if (count === 0) {
      console.log("ℹ️  No data to clear");
      return;
    }

    console.log(`📊 Found ${count} entries to delete`);

    // Delete all entries
    const { error: deleteError } = await supabase
      .from("data_entries")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all (using impossible ID)

    if (deleteError) {
      console.error("❌ Error deleting entries:", deleteError.message);
      return;
    }

    console.log("✅ Successfully cleared all test data");
    console.log(
      "💡 You can now run populate-test-data.js to add fresh test data"
    );
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

// Confirm before deletion
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question(
  "⚠️  This will delete ALL data from data_entries table. Are you sure? (yes/no): ",
  (answer) => {
    if (answer.toLowerCase() === "yes") {
      clearTestData();
    } else {
      console.log("❌ Operation cancelled");
    }
    rl.close();
  }
);
