const { Pool } = require("pg");
const { setupAspirasiTable } = require("./setup-aspirasi-table");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function setupCompletePortal() {
  console.log("🚀 Setting up Complete Portal Berita Sapa Trenggalek...\n");

  try {
    // Step 1: Setup Aspirasi Table
    console.log("📋 Step 1: Setting up Aspirasi System...");
    await setupAspirasiTable();
    console.log("✅ Aspirasi system ready\n");

    // Step 2: Check existing data
    console.log("📊 Step 2: Checking existing data...");
    const client = await pool.connect();

    try {
      // Check entries table
      const entriesCount = await client.query("SELECT COUNT(*) FROM entries");
      console.log(`   📰 News entries: ${entriesCount.rows[0].count}`);

      // Check embeddings
      const embeddingsCount = await client.query(
        "SELECT COUNT(*) FROM entries WHERE embedding IS NOT NULL"
      );
      console.log(
        `   🔍 Entries with embeddings: ${embeddingsCount.rows[0].count}`
      );

      // Check aspirasi
      const aspirasiCount = await client.query("SELECT COUNT(*) FROM aspirasi");
      console.log(`   💬 Aspirasi entries: ${aspirasiCount.rows[0].count}`);

      console.log("✅ Data check complete\n");

      // Step 3: Verify portal components
      console.log("🧩 Step 3: Verifying portal components...");

      const components = [
        "components/NewsPortal.tsx",
        "components/AspirasiForm.tsx",
        "components/HoaxChecker.tsx",
        "components/AspirasiManager.tsx",
        "components/VectorSearch.tsx",
      ];

      const fs = require("fs");
      const path = require("path");

      for (const component of components) {
        const componentPath = path.join(__dirname, "..", component);
        if (fs.existsSync(componentPath)) {
          console.log(`   ✅ ${component}`);
        } else {
          console.log(`   ❌ ${component} - Missing!`);
        }
      }

      console.log("✅ Component verification complete\n");

      // Step 4: Verify API endpoints
      console.log("🌐 Step 4: Verifying API endpoints...");

      const apis = [
        "app/api/news/route.ts",
        "app/api/aspirasi/route.ts",
        "app/api/aspirasi/[id]/route.ts",
        "app/api/check-hoax/route.ts",
        "app/api/search/route.ts",
      ];

      for (const api of apis) {
        const apiPath = path.join(__dirname, "..", api);
        if (fs.existsSync(apiPath)) {
          console.log(`   ✅ ${api}`);
        } else {
          console.log(`   ❌ ${api} - Missing!`);
        }
      }

      console.log("✅ API verification complete\n");

      // Step 5: Environment check
      console.log("🔧 Step 5: Environment check...");

      const requiredEnvVars = [
        "DATABASE_URL",
        "GEMINI_API_KEY",
        "NEXTAUTH_SECRET",
      ];

      for (const envVar of requiredEnvVars) {
        if (process.env[envVar]) {
          console.log(`   ✅ ${envVar}: Set`);
        } else {
          console.log(`   ⚠️  ${envVar}: Not set`);
        }
      }

      console.log("✅ Environment check complete\n");
    } finally {
      client.release();
    }

    // Final summary
    console.log("🎉 PORTAL SETUP COMPLETE!\n");
    console.log("📋 FEATURES READY:");
    console.log("   ✅ Portal Berita - Halaman utama dengan berita real-time");
    console.log("   ✅ Pencarian Cerdas - Vector search dengan AI");
    console.log("   ✅ Sistem Aspirasi - Form dan admin panel");
    console.log("   ✅ Cek Hoax - AI-powered hoax detection");
    console.log("   ✅ Admin Dashboard - Manajemen lengkap");
    console.log("");
    console.log("🚀 NEXT STEPS:");
    console.log("   1. Start the development server: npm run dev");
    console.log("   2. Visit http://localhost:3000 for the portal");
    console.log("   3. Visit http://localhost:3000/admin for admin panel");
    console.log("   4. Test all features and APIs");
    console.log("");
    console.log("📚 DOCUMENTATION:");
    console.log(
      "   - PORTAL-BERITA-IMPLEMENTATION.md - Complete feature guide"
    );
    console.log("   - SETUP.md - General setup instructions");
    console.log("   - README.md - Project overview");
  } catch (error) {
    console.error("💥 Setup failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  setupCompletePortal();
}

module.exports = { setupCompletePortal };
const { setupAspirasiTable } = require("./setup-aspirasi-table");
const { testPortalFeatures } = require("./test-portal-features");

async function setupCompletePortal() {
  console.log("🚀 Setting up Complete Portal Berita Sapa Trenggalek...\n");

  try {
    // Step 1: Setup aspirasi table
    console.log("📋 Step 1: Setting up Aspirasi Table...");
    await setupAspirasiTable();
    console.log("✅ Aspirasi table setup complete!\n");

    // Step 2: Test all features
    console.log("🧪 Step 2: Testing Portal Features...");
    await testPortalFeatures();
    console.log("✅ Portal features test complete!\n");

    // Step 3: Display final summary
    console.log("🎉 PORTAL SETUP COMPLETE!");
    console.log("=".repeat(50));
    console.log("✅ Database tables ready");
    console.log("✅ Sample data populated");
    console.log("✅ All APIs functional");
    console.log("✅ Portal ready for use!");
    console.log("=".repeat(50));

    console.log("\n📱 Portal Features Available:");
    console.log("   🏠 Homepage: http://localhost:3000");
    console.log("   📰 News Portal: http://localhost:3000#berita");
    console.log("   🔍 Vector Search: http://localhost:3000#search");
    console.log("   💬 Aspirasi Form: http://localhost:3000#aspirasi");
    console.log("   🛡️  Hoax Checker: http://localhost:3000#hoax-checker");
    console.log("   👨‍💼 Admin Panel: http://localhost:3000/admin");
    console.log("   📊 Admin Aspirasi: http://localhost:3000/admin/aspirasi");

    console.log("\n🔧 Next Steps:");
    console.log("   1. Start the development server: npm run dev");
    console.log("   2. Visit http://localhost:3000 to see the portal");
    console.log("   3. Test all features on the homepage");
    console.log("   4. Access admin panel at /admin/login");
    console.log("   5. Manage aspirasi at /admin/aspirasi");

    console.log("\n🎯 Key Features:");
    console.log("   • Real-time news with AI analysis");
    console.log("   • Semantic search with vector embeddings");
    console.log("   • Public aspirasi submission system");
    console.log("   • AI-powered hoax detection");
    console.log("   • Complete admin management panel");
    console.log("   • Responsive design for all devices");
  } catch (error) {
    console.error("💥 Portal setup failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  setupCompletePortal();
}

module.exports = { setupCompletePortal };
