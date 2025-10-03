# Sapa Trenggalek - Sistem Aspirasi & Pengaduan Analitik

Sistem Intelijen dan Agregasi Informasi Publik untuk Pemerintah Kabupaten Trenggalek

## 🎯 Tujuan Aplikasi

"Sapa Trenggalek" adalah platform digital berbasis web yang dirancang untuk membantu Pemerintah Kabupaten Trenggalek dalam:

- **Melawan Misinformasi**: Mengidentifikasi dan memverifikasi berita yang berpotensi hoaks
- **Menjaring Aspirasi & Laporan**: Menangkap suara, keluhan, dan harapan masyarakat secara real-time
- **Mendukung Pengambilan Keputusan**: Menyediakan data analitik untuk kebijakan berbasis data

## 🚀 Fitur Utama

### 1. Agregator Data Otomatis

- Scraping otomatis dari media sosial dan portal berita
- Monitoring berdasarkan kata kunci yang relevan
- Penyimpanan data terpusat

### 2. Klasifikasi Konten Berbasis AI

- Kategorisasi otomatis: Berita, Laporan, Aspirasi, Lainnya
- Analisis sentimen: Positif, Negatif, Netral
- Penilaian tingkat urgensi (1-10)

### 3. Analisis & Deteksi Hoaks

- Skor probabilitas hoaks (0-100%)
- Analisis kredibilitas sumber
- Deteksi bahasa provokatif

### 4. Deteksi Isu Serupa & Analisis Tren

- Pengelompokan postingan dengan isu sama
- Analisis viral dan trending topics
- Pemetaan sebaran laporan

### 5. Dashboard Admin Interaktif

- Visualisasi data real-time
- Manajemen status laporan
- Analitik dan pelaporan

## 🛠️ Teknologi

- **Framework**: Next.js 14 (Full-stack)
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini Pro
- **Deployment**: Vercel
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Cron Jobs**: GitHub Actions

## 📦 Instalasi

### Prasyarat

- Node.js 18+
- npm atau yarn
- Akun Supabase
- API Key Google Gemini

### Langkah Instalasi

1. **Clone repository**

```bash
git clone <repository-url>
cd sapa-trenggalek
```

2. **Install dependencies**

```bash
npm install
```

3. **Setup environment variables**

```bash
cp .env.local.example .env.local
```

Edit `.env.local` dengan konfigurasi Anda:

**⚠️ Penting: Perbedaan Environment Variables**

- `NEXT_PUBLIC_*`: Dapat diakses di client-side (browser)
- Tanpa `NEXT_PUBLIC_`: Hanya dapat diakses di server-side (API routes)

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key
CRON_SECRET=your_secure_random_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

4. **Setup database**

- Buka Supabase Dashboard
- Jalankan script SQL dari `sql/schema.sql`

5. **Jalankan aplikasi**

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## 🗄️ Struktur Database

### Tabel Utama

- **data_entries**: Menyimpan semua data yang di-scrape
- **monitoring_keywords**: Kata kunci untuk monitoring
- **system_settings**: Pengaturan sistem
- **admin_users**: Data admin (untuk autentikasi)

### Kolom Penting data_entries

- `content`: Konten yang di-scrape
- `category`: berita | laporan | aspirasi | lainnya
- `sentiment`: positif | negatif | netral
- `urgency_level`: 1-10
- `hoax_probability`: 0-100%
- `status`: baru | diverifikasi | diteruskan | dikerjakan | selesai
- `ai_analysis`: Hasil analisis AI (JSON)

## 🔄 Alur Kerja Sistem

1. **GitHub Actions** memicu cron job setiap 6 jam
2. **API Scraping** mengumpulkan data dari berbagai sumber
3. **AI Gemini** menganalisis dan mengkategorikan konten
4. **Database** menyimpan hasil analisis
5. **Dashboard** menampilkan data real-time
6. **Admin** melakukan verifikasi dan tindak lanjut

## 🚀 Deployment

### Vercel Deployment

1. **Push ke GitHub**

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy ke Vercel**

- Import project dari GitHub di Vercel
- Set environment variables
- Deploy

3. **Setup GitHub Actions**

- Tambahkan secrets di GitHub repository:
  - `SCRAPING_ENDPOINT`: URL endpoint scraping Anda
  - `CRON_SECRET`: Secret untuk autentikasi cron job

### Environment Variables untuk Production

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
CRON_SECRET=your_secure_random_string
NEXTAUTH_SECRET=your_production_secret
NEXTAUTH_URL=https://your-domain.vercel.app
```

## 📊 Penggunaan

### Dashboard Admin

1. **Dashboard**: Ringkasan dan analitik
2. **Data Monitoring**: Kelola semua data masuk
3. **Analitik**: Laporan dan visualisasi
4. **Item Mendesak**: Prioritas tinggi
5. **Tren & Isu**: Analisis viral
6. **Pengaturan**: Konfigurasi sistem

### Manajemen Status

- **Baru**: Data baru masuk
- **Diverifikasi**: Sudah diverifikasi admin
- **Diteruskan**: Diteruskan ke dinas terkait
- **Dikerjakan**: Sedang dalam penanganan
- **Selesai**: Sudah selesai ditangani

## 🔧 Kustomisasi

### Menambah Sumber Data

Edit `lib/scraper.ts` untuk menambah sumber scraping baru:

```typescript
const NEW_SOURCES = [
  "https://example-news.com/rss",
  // tambah sumber lain
];
```

### Mengubah Kata Kunci Monitoring

Melalui dashboard pengaturan atau langsung di database:

```sql
INSERT INTO monitoring_keywords (keyword) VALUES ('kata-kunci-baru');
```

### Menyesuaikan Analisis AI

Edit prompt di `lib/gemini.ts` untuk menyesuaikan analisis AI.

## 🛡️ Keamanan

- Environment variables untuk kredensial sensitif
- CRON_SECRET untuk autentikasi GitHub Actions
- Row Level Security (RLS) di Supabase
- Validasi input dan sanitasi data

## 📈 Monitoring & Maintenance

### Log Monitoring

- Cek log Vercel untuk error deployment
- Monitor Supabase untuk performa database
- GitHub Actions untuk status cron job

### Backup Database

```sql
-- Export data penting
SELECT * FROM data_entries WHERE created_at >= NOW() - INTERVAL '30 days';
```

## 🤝 Kontribusi

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 Lisensi

Aplikasi ini dikembangkan untuk Pemerintah Kabupaten Trenggalek.

## 📞 Support

Untuk pertanyaan dan dukungan teknis, hubungi tim pengembang.

---

**Pemerintah Kabupaten Trenggalek**  
Sistem Aspirasi & Pengaduan Analitik © 2024
