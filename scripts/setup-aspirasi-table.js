const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function setupAspirasiTable() {
  const client = await pool.connect();

  try {
    console.log("🚀 Setting up aspirasi table...");

    // Read and execute the SQL file
    const sqlPath = path.join(__dirname, "..", "sql", "aspirasi-table.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    await client.query(sql);
    console.log("✅ Aspirasi table created successfully");

    // Insert some sample data
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

    for (const data of sampleData) {
      await client.query(
        `INSERT INTO aspirasi (name, kecamatan, category, content, email, phone, status, admin_response, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW() - INTERVAL '${Math.floor(
           Math.random() * 30
         )} days')`,
        [
          data.name,
          data.kecamatan,
          data.category,
          data.content,
          data.email,
          data.phone,
          data.status,
          data.admin_response || null,
        ]
      );
    }

    console.log(`✅ Inserted ${sampleData.length} sample aspirasi records`);

    // Show summary
    const result = await client.query("SELECT COUNT(*) as total FROM aspirasi");
    console.log(`📊 Total aspirasi in database: ${result.rows[0].total}`);

    const statusResult = await client.query(`
      SELECT status, COUNT(*) as count 
      FROM aspirasi 
      GROUP BY status 
      ORDER BY status
    `);

    console.log("📈 Status breakdown:");
    statusResult.rows.forEach((row) => {
      console.log(`   ${row.status}: ${row.count}`);
    });
  } catch (error) {
    console.error("❌ Error setting up aspirasi table:", error);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await setupAspirasiTable();
    console.log("🎉 Aspirasi table setup completed successfully!");
  } catch (error) {
    console.error("💥 Setup failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}

module.exports = { setupAspirasiTable };
