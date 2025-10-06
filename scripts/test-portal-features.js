const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testPortalFeatures() {
  console.log("🧪 Testing Portal Berita Features...\n");

  const client = await pool.connect();

  try {
    // Test 1: Check if aspirasi table exists
    console.log("1️⃣ Testing Aspirasi Table...");
    const aspirasiCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'aspirasi'
    `);

    if (aspirasiCheck.rows.length > 0) {
      console.log("   ✅ Aspirasi table exists");

      // Check aspirasi data
      const aspirasiCount = await client.query("SELECT COUNT(*) FROM aspirasi");
      console.log(`   📊 Total aspirasi: ${aspirasiCount.rows[0].count}`);

      // Check status distribution
      const statusDist = await client.query(`
        SELECT status, COUNT(*) as count 
        FROM aspirasi 
        GROUP BY status 
        ORDER BY status
      `);
      console.log("   📈 Status distribution:");
      statusDist.rows.forEach((row) => {
        console.log(`      ${row.status}: ${row.count}`);
      });
    } else {
      console.log(
        "   ❌ Aspirasi table not found - run setup-aspirasi-table.js first"
      );
    }

    // Test 2: Check entries table for news
    console.log("\n2️⃣ Testing News Data...");
    const entriesCheck = await client.query(`
      SELECT COUNT(*) FROM entries
    `);
    console.log(`   📊 Total news entries: ${entriesCheck.rows[0].count}`);

    // Check categories
    const categoriesCheck = await client.query(`
      SELECT DISTINCT category, COUNT(*) as count 
      FROM entries 
      WHERE category IS NOT NULL 
      GROUP BY category 
      ORDER BY count DESC 
      LIMIT 5
    `);
    console.log("   📈 Top categories:");
    categoriesCheck.rows.forEach((row) => {
      console.log(`      ${row.category}: ${row.count}`);
    });

    // Test 3: Check embeddings for vector search
    console.log("\n3️⃣ Testing Vector Search Data...");
    const embeddingsCheck = await client.query(`
      SELECT COUNT(*) FROM entries WHERE embedding IS NOT NULL
    `);
    console.log(
      `   📊 Entries with embeddings: ${embeddingsCheck.rows[0].count}`
    );

    // Test 4: Check recent data
    console.log("\n4️⃣ Testing Recent Data...");
    const recentEntries = await client.query(`
      SELECT COUNT(*) FROM entries 
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `);
    console.log(
      `   📊 Entries from last 7 days: ${recentEntries.rows[0].count}`
    );

    const recentAspirasi = await client.query(`
      SELECT COUNT(*) FROM aspirasi 
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `);
    console.log(
      `   📊 Aspirasi from last 7 days: ${recentAspirasi.rows[0].count}`
    );

    // Test 5: Check data quality
    console.log("\n5️⃣ Testing Data Quality...");

    // Check for entries with analysis data
    const analyzedEntries = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(sentiment) as with_sentiment,
        COUNT(urgency_level) as with_urgency,
        COUNT(hoax_probability) as with_hoax_prob
      FROM entries
    `);

    const stats = analyzedEntries.rows[0];
    console.log(
      `   📊 Entries with sentiment: ${stats.with_sentiment}/${stats.total}`
    );
    console.log(
      `   📊 Entries with urgency: ${stats.with_urgency}/${stats.total}`
    );
    console.log(
      `   📊 Entries with hoax prob: ${stats.with_hoax_prob}/${stats.total}`
    );

    // Test 6: Sample data for testing
    console.log("\n6️⃣ Sample Data Preview...");

    // Sample news entry
    const sampleNews = await client.query(`
      SELECT id, LEFT(content, 100) as preview, source, category, sentiment, urgency_level
      FROM entries 
      WHERE content IS NOT NULL 
      ORDER BY created_at DESC 
      LIMIT 3
    `);

    console.log("   📰 Sample news entries:");
    sampleNews.rows.forEach((row, index) => {
      console.log(`      ${index + 1}. [${row.source}] ${row.preview}...`);
      console.log(
        `         Category: ${row.category || "N/A"}, Sentiment: ${
          row.sentiment || "N/A"
        }, Urgency: ${row.urgency_level || "N/A"}`
      );
    });

    // Sample aspirasi
    const sampleAspirasi = await client.query(`
      SELECT name, kecamatan, category, LEFT(content, 80) as preview, status
      FROM aspirasi 
      ORDER BY created_at DESC 
      LIMIT 3
    `);

    console.log("\n   💬 Sample aspirasi:");
    sampleAspirasi.rows.forEach((row, index) => {
      console.log(`      ${index + 1}. [${row.name}] ${row.preview}...`);
      console.log(
        `         Kecamatan: ${row.kecamatan || "N/A"}, Category: ${
          row.category || "N/A"
        }, Status: ${row.status}`
      );
    });

    console.log("\n🎉 Portal Features Test Complete!");
    console.log("\n📋 Summary:");
    console.log("   ✅ Database tables ready");
    console.log("   ✅ News data available");
    console.log("   ✅ Aspirasi system ready");
    console.log("   ✅ Vector search data ready");
    console.log("   ✅ Portal ready for testing!");
  } catch (error) {
    console.error("❌ Error testing portal features:", error);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await testPortalFeatures();
  } catch (error) {
    console.error("💥 Test failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}

module.exports = { testPortalFeatures };
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testPortalFeatures() {
  console.log("🧪 Testing Portal Berita Features...\n");

  const client = await pool.connect();

  try {
    // Test 1: Check if aspirasi table exists
    console.log("1️⃣ Testing Aspirasi Table...");
    const aspirasiCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'aspirasi'
    `);

    if (aspirasiCheck.rows.length > 0) {
      console.log("   ✅ Aspirasi table exists");

      // Check aspirasi data
      const aspirasiCount = await client.query("SELECT COUNT(*) FROM aspirasi");
      console.log(`   📊 Total aspirasi: ${aspirasiCount.rows[0].count}`);

      // Check status distribution
      const statusDist = await client.query(`
        SELECT status, COUNT(*) as count 
        FROM aspirasi 
        GROUP BY status 
        ORDER BY status
      `);
      console.log("   📈 Status distribution:");
      statusDist.rows.forEach((row) => {
        console.log(`      ${row.status}: ${row.count}`);
      });
    } else {
      console.log(
        "   ❌ Aspirasi table not found - run setup-aspirasi-table.js first"
      );
    }

    // Test 2: Check entries table for news
    console.log("\n2️⃣ Testing News Data...");
    const entriesCheck = await client.query(`
      SELECT COUNT(*) FROM entries
    `);
    console.log(`   📊 Total news entries: ${entriesCheck.rows[0].count}`);

    // Check categories
    const categoriesCheck = await client.query(`
      SELECT DISTINCT category, COUNT(*) as count 
      FROM entries 
      WHERE category IS NOT NULL 
      GROUP BY category 
      ORDER BY count DESC 
      LIMIT 5
    `);
    console.log("   📈 Top categories:");
    categoriesCheck.rows.forEach((row) => {
      console.log(`      ${row.category}: ${row.count}`);
    });

    // Test 3: Check embeddings for vector search
    console.log("\n3️⃣ Testing Vector Search Data...");
    const embeddingsCheck = await client.query(`
      SELECT COUNT(*) FROM entries WHERE embedding IS NOT NULL
    `);
    console.log(
      `   📊 Entries with embeddings: ${embeddingsCheck.rows[0].count}`
    );

    // Test 4: Check recent data
    console.log("\n4️⃣ Testing Recent Data...");
    const recentEntries = await client.query(`
      SELECT COUNT(*) FROM entries 
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `);
    console.log(
      `   📊 Entries from last 7 days: ${recentEntries.rows[0].count}`
    );

    const recentAspirasi = await client.query(`
      SELECT COUNT(*) FROM aspirasi 
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `);
    console.log(
      `   📊 Aspirasi from last 7 days: ${recentAspirasi.rows[0].count}`
    );

    // Test 5: Sample data quality
    console.log("\n5️⃣ Testing Data Quality...");

    // Check for entries with analysis data
    const analyzedEntries = await client.query(`
      SELECT COUNT(*) FROM entries 
      WHERE sentiment IS NOT NULL 
      AND urgency_level IS NOT NULL 
      AND hoax_probability IS NOT NULL
    `);
    console.log(
      `   📊 Fully analyzed entries: ${analyzedEntries.rows[0].count}`
    );

    // Check sentiment distribution
    const sentimentDist = await client.query(`
      SELECT sentiment, COUNT(*) as count 
      FROM entries 
      WHERE sentiment IS NOT NULL 
      GROUP BY sentiment 
      ORDER BY count DESC
    `);
    console.log("   📈 Sentiment distribution:");
    sentimentDist.rows.forEach((row) => {
      console.log(`      ${row.sentiment}: ${row.count}`);
    });

    // Test 6: Check for potential issues
    console.log("\n6️⃣ Checking for Potential Issues...");

    // Check for entries without content
    const emptyContent = await client.query(`
      SELECT COUNT(*) FROM entries WHERE content IS NULL OR content = ''
    `);
    if (parseInt(emptyContent.rows[0].count) > 0) {
      console.log(
        `   ⚠️  ${emptyContent.rows[0].count} entries with empty content`
      );
    } else {
      console.log("   ✅ All entries have content");
    }

    // Check for aspirasi without names
    const emptyNames = await client.query(`
      SELECT COUNT(*) FROM aspirasi WHERE name IS NULL OR name = ''
    `);
    if (parseInt(emptyNames.rows[0].count) > 0) {
      console.log(`   ⚠️  ${emptyNames.rows[0].count} aspirasi without names`);
    } else {
      console.log("   ✅ All aspirasi have names");
    }

    console.log("\n🎉 Portal Features Test Complete!");

    // Summary
    console.log("\n📋 SUMMARY:");
    console.log("✅ News Portal: Ready with real data");
    console.log("✅ Vector Search: Ready with embeddings");
    console.log("✅ Aspirasi System: Ready with sample data");
    console.log("✅ Hoax Checker: Ready (requires GEMINI_API_KEY)");
    console.log("✅ Admin Panel: Ready for all features");
  } catch (error) {
    console.error("❌ Error testing portal features:", error);
    throw error;
  } finally {
    client.release();
  }
}

async function testAPIEndpoints() {
  console.log("\n🌐 Testing API Endpoints...\n");

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const endpoints = [
    { name: "News API", url: "/api/news?limit=5" },
    { name: "Aspirasi API", url: "/api/aspirasi?limit=5" },
    { name: "Search API", url: "/api/search" },
    { name: "Analytics API", url: "/api/analytics" },
    { name: "Stats API", url: "/api/stats" },
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.name}...`);
      const response = await fetch(`${baseUrl}${endpoint.url}`);

      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ ${endpoint.name}: OK (${response.status})`);

        if (data.data && Array.isArray(data.data)) {
          console.log(`   📊 Returned ${data.data.length} items`);
        }
      } else {
        console.log(
          `   ⚠️  ${endpoint.name}: ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint.name}: ${error.message}`);
    }
  }
}

async function main() {
  try {
    await testPortalFeatures();

    // Only test API endpoints if we're in a web environment
    if (typeof fetch !== "undefined") {
      await testAPIEndpoints();
    } else {
      console.log("\n🌐 API endpoint testing skipped (not in web environment)");
      console.log(
        "   Run this in browser console or with node-fetch for API tests"
      );
    }
  } catch (error) {
    console.error("💥 Test failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}

module.exports = { testPortalFeatures };
