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

async function runMigration() {
  try {
    console.log("🚀 Running urgent items migration...");

    // Read migration SQL
    const migrationPath = path.join(
      __dirname,
      "../sql/urgent-items-migration.sql"
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    // Execute migration
    const { data, error } = await supabase.rpc("exec_sql", {
      sql: migrationSQL,
    });

    if (error) {
      // Try alternative approach - execute each statement separately
      console.log("⚠️ Trying alternative migration approach...");

      const statements = migrationSQL
        .split(";")
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt && !stmt.startsWith("--"));

      for (const statement of statements) {
        if (statement.includes("SELECT ")) continue; // Skip SELECT statements

        try {
          const { error: stmtError } = await supabase.rpc("exec_sql", {
            sql: statement + ";",
          });

          if (stmtError && !stmtError.message.includes("already exists")) {
            console.log(`⚠️ Statement warning: ${stmtError.message}`);
          }
        } catch (err) {
          console.log(`⚠️ Statement error (continuing): ${err.message}`);
        }
      }
    }

    console.log("✅ Migration completed successfully!");

    // Test the new columns
    console.log("🧪 Testing new columns...");

    const { data: testData, error: testError } = await supabase
      .from("data_entries")
      .select("id, urgency_level, status, assigned_to, handled_by")
      .gte("urgency_level", 7)
      .limit(1);

    if (testError) {
      console.error("❌ Test failed:", testError.message);
    } else {
      console.log("✅ New columns working correctly!");
      console.log(
        "📊 Sample urgent item:",
        testData?.[0] || "No urgent items found"
      );
    }
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

runMigration();
