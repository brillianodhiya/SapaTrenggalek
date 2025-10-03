const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

async function setupDatabase() {
  console.log("🗄️  Setting up Sapa Trenggalek Database...\n");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Missing Supabase credentials in .env.local");
    console.log("Please set:");
    console.log("- NEXT_PUBLIC_SUPABASE_URL");
    console.log("- SUPABASE_SERVICE_ROLE_KEY");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Test connection
    console.log("🔗 Testing database connection...");
    const { data, error } = await supabase
      .from("data_entries")
      .select("count")
      .limit(1);

    if (error) {
      console.error("❌ Database connection failed:", error.message);
      console.log("\n💡 Make sure you have:");
      console.log("1. Created a Supabase project");
      console.log("2. Run the SQL schema from sql/schema.sql");
      console.log("3. Set correct environment variables");
      return;
    }

    console.log("✅ Database connection successful!");

    // Check if tables exist
    console.log("\n📋 Checking database tables...");

    const tables = [
      "data_entries",
      "monitoring_keywords",
      "system_settings",
      "admin_users",
    ];

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select("count")
        .limit(1);
      if (error) {
        console.log(`❌ Table '${table}' not found`);
      } else {
        console.log(`✅ Table '${table}' exists`);
      }
    }

    // Insert sample data
    console.log("\n📝 Inserting sample data...");

    const sampleData = {
      content: "Test berita: Pembangunan jalan di Trenggalek berjalan lancar",
      source: "Manual Test",
      source_url: "https://example.com/test",
      author: "System Test",
      category: "berita",
      sentiment: "positif",
      urgency_level: 5,
      hoax_probability: 10,
      status: "baru",
      processed_by_ai: false,
      ai_analysis: { test: true },
      related_entries: [],
    };

    const { data: insertData, error: insertError } = await supabase
      .from("data_entries")
      .insert(sampleData)
      .select();

    if (insertError) {
      console.log("⚠️  Could not insert sample data:", insertError.message);
    } else {
      console.log("✅ Sample data inserted successfully!");
    }

    console.log("\n🎉 Database setup completed!");
    console.log("\nNext steps:");
    console.log("1. Run: npm run dev");
    console.log("2. Open: http://localhost:3000");
    console.log(
      "3. Test scraping: POST http://localhost:3000/api/test-scraping"
    );
  } catch (error) {
    console.error("❌ Setup failed:", error.message);
  }
}

setupDatabase();
