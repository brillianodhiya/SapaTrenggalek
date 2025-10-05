#!/usr/bin/env node

/**
 * Script to populate test data for Sapa Trenggalek
 * Run this to add sample data with recent dates for testing daily trends
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

const testData = [
  {
    content:
      "Pemerintah Kabupaten Trenggalek berhasil meraih penghargaan sebagai kabupaten terbaik dalam pengelolaan lingkungan hidup di Jawa Timur.",
    source: "Portal Berita",
    source_url: "https://example.com/berita1",
    author: "Admin Portal",
    category: "berita",
    sentiment: "positif",
    urgency_level: 3,
    hoax_probability: 5,
    status: "diverifikasi",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    content:
      "Wisata Pantai Prigi di Trenggalek semakin ramai dikunjungi wisatawan setelah dilakukan revitalisasi fasilitas.",
    source: "Media Lokal",
    source_url: "https://example.com/berita2",
    author: "Reporter Lokal",
    category: "berita",
    sentiment: "positif",
    urgency_level: 2,
    hoax_probability: 10,
    status: "diverifikasi",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    content:
      "Jalan raya menuju Kecamatan Watulimo mengalami kerusakan parah akibat hujan deras minggu lalu.",
    source: "Laporan Warga",
    source_url: "https://example.com/laporan1",
    author: "Warga Watulimo",
    category: "laporan",
    sentiment: "negatif",
    urgency_level: 8,
    hoax_probability: 15,
    status: "baru",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    content:
      "Festival budaya Trenggalek akan diselenggarakan bulan depan dengan menampilkan berbagai kesenian tradisional.",
    source: "Media Lokal",
    source_url: "https://example.com/berita5",
    author: "Reporter Budaya",
    category: "berita",
    sentiment: "positif",
    urgency_level: 3,
    hoax_probability: 5,
    status: "diverifikasi",
    created_at: new Date().toISOString(),
  },
  {
    content:
      "Warga mengeluhkan banyaknya sampah di sekitar pasar tradisional yang mengganggu kebersihan lingkungan.",
    source: "Laporan Warga",
    source_url: "https://example.com/laporan4",
    author: "Warga Pasar",
    category: "laporan",
    sentiment: "negatif",
    urgency_level: 6,
    hoax_probability: 15,
    status: "baru",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

async function populateTestData() {
  console.log("🚀 Starting test data population...");

  try {
    // Check if data already exists
    const { data: existingData, error: checkError } = await supabase
      .from("data_entries")
      .select("id")
      .limit(1);

    if (checkError) {
      console.error("❌ Error checking existing data:", checkError.message);
      return;
    }

    if (existingData && existingData.length > 0) {
      console.log("⚠️  Data already exists. Skipping population.");
      console.log(
        "💡 If you want to add more test data, delete existing entries first."
      );
      return;
    }

    // Insert test data
    const { data, error } = await supabase
      .from("data_entries")
      .insert(testData)
      .select();

    if (error) {
      console.error("❌ Error inserting test data:", error.message);
      return;
    }

    console.log(`✅ Successfully inserted ${data.length} test entries`);
    console.log(
      "📊 Test data includes entries from the last 5 days for daily trends testing"
    );

    // Show summary
    const summary = testData.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    console.log("\n📈 Data summary by category:");
    Object.entries(summary).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} entries`);
    });

    console.log("\n🎉 Test data population complete!");
    console.log("💡 You can now check the Analytics page to see daily trends");
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

// Run the script
populateTestData();
