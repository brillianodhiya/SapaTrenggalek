const { createClient } = require("@supabase/supabase-js");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function populateDashboardData() {
  try {
    console.log("🚀 Populating dashboard with more diverse data...");

    // Sample data with different categories, statuses, and dates
    const sampleEntries = [
      // Recent entries (last 7 days)
      {
        content:
          "Laporan kerusakan jalan di Kecamatan Dongko memerlukan perhatian segera",
        source: "WhatsApp",
        category: "laporan",
        sentiment: "negatif",
        urgency_level: 8,
        status: "baru",
        created_at: new Date(
          Date.now() - 1 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        content:
          "Aspirasi warga untuk pembangunan taman kota di pusat Trenggalek",
        source: "Facebook",
        category: "aspirasi",
        sentiment: "positif",
        urgency_level: 5,
        status: "diverifikasi",
        created_at: new Date(
          Date.now() - 1 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        content: "Pengaduan tentang pelayanan di kantor kecamatan yang lambat",
        source: "Instagram",
        category: "pengaduan",
        sentiment: "negatif",
        urgency_level: 6,
        status: "diteruskan",
        created_at: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        content:
          "Berita positif tentang festival budaya Trenggalek yang sukses",
        source: "Website Resmi",
        category: "berita",
        sentiment: "positif",
        urgency_level: 3,
        status: "selesai",
        created_at: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        content: "Laporan banjir di beberapa desa memerlukan penanganan cepat",
        source: "Twitter",
        category: "laporan",
        sentiment: "negatif",
        urgency_level: 9,
        status: "dikerjakan",
        created_at: new Date(
          Date.now() - 3 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        content: "Aspirasi pembangunan fasilitas olahraga untuk pemuda",
        source: "WhatsApp",
        category: "aspirasi",
        sentiment: "positif",
        urgency_level: 4,
        status: "diverifikasi",
        created_at: new Date(
          Date.now() - 3 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        content: "Pengaduan tentang kebersihan pasar tradisional",
        source: "Facebook",
        category: "pengaduan",
        sentiment: "negatif",
        urgency_level: 6,
        status: "diteruskan",
        created_at: new Date(
          Date.now() - 4 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        content: "Berita pembukaan jalan baru yang memudahkan akses warga",
        source: "Website Resmi",
        category: "berita",
        sentiment: "positif",
        urgency_level: 2,
        status: "selesai",
        created_at: new Date(
          Date.now() - 4 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        content: "Laporan gangguan listrik di beberapa kecamatan",
        source: "Instagram",
        category: "laporan",
        sentiment: "negatif",
        urgency_level: 7,
        status: "dikerjakan",
        created_at: new Date(
          Date.now() - 5 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        content: "Aspirasi untuk peningkatan kualitas pendidikan di daerah",
        source: "Twitter",
        category: "aspirasi",
        sentiment: "netral",
        urgency_level: 5,
        status: "diverifikasi",
        created_at: new Date(
          Date.now() - 5 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        content: "Pengaduan tentang pelayanan kesehatan di puskesmas",
        source: "WhatsApp",
        category: "pengaduan",
        sentiment: "negatif",
        urgency_level: 8,
        status: "baru",
        created_at: new Date(
          Date.now() - 6 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        content: "Berita kegiatan gotong royong membersihkan sungai",
        source: "Facebook",
        category: "berita",
        sentiment: "positif",
        urgency_level: 3,
        status: "selesai",
        created_at: new Date(
          Date.now() - 6 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        content: "Laporan kerusakan fasilitas umum di taman kota",
        source: "Instagram",
        category: "laporan",
        sentiment: "negatif",
        urgency_level: 6,
        status: "diteruskan",
        created_at: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        content: "Aspirasi untuk program bantuan UMKM lokal",
        source: "Website Resmi",
        category: "aspirasi",
        sentiment: "positif",
        urgency_level: 4,
        status: "diverifikasi",
        created_at: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      // Add some potential hoax items
      {
        content:
          "Informasi yang belum terverifikasi tentang kebijakan baru pemerintah daerah",
        source: "WhatsApp",
        category: "lainnya",
        sentiment: "netral",
        urgency_level: 5,
        status: "baru",
        hoax_probability: 75,
        created_at: new Date(
          Date.now() - 1 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        content:
          "Kabar tidak jelas tentang bantuan sosial yang beredar di media sosial",
        source: "Facebook",
        category: "lainnya",
        sentiment: "netral",
        urgency_level: 4,
        status: "baru",
        hoax_probability: 80,
        created_at: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
    ];

    console.log(`📊 Adding ${sampleEntries.length} sample entries...`);

    // Insert sample entries in batches
    const batchSize = 10;
    for (let i = 0; i < sampleEntries.length; i += batchSize) {
      const batch = sampleEntries.slice(i, i + batchSize);

      const { error } = await supabase.from("data_entries").insert(batch);

      if (error) {
        console.error(
          `❌ Error inserting batch ${i / batchSize + 1}:`,
          error.message
        );
      } else {
        console.log(
          `✅ Inserted batch ${i / batchSize + 1}/${Math.ceil(
            sampleEntries.length / batchSize
          )}`
        );
      }
    }

    // Verify the data
    const { count: totalCount } = await supabase
      .from("data_entries")
      .select("*", { count: "exact", head: true });

    const { data: categoryData } = await supabase
      .from("data_entries")
      .select("category");

    const categoryStats = categoryData?.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    const { data: statusData } = await supabase
      .from("data_entries")
      .select("status");

    const statusStats = statusData?.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    const { count: urgentCount } = await supabase
      .from("data_entries")
      .select("*", { count: "exact", head: true })
      .gte("urgency_level", 7);

    const { count: hoaxCount } = await supabase
      .from("data_entries")
      .select("*", { count: "exact", head: true })
      .gte("hoax_probability", 70);

    console.log("\n🎉 Dashboard data population completed!");
    console.log(`📊 Summary:`);
    console.log(`   - Total entries: ${totalCount}`);
    console.log(`   - Categories:`, categoryStats);
    console.log(`   - Status distribution:`, statusStats);
    console.log(`   - Urgent items (≥7): ${urgentCount}`);
    console.log(`   - Potential hoax (≥70%): ${hoaxCount}`);
    console.log("");
    console.log("🔄 Refresh your dashboard to see the updated data!");
  } catch (error) {
    console.error("❌ Error populating dashboard data:", error.message);
  }
}

populateDashboardData();
