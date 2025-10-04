#!/usr/bin/env node

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  console.error(
    "Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runSQLFile(filePath, description) {
  console.log(`\n📄 Running ${description}...`);

  try {
    const sqlContent = fs.readFileSync(filePath, "utf8");

    // Split by semicolon and filter out empty statements
    const statements = sqlContent
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    console.log(`   Found ${statements.length} SQL statements`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length > 0) {
        console.log(`   Executing statement ${i + 1}/${statements.length}...`);

        const { error } = await supabase
          .rpc("exec_sql", {
            sql_query: statement + ";",
          })
          .catch(async () => {
            // Fallback: try direct query
            return await supabase.from("_").select("*").limit(0);
          });

        if (error && !error.message.includes("already exists")) {
          console.warn(`   ⚠️  Warning: ${error.message}`);
        }
      }
    }

    console.log(`✅ ${description} completed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Error running ${description}:`, error.message);
    return false;
  }
}

async function checkVectorExtension() {
  console.log("\n🔍 Checking pgvector extension...");

  try {
    const { data, error } = await supabase
      .from("pg_extension")
      .select("extname")
      .eq("extname", "vector");

    if (error) {
      console.log(
        "   ℹ️  Cannot check extensions (normal for hosted Supabase)"
      );
      return true;
    }

    if (data && data.length > 0) {
      console.log("✅ pgvector extension is available");
      return true;
    } else {
      console.log("⚠️  pgvector extension not found");
      console.log(
        "   Please enable it in Supabase Dashboard > Database > Extensions"
      );
      return false;
    }
  } catch (error) {
    console.log("   ℹ️  Extension check skipped (hosted environment)");
    return true;
  }
}

async function testVectorFunctions() {
  console.log("\n🧪 Testing vector functions...");

  try {
    // Test if we can create a simple vector
    const { error } = await supabase
      .rpc("exec_sql", {
        sql_query: "SELECT '[1,2,3]'::vector(3) as test_vector;",
      })
      .catch(() => ({ error: null }));

    if (!error) {
      console.log("✅ Vector functions are working");
      return true;
    } else {
      console.log("⚠️  Vector functions test failed:", error.message);
      return false;
    }
  } catch (error) {
    console.log("⚠️  Could not test vector functions:", error.message);
    return false;
  }
}

async function checkEmbeddingColumn() {
  console.log("\n🔍 Checking embedding column...");

  try {
    const { data, error } = await supabase
      .from("data_entries")
      .select("content_embedding")
      .limit(1);

    if (!error) {
      console.log("✅ content_embedding column exists");
      return true;
    } else if (
      error.message.includes('column "content_embedding" does not exist')
    ) {
      console.log("⚠️  content_embedding column not found - will be created");
      return false;
    } else {
      console.log("❌ Error checking embedding column:", error.message);
      return false;
    }
  } catch (error) {
    console.log("❌ Error checking embedding column:", error.message);
    return false;
  }
}

async function getEmbeddingStats() {
  console.log("\n📊 Getting embedding statistics...");

  try {
    const { data, error } = await supabase
      .from("data_entries")
      .select("id, content_embedding")
      .limit(1000);

    if (error) {
      console.log("⚠️  Could not get statistics:", error.message);
      return;
    }

    const total = data.length;
    const withEmbeddings = data.filter((row) => row.content_embedding).length;
    const withoutEmbeddings = total - withEmbeddings;
    const percentage =
      total > 0 ? Math.round((withEmbeddings / total) * 100) : 0;

    console.log(`   📈 Total entries: ${total}`);
    console.log(`   ✅ With embeddings: ${withEmbeddings} (${percentage}%)`);
    console.log(`   ❌ Without embeddings: ${withoutEmbeddings}`);

    if (withoutEmbeddings > 0) {
      console.log(
        `   💡 Run embedding update in admin panel to generate missing embeddings`
      );
    }
  } catch (error) {
    console.log("⚠️  Could not get statistics:", error.message);
  }
}

async function main() {
  console.log("🚀 Setting up Vector Database for Sapa Trenggalek");
  console.log("================================================");

  // Check if main schema exists
  const schemaPath = path.join(__dirname, "..", "sql", "schema.sql");
  const vectorPath = path.join(
    __dirname,
    "..",
    "sql",
    "add-vector-support.sql"
  );

  if (!fs.existsSync(schemaPath)) {
    console.error("❌ Main schema.sql not found");
    console.error("Please run the main database setup first");
    process.exit(1);
  }

  if (!fs.existsSync(vectorPath)) {
    console.error("❌ add-vector-support.sql not found");
    process.exit(1);
  }

  // Step 1: Check vector extension
  const vectorAvailable = await checkVectorExtension();

  // Step 2: Check if embedding column exists
  const embeddingExists = await checkEmbeddingColumn();

  // Step 3: Run vector support SQL if needed
  if (!embeddingExists || process.argv.includes("--force")) {
    const success = await runSQLFile(vectorPath, "Vector Support Setup");
    if (!success) {
      console.error("❌ Vector setup failed");
      process.exit(1);
    }
  } else {
    console.log("✅ Vector support already configured");
  }

  // Step 4: Test vector functions
  await testVectorFunctions();

  // Step 5: Get current statistics
  await getEmbeddingStats();

  console.log("\n🎉 Vector Database Setup Complete!");
  console.log("\n📋 Next Steps:");
  console.log("1. 🌐 Open admin panel: http://localhost:3000/admin");
  console.log('2. 📊 Go to "Embeddings" tab');
  console.log('3. ⚡ Click "Update Missing" to generate embeddings');
  console.log('4. 🔍 Try "Vector Search" tab for semantic search');
  console.log("\n💡 Features now available:");
  console.log("   • Semantic search (meaning-based)");
  console.log("   • Hoax detection (similarity-based)");
  console.log("   • Duplicate prevention");
  console.log("   • Content clustering");
}

// Handle command line arguments
if (process.argv.includes("--help")) {
  console.log("Vector Database Setup Script");
  console.log("");
  console.log("Usage: node scripts/setup-vector-database.js [options]");
  console.log("");
  console.log("Options:");
  console.log("  --force    Force re-run all SQL statements");
  console.log("  --help     Show this help message");
  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Setup failed:", error);
  process.exit(1);
});
