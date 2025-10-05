-- Sapa Trenggalek Test Data
-- Run this to populate database with realistic test data for development

-- ============================================================================
-- SAMPLE DATA FOR TESTING
-- ============================================================================

-- Insert sample data entries for testing
INSERT INTO data_entries (content, source, source_url, author, category, sentiment, urgency_level, hoax_probability, status) VALUES

-- Berita positif tentang Trenggalek
('Pemerintah Kabupaten Trenggalek berhasil meraih penghargaan sebagai kabupaten terbaik dalam pengelolaan lingkungan hidup di Jawa Timur. Prestasi ini diraih berkat komitmen kuat dalam menjaga kelestarian alam dan program green city yang berkelanjutan.', 'Portal Berita', 'https://example.com/berita1', 'Admin Portal', 'berita', 'positif', 3, 5, 'diverifikasi'),

('Wisata Pantai Prigi di Trenggalek semakin ramai dikunjungi wisatawan setelah dilakukan revitalisasi fasilitas. Kini tersedia area parkir yang luas, toilet bersih, dan warung makan yang nyaman untuk pengunjung.', 'Media Lokal', 'https://example.com/berita2', 'Reporter Lokal', 'berita', 'positif', 2, 10, 'diverifikasi'),

-- Laporan infrastruktur
('Jalan raya menuju Kecamatan Watulimo mengalami kerusakan parah akibat hujan deras minggu lalu. Beberapa titik jalan berlubang dan membahayakan pengendara. Perlu segera diperbaiki sebelum musim hujan tiba.', 'Laporan Warga', 'https://example.com/laporan1', 'Warga Watulimo', 'laporan', 'negatif', 8, 15, 'baru'),

('Lampu penerangan jalan di Desa Bendungan mati total sejak 3 hari yang lalu. Warga kesulitan beraktivitas di malam hari dan khawatir dengan keamanan. Mohon segera diperbaiki oleh dinas terkait.', 'Pengaduan Online', 'https://example.com/laporan2', 'Kepala Desa Bendungan', 'laporan', 'negatif', 7, 20, 'diteruskan'),

-- Aspirasi pembangunan
('Warga Kecamatan Pogalan mengusulkan pembangunan pasar tradisional baru untuk mendukung ekonomi lokal. Lokasi yang diusulkan strategis dan mudah diakses oleh masyarakat sekitar.', 'Forum Warga', 'https://example.com/aspirasi1', 'Forum Warga Pogalan', 'aspirasi', 'positif', 5, 5, 'dikerjakan'),

('Masyarakat Trenggalek meminta pembangunan taman kota yang ramah keluarga dengan fasilitas bermain anak dan jogging track. Hal ini untuk mendukung gaya hidup sehat dan rekreasi keluarga.', 'Media Sosial', 'https://example.com/aspirasi2', 'Komunitas Sehat', 'aspirasi', 'positif', 4, 10, 'baru'),

-- Berita netral
('Bupati Trenggalek mengadakan rapat koordinasi dengan seluruh kepala dinas untuk membahas program kerja tahun depan. Rapat berlangsung di Pendopo Kabupaten dan dihadiri 25 kepala dinas.', 'Humas Pemkab', 'https://example.com/berita3', 'Humas Trenggalek', 'berita', 'netral', 2, 5, 'diverifikasi'),

-- Konten dengan potensi hoax (untuk testing)
('Beredar kabar bahwa akan ada gempa besar di Trenggalek minggu depan menurut ramalan paranormal terkenal. Warga diminta waspada dan bersiap mengungsi. Informasi ini belum dikonfirmasi BMKG.', 'Media Sosial', 'https://example.com/hoax1', 'Akun Anonim', 'lainnya', 'negatif', 9, 85, 'baru'),

-- Berita pembangunan
('Proyek pembangunan jembatan penghubung antar kecamatan di Trenggalek mencapai progress 75%. Diperkirakan akan selesai pada akhir tahun ini dan akan memperlancar akses transportasi warga.', 'Dinas PU', 'https://example.com/berita4', 'Dinas Pekerjaan Umum', 'berita', 'positif', 3, 5, 'diverifikasi'),

-- Laporan lingkungan
('Sungai Brantas di wilayah Trenggalek tercemar limbah industri. Warna air berubah kehitaman dan berbau tidak sedap. Ikan-ikan mati dan warga tidak berani menggunakan air sungai.', 'Aktivis Lingkungan', 'https://example.com/laporan3', 'Green Trenggalek', 'laporan', 'negatif', 9, 25, 'diteruskan');

-- ============================================================================
-- ADDITIONAL TEST KEYWORDS
-- ============================================================================

-- Add more specific keywords for testing
INSERT INTO monitoring_keywords (keyword) VALUES
('green city'),
('wisata trenggalek'),
('pantai prigi'),
('jalan rusak'),
('lampu jalan'),
('pasar tradisional'),
('taman kota'),
('gempa trenggalek'),
('jembatan trenggalek'),
('sungai brantas'),
('limbah industri'),
('watulimo'),
('pogalan'),
('bendungan');

-- ============================================================================
-- TEST QUERIES
-- ============================================================================

-- Query to verify test data
SELECT 'Test data inserted successfully!' as status;

-- Check data distribution by category
SELECT 'Data distribution by category:' as info;
SELECT 
    category,
    COUNT(*) as count,
    AVG(urgency_level) as avg_urgency,
    AVG(hoax_probability) as avg_hoax_prob
FROM data_entries 
GROUP BY category 
ORDER BY count DESC;

-- Check data distribution by sentiment
SELECT 'Data distribution by sentiment:' as info;
SELECT 
    sentiment,
    COUNT(*) as count
FROM data_entries 
GROUP BY sentiment 
ORDER BY count DESC;

-- Check high urgency items
SELECT 'High urgency items (>= 7):' as info;
SELECT 
    LEFT(content, 80) as content_preview,
    category,
    urgency_level,
    status
FROM data_entries 
WHERE urgency_level >= 7
ORDER BY urgency_level DESC;

-- Check potential hoax content
SELECT 'Potential hoax content (>= 70%):' as info;
SELECT 
    LEFT(content, 80) as content_preview,
    hoax_probability,
    status
FROM data_entries 
WHERE hoax_probability >= 70
ORDER BY hoax_probability DESC;

-- Test full-text search
SELECT 'Testing full-text search for "trenggalek":' as info;
SELECT 
    LEFT(content, 80) as content_preview,
    source,
    category
FROM data_entries 
WHERE to_tsvector('indonesian', content) @@ to_tsquery('indonesian', 'trenggalek')
LIMIT 5;

-- ============================================================================
-- EMBEDDING TEST PREPARATION
-- ============================================================================

-- Show entries that need embeddings (for testing embedding generation)
SELECT 'Entries ready for embedding generation:' as info;
SELECT 
    id,
    LEFT(content, 60) as content_preview,
    CASE 
        WHEN content_embedding IS NULL THEN 'NEEDS_EMBEDDING'
        ELSE 'HAS_EMBEDDING'
    END as embedding_status
FROM data_entries 
ORDER BY created_at 
LIMIT 10;

-- Show embedding statistics
SELECT 'Current embedding statistics:' as info;
SELECT * FROM get_embedding_statistics();
SELECT 'Sample entries with embeddings:' as info;
SELECT 
    id,
    LEFT(content, 80) as content_preview,
    source,
    category
FROM data_entries 
WHERE content_embedding IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;

-- 4. Test text-based search (what fallback should do)
SELECT 'Text-based search test for "green":' as test;
SELECT 
    id,
    LEFT(content, 100) as content_preview,
    source,
    category
FROM data_entries 
WHERE content ILIKE '%green%'
LIMIT 5;

-- 5. Test text-based search for "city"
SELECT 'Text-based search test for "city":' as test;
SELECT 
    id,
    LEFT(content, 100) as content_preview,
    source,
    category
FROM data_entries 
WHERE content ILIKE '%city%'
LIMIT 5;

-- 6. Test combined search
SELECT 'Combined search test:' as test;
SELECT 
    id,
    LEFT(content, 100) as content_preview,
    source,
    category
FROM data_entries 
WHERE content ILIKE '%green%' 
   OR content ILIKE '%city%'
LIMIT 10;