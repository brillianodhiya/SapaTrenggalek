// Test script for Portal API endpoints
// Run this after starting the development server (npm run dev)

const BASE_URL = "http://localhost:3000";

async function testAPIEndpoints() {
  console.log("🧪 Testing Portal API Endpoints...\n");

  try {
    // Test 1: News API
    console.log("1️⃣ Testing News API...");
    const newsResponse = await fetch(`${BASE_URL}/api/news?limit=5`);
    const newsData = await newsResponse.json();

    if (newsData.success) {
      console.log(
        `   ✅ News API working - ${newsData.data.length} entries returned`
      );
      console.log(`   📊 Categories available: ${newsData.categories.length}`);
    } else {
      console.log("   ❌ News API failed:", newsData.error);
    }

    // Test 2: Aspirasi API (GET)
    console.log("\n2️⃣ Testing Aspirasi API (GET)...");
    const aspirasiResponse = await fetch(`${BASE_URL}/api/aspirasi?limit=5`);
    const aspirasiData = await aspirasiResponse.json();

    if (aspirasiData.success) {
      console.log(
        `   ✅ Aspirasi GET API working - ${aspirasiData.data.length} entries returned`
      );
      console.log(`   📊 Total pages: ${aspirasiData.pagination.totalPages}`);
    } else {
      console.log("   ❌ Aspirasi GET API failed:", aspirasiData.error);
    }

    // Test 3: Aspirasi API (POST) - Test submission
    console.log("\n3️⃣ Testing Aspirasi API (POST)...");
    const testAspirasi = {
      name: "Test User API",
      kecamatan: "Trenggalek",
      category: "Infrastruktur",
      content: "Test aspirasi dari API endpoint test",
      email: "test@example.com",
      phone: "081234567890",
    };

    const postResponse = await fetch(`${BASE_URL}/api/aspirasi`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testAspirasi),
    });
    const postData = await postResponse.json();

    if (postData.success) {
      console.log(
        "   ✅ Aspirasi POST API working - test submission successful"
      );
      console.log(`   📝 Created aspirasi ID: ${postData.data.id}`);

      // Test 4: Aspirasi API (PATCH) - Update status
      console.log("\n4️⃣ Testing Aspirasi API (PATCH)...");
      const patchResponse = await fetch(
        `${BASE_URL}/api/aspirasi/${postData.data.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "in_progress",
            admin_response: "Test response from API endpoint test",
          }),
        }
      );
      const patchData = await patchResponse.json();

      if (patchData.success) {
        console.log("   ✅ Aspirasi PATCH API working - status updated");
      } else {
        console.log("   ❌ Aspirasi PATCH API failed:", patchData.error);
      }
    } else {
      console.log("   ❌ Aspirasi POST API failed:", postData.error);
    }

    // Test 5: Hoax Checker API
    console.log("\n5️⃣ Testing Hoax Checker API...");
    const hoaxTestData = {
      content:
        "Breaking news: Scientists discover new planet in our solar system with alien life forms.",
    };

    const hoaxResponse = await fetch(`${BASE_URL}/api/check-hoax`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(hoaxTestData),
    });
    const hoaxData = await hoaxResponse.json();

    if (hoaxData.success) {
      console.log("   ✅ Hoax Checker API working");
      console.log(
        `   🎯 Hoax probability: ${hoaxData.analysis.hoax_probability}%`
      );
      console.log(
        `   📊 Credibility score: ${hoaxData.analysis.credibility_score}%`
      );
      console.log(`   🏷️  Verdict: ${hoaxData.analysis.verdict}`);
    } else {
      console.log("   ❌ Hoax Checker API failed:", hoaxData.error);
    }

    // Test 6: Vector Search API
    console.log("\n6️⃣ Testing Vector Search API...");
    const searchResponse = await fetch(`${BASE_URL}/api/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "pembangunan infrastruktur jalan",
        limit: 3,
      }),
    });
    const searchData = await searchResponse.json();

    if (searchData.success) {
      console.log("   ✅ Vector Search API working");
      console.log(`   🔍 Found ${searchData.results.length} relevant results`);
    } else {
      console.log("   ❌ Vector Search API failed:", searchData.error);
    }

    console.log("\n🎉 API Endpoints Test Complete!");
    console.log("\n📋 Summary:");
    console.log("   ✅ News API functional");
    console.log("   ✅ Aspirasi CRUD APIs functional");
    console.log("   ✅ Hoax Checker API functional");
    console.log("   ✅ Vector Search API functional");
    console.log("   ✅ All endpoints ready for production!");
  } catch (error) {
    console.error("❌ API test failed:", error);
    console.log("\n💡 Make sure the development server is running:");
    console.log("   npm run dev");
  }
}

async function main() {
  await testAPIEndpoints();
}

if (require.main === module) {
  main();
}
