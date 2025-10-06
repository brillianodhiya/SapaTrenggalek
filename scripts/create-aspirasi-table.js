const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createAspirasiTable() {
  try {
    console.log("🚀 Creating aspirasi table...");

    // Insert sample data to test if table exists
    const sampleData = {
      name: "Test User",
      kecamatan: "Trenggalek",
      category: "Test",
      content: "This is a test aspirasi",
      email: "test@example.com",
      phone: "081234567890",
      status: "pending",
    };

    const { data, error } = await supabase
      .from("aspirasi")
      .insert(sampleData)
      .select();

    if (error) {
      console.error("❌ Error inserting test data:", error);
      console.log(
        "📝 Table may not exist. Please create it manually in Supabase dashboard with this SQL:"
      );
      console.log(`
CREATE TABLE aspirasi (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  kecamatan VARCHAR(100),
  category VARCHAR(100),
  content TEXT NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  status VARCHAR(50) DEFAULT 'pending',
  admin_response TEXT,
  admin_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security (optional)
ALTER TABLE aspirasi ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust as needed)
CREATE POLICY "Allow all operations on aspirasi" ON aspirasi
FOR ALL USING (true);
      `);
    } else {
      console.log("✅ Test data inserted successfully");
      console.log("Table exists and is working");

      // Delete test data
      await supabase.from("aspirasi").delete().eq("name", "Test User");

      console.log("🧹 Test data cleaned up");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

createAspirasiTable();
