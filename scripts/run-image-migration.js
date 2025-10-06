const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runImageMigration() {
  try {
    console.log("🚀 Running image column migration...");

    // Read the SQL migration file
    const sqlPath = path.join(__dirname, "..", "sql", "add-image-column.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    // Execute the migration
    const { error } = await supabase.rpc("exec_sql", { sql });

    if (error) {
      console.error("❌ Migration failed:", error);

      // Try alternative approach - direct SQL execution
      console.log("🔄 Trying alternative approach...");

      const { error: altError } = await supabase
        .from("data_entries")
        .select("id")
        .limit(1);

      if (altError) {
        console.error("❌ Database connection failed:", altError);
        return;
      }

      console.log("✅ Database connection OK");
      console.log("📝 Please run this SQL manually in Supabase dashboard:");
      console.log("\n" + sql + "\n");
    } else {
      console.log("✅ Migration completed successfully!");

      // Verify the columns were added
      const { data, error: verifyError } = await supabase
        .from("data_entries")
        .select("image_url, image_alt, image_caption")
        .limit(1);

      if (verifyError) {
        console.log("⚠️  Migration may have failed. Please check manually.");
      } else {
        console.log("✅ Image columns verified successfully!");
      }
    }
  } catch (error) {
    console.error("❌ Error running migration:", error);

    // Provide manual instructions
    console.log("\n📝 Manual migration instructions:");
    console.log("1. Go to Supabase Dashboard > SQL Editor");
    console.log("2. Run the following SQL:");
    console.log("\nALTER TABLE data_entries");
    console.log("ADD COLUMN image_url TEXT,");
    console.log("ADD COLUMN image_alt TEXT,");
    console.log("ADD COLUMN image_caption TEXT;");
    console.log(
      "\nCREATE INDEX IF NOT EXISTS idx_data_entries_image_url ON data_entries(image_url) WHERE image_url IS NOT NULL;"
    );
  }
}

runImageMigration();
