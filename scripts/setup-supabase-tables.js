const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupAspirasiTable() {
  try {
    console.log("🚀 Setting up aspirasi table in Supabase...");

    // Create aspirasi table using SQL
    const { error: createError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS aspirasi (
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

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_aspirasi_status ON aspirasi(status);
        CREATE INDEX IF NOT EXISTS idx_aspirasi_kecamatan ON aspirasi(kecamatan);
        CREATE INDEX IF NOT EXISTS idx_aspirasi_category ON aspirasi(category);
        CREATE INDEX IF NOT EXISTS idx_aspirasi_created_at ON aspirasi(created_at);
      `,
    });

    if (createError) {
      console.error("Error creating table:", createError);

      // Try alternative approach - direct table creation
      console.log("Trying alternative approach...");

      // Check if table exists first
      const { data: tables } = await supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_name", "aspirasi");

      if (!tables || tables.length === 0) {
        console.log(
          "Table does not exist, you may need to create it manually in Supabase dashboard"
        );
        console.log("SQL to run:");
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
        `);
      }
    } else {
      console.log("✅ Aspirasi table created successfully");
    }

    // Insert sample data
    console.log("📝 Inserting sample aspirasi data...");

    const sampleData = [
      {
        name: "Budi Santoso",
        kecamatan: "Trenggalek",
        category: "Infrastruktur",
        content:
          "Mohon diperbaiki jalan di Desa Sumbergedang yang sudah rusak parah. Jalan berlubang dan berbahaya untuk kendaraan.",
        email: "budi.santoso@email.com",
        phone: "081234567890",
        status: "pending",
      },
      {
        name: "Siti Aminah",
        kecamatan: "Panggul",
        category: "Kesehatan",
        content:
          "Puskesmas di desa kami kekurangan obat-obatan. Mohon perhatian untuk penambahan stok obat.",
        email: "siti.aminah@email.com",
        phone: "081234567891",
        status: "in_progress",
      },
      {
        name: "Ahmad Wijaya",
        kecamatan: "Dongko",
        category: "Pendidikan",
        content:
          "Sekolah dasar di desa kami membutuhkan renovasi atap yang bocor. Anak-anak kesulitan belajar saat hujan.",
        email: "ahmad.wijaya@email.com",
        phone: "081234567892",
        status: "resolved",
        admin_response:
          "Terima kasih atas laporannya. Tim teknis sudah melakukan survei dan perbaikan atap akan dilakukan minggu depan.",
      },
      {
        name: "Dewi Lestari",
        kecamatan: "Pogalan",
        category: "Lingkungan",
        content:
          "Banyak sampah berserakan di sepanjang sungai desa. Perlu ada program pembersihan dan edukasi masyarakat.",
        email: "dewi.lestari@email.com",
        phone: "081234567893",
        status: "pending",
      },
      {
        name: "Rudi Hartono",
        kecamatan: "Kampak",
        category: "Ekonomi",
        content:
          "Mohon bantuan modal usaha untuk UMKM di desa kami. Banyak warga yang ingin berwirausaha tapi terkendala modal.",
        email: "rudi.hartono@email.com",
        phone: "081234567894",
        status: "in_progress",
      },
    ];

    const { data: insertData, error: insertError } = await supabase
      .from("aspirasi")
      .insert(sampleData)
      .select();

    if (insertError) {
      console.error("Error inserting sample data:", insertError);
      console.log("You may need to create the table manually first");
    } else {
      console.log(`✅ Inserted ${insertData.length} sample aspirasi records`);
    }

    // Show summary
    const { count: totalCount } = await supabase
      .from("aspirasi")
      .select("*", { count: "exact", head: true });

    console.log(`📊 Total aspirasi in database: ${totalCount}`);

    if (totalCount > 0) {
      const { data: statusData } = await supabase
        .from("aspirasi")
        .select("status");

      const statusCounts = {};
      statusData?.forEach((row) => {
        const status = row.status || "null";
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      console.log("📈 Status breakdown:");
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   ${status}: ${count}`);
      });
    }
  } catch (error) {
    console.error("❌ Error setting up aspirasi table:", error);
  }
}

setupAspirasiTable();
