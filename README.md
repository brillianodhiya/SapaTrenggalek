# Sapa Trenggalek - Sistem Aspirasi & Pengaduan Analitik

Platform digital untuk mendengar suara masyarakat Trenggalek

## 🎯 Tentang Project

"Sapa Trenggalek" adalah project volunteer dari **TitaniaLabs** yang dikembangkan dengan tujuan:

- 🏗️ **Membangun Trenggalek** melalui teknologi digital
- 💡 **Mengenalkan teknologi** kepada masyarakat
- 🤝 **Volunteer project** untuk kemajuan daerah

### 👥 Tim Developer

- **[@brillianodhiya](https://www.linkedin.com/in/brilliano-dhiya-ulhaq-44b196194/)** - TitaniaLabs
- **[@auliazulfa](https://www.linkedin.com/in/aulia-zulfaa-144b78259/)** - TitaniaLabs

## 🚀 Fitur Platform

### Core Features

- **📰 News Aggregation** - Otomatis mengumpulkan berita dari berbagai sumber
- **🤖 AI Classification** - Kategorisasi dan analisis sentimen otomatis
- **🔍 Hoax Detection** - Sistem deteksi misinformasi
- **💬 Public Aspirations** - Platform aspirasi dan keluhan masyarakat
- **📊 Analytics Dashboard** - Visualisasi data dan trends
- **🔎 Vector Search** - Pencarian semantik menggunakan embeddings

### Advanced Features

- **📱 Social Media Integration** - Twitter, Instagram, Facebook
- **🖼️ Smart Image Extraction** - Otomatis tanpa placeholder
- **📈 Trends Analysis** - Monitoring dan analisis tren
- **⚡ Urgent Items Management** - Penanganan item prioritas
- **🤖 Automated Cronjobs** - Proses otomatis setiap 2 jam
- Deteksi bahasa provokatif

### 4. Deteksi Isu Serupa & Analisis Tren

- Pengelompokan postingan dengan isu sama
- Analisis viral dan trending topics
- Pemetaan sebaran laporan

### 5. Dashboard Admin Interaktif

- Visualisasi data real-time
- Manajemen status laporan
- Analitik dan pelaporan

### 6. Instagram Integration

- **Official API**: Menggunakan Instagram Graph API resmi
- **Authenticated Media**: Akses media dari akun terautentikasi
- **Real-time Analytics**: Engagement metrics dan media statistics
- **Rate Limiting**: Mengikuti kebijakan resmi Instagram (200 req/hour)

> **Note**: Instagram integration memerlukan access token. Lihat [Instagram Integration Guide](INSTAGRAM-INTEGRATION.md) untuk setup lengkap.

### 7. Facebook Integration

- **Graph API**: Menggunakan Facebook Graph API resmi
- **Page Posts**: Akses posts dari Facebook pages
- **Complete Engagement**: Likes, comments, shares, reactions
- **Multiple Post Types**: Status, photo, video, link, event
- **Real-time Data**: Data langsung dari Facebook

> **Note**: Facebook integration memerlukan access token. Lihat [Facebook Integration Guide](FACEBOOK-INTEGRATION.md) untuk setup lengkap.

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

# Instagram Official API (Optional)
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token
INSTAGRAM_SECRET_KEY=your_instagram_app_secret

# Facebook Official API (Optional)
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token
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

Project volunteer ini dikembangkan oleh TitaniaLabs untuk membantu membangun Trenggalek.

## 📞 Support

Untuk pertanyaan dan dukungan teknis, hubungi tim pengembang melalui LinkedIn:

- [@brillianodhiya](https://www.linkedin.com/in/brilliano-dhiya-ulhaq-44b196194/)
- [@auliazulfa](https://www.linkedin.com/in/aulia-zulfaa-144b78259/)

---

**TitaniaLabs**  
Volunteer project untuk membangun Trenggalek © 2025
