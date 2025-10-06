const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testAspirasiAPI() {
  try {
    console.log("🧪 Testing aspirasi API...");

    // Test direct insert
    const testData = {
      name: "Test User API",
      kecamatan: "Trenggalek",
      category: "Test",
      content: "Test aspirasi dari script",
      email: "test@example.com",
      phone: "081234567890",
      status: "pending",
    };

    console.log("📝 Inserting test data...");
    const { data, error } = await supabase
      .from("aspirasi")
      .insert(testData)
      .select("id, created_at")
      .single();

    if (error) {
      console.error("❌ Direct insert error:", error);
    } else {
      console.log("✅ Direct insert successful:", data);

      // Test fetch
      console.log("📖 Testing fetch...");
      const { data: fetchData, error: fetchError } = await supabase
        .from("aspirasi")
        .select("*")
        .eq("id", data.id)
        .single();

      if (fetchError) {
        console.error("❌ Fetch error:", fetchError);
      } else {
        console.log("✅ Fetch successful:", fetchData);
      }

      // Clean up
      await supabase.from("aspirasi").delete().eq("id", data.id);

      console.log("🧹 Test data cleaned up");
    }

    // Test API endpoint
    console.log("🌐 Testing API endpoint...");
    const response = await fetch("http://localhost:3000/api/aspirasi", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "API Test User",
        kecamatan: "Trenggalek",
        category: "Test",
        content: "Test aspirasi dari API endpoint",
        email: "apitest@example.com",
      }),
    });

    const result = await response.json();
    console.log("API Response:", result);
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

testAspirasiAPI();
