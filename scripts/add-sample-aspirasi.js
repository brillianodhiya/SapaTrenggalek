const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addSampleAspirasi() {
  try {
    console.log("📝 Adding sample aspirasi data...");

    const sampleData = [
      {
        name: "Budi Santoso",
        kecamatan: "Trenggalek",
        category: "Infrastruktur",
        content:
          "Mohon diperbaiki jalan di Desa Sumbergedang yang sudah rusak parah. Jalan berlubang dan berbahaya untuk kendaraan. Sudah beberapa kali terjadi kecelakaan karena kondisi jalan yang buruk.",
        email: "budi.santoso@email.com",
        phone: "081234567890",
        status: "pending",
      },
      {
        name: "Siti Aminah",
        kecamatan: "Panggul",
        category: "Kesehatan",
        content:
          "Puskesmas di desa kami kekurangan obat-obatan. Mohon perhatian untuk penambahan stok obat, terutama obat untuk penyakit umum seperti demam dan batuk.",
        email: "siti.aminah@email.com",
        phone: "081234567891",
        status: "in_progress",
      },
      {
        name: "Ahmad Wijaya",
        kecamatan: "Dongko",
        category: "Pendidikan",
        content:
          "Sekolah dasar di desa kami membutuhkan renovasi atap yang bocor. Anak-anak kesulitan belajar saat hujan karena air masuk ke dalam kelas.",
        email: "ahmad.wijaya@email.com",
        phone: "081234567892",
        status: "resolved",
        admin_response:
          "Terima kasih atas laporannya. Tim teknis sudah melakukan survei dan perbaikan atap akan dilakukan minggu depan. Dana sudah dialokasikan dari APBD.",
      },
      {
        name: "Dewi Lestari",
        kecamatan: "Pogalan",
        category: "Lingkungan",
        content:
          "Banyak sampah berserakan di sepanjang sungai desa. Perlu ada program pembersihan dan edukasi masyarakat tentang pentingnya menjaga kebersihan lingkungan.",
        email: "dewi.lestari@email.com",
        phone: "081234567893",
        status: "pending",
      },
      {
        name: "Rudi Hartono",
        kecamatan: "Kampak",
        category: "Ekonomi",
        content:
          "Mohon bantuan modal usaha untuk UMKM di desa kami. Banyak warga yang ingin berwirausaha tapi terkendala modal. Apakah ada program bantuan dari pemerintah?",
        email: "rudi.hartono@email.com",
        phone: "081234567894",
        status: "in_progress",
      },
      {
        name: "Rina Sari",
        kecamatan: "Watulimo",
        category: "Transportasi",
        content:
          "Angkutan umum di daerah kami sangat terbatas. Mohon penambahan trayek atau frekuensi angkutan untuk memudahkan mobilitas masyarakat.",
        email: "rina.sari@email.com",
        phone: "081234567895",
        status: "resolved",
        admin_response:
          "Aspirasi Anda telah kami tindaklanjuti. Mulai bulan depan akan ada penambahan 2 unit angkutan dengan trayek baru.",
      },
      {
        name: "Joko Susilo",
        kecamatan: "Bendungan",
        category: "Keamanan",
        content:
          "Penerangan jalan di desa kami masih kurang. Banyak lampu jalan yang mati sehingga rawan terjadi kejahatan di malam hari.",
        email: "joko.susilo@email.com",
        phone: "081234567896",
        status: "pending",
      },
      {
        name: "Maya Indah",
        kecamatan: "Suruh",
        category: "Sosial",
        content:
          "Mohon diadakan program pelatihan keterampilan untuk ibu-ibu rumah tangga agar bisa menambah penghasilan keluarga.",
        email: "maya.indah@email.com",
        phone: "081234567897",
        status: "in_progress",
      },
    ];

    // Insert data with different timestamps
    for (let i = 0; i < sampleData.length; i++) {
      const item = sampleData[i];
      const daysAgo = Math.floor(Math.random() * 30) + 1; // 1-30 days ago

      const { data, error } = await supabase
        .from("aspirasi")
        .insert({
          ...item,
          created_at: new Date(
            Date.now() - daysAgo * 24 * 60 * 60 * 1000
          ).toISOString(),
        })
        .select();

      if (error) {
        console.error(`Error inserting ${item.name}:`, error);
      } else {
        console.log(`✅ Added: ${item.name} (${item.status})`);
      }
    }

    // Show final stats
    const { count: totalCount } = await supabase
      .from("aspirasi")
      .select("*", { count: "exact", head: true });

    console.log(`📊 Total aspirasi in database: ${totalCount}`);

    // Show breakdown by status
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
  } catch (error) {
    console.error("❌ Error adding sample aspirasi:", error);
  }
}

addSampleAspirasi();
