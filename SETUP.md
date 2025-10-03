# 🚀 Setup Guide - Sapa Trenggalek

Panduan lengkap untuk menjalankan project Sapa Trenggalek di lokal.

## 📋 Prerequisites

- Node.js 18+
- npm atau yarn
- Akun Supabase (gratis)
- API Key Google Gemini (gratis)

## 🔧 Langkah Setup

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd sapa-trenggalek
npm install
```

### 2. Setup Supabase Database

1. **Buat Project Supabase**:

   - Buka [https://supabase.com](https://supabase.com)
   - Klik "New Project"
   - Beri nama: "sapa-trenggalek"
   - Tunggu hingga selesai

2. **Jalankan SQL Schema**:

   - Buka **SQL Editor** di dashboard Supabase
   - Copy semua isi dari `sql/schema.sql`
   - Paste dan klik **Run**

3. **Dapatkan API Keys**:
   - Buka **Settings** → **API**
   - Copy:
     - Project URL
     - anon public key
     - service_role secret key

### 3. Setup Google Gemini API

1. Buka [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Klik "Create API Key"
3. Copy API key yang dihasilkan

### 4. Generate Secrets

```bash
npm run generate-secrets
```

Copy output ke file `.env.local`

### 5. Konfigurasi Environment Variables

Edit file `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Generated Secrets
CRON_SECRET=generated_cron_secret
NEXTAUTH_SECRET=generated_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 6. Test Database Connection

```bash
npm run setup-db
```

Jika berhasil, Anda akan melihat:

```
✅ Database connection successful!
✅ Table 'data_entries' exists
✅ Sample data inserted successfully!
```

### 7. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

### 8. Test Scraping & AI Analysis

Buka terminal baru dan jalankan:

```bash
# Test scraping manual
curl -X POST http://localhost:3000/api/test-scraping

# Atau buka di browser:
# http://localhost:3000/api/test-scraping (POST request)
```

## 🎯 Testing Checklist

### ✅ Portal Publik

- [ ] Halaman utama terbuka: `http://localhost:3000`
- [ ] Statistik ditampilkan
- [ ] Form aspirasi berfungsi
- [ ] Design responsive

### ✅ Admin Login

- [ ] Halaman login: `http://localhost:3000/admin/login`
- [ ] Login dengan: `admin@trenggalek.go.id` / `admin123`
- [ ] Redirect ke dashboard admin
- [ ] Logout berfungsi

### ✅ Dashboard Admin

- [ ] Dashboard analytics ditampilkan
- [ ] Data table kosong (normal untuk awal)
- [ ] Sidebar navigation berfungsi
- [ ] Semua tab dapat diakses

### ✅ Database & API

- [ ] Database connection berhasil
- [ ] Test scraping berhasil
- [ ] AI analysis berfungsi
- [ ] Data tersimpan di database

## 🔧 Troubleshooting

### Database Connection Error

```
❌ Database connection failed
```

**Solusi**:

1. Pastikan Supabase project sudah dibuat
2. Jalankan SQL schema dari `sql/schema.sql`
3. Periksa environment variables

### AI Analysis Error

```
❌ AI analysis failed
```

**Solusi**:

1. Pastikan `GEMINI_API_KEY` sudah diset
2. Periksa quota API Gemini
3. Cek koneksi internet

### Authentication Error

```
❌ NextAuth configuration error
```

**Solusi**:

1. Pastikan `NEXTAUTH_SECRET` sudah diset
2. Pastikan `NEXTAUTH_URL` benar
3. Restart development server

## 📊 Monitoring

### Logs Development

```bash
# Terminal 1: Development server
npm run dev

# Terminal 2: Test scraping
npm run test-scraping
```

### Database Monitoring

- Buka Supabase Dashboard
- Pilih project Anda
- Buka **Table Editor** → **data_entries**
- Lihat data yang masuk

## 🚀 Production Deployment

Setelah testing lokal berhasil:

1. **Deploy ke Vercel**:

   ```bash
   vercel --prod
   ```

2. **Set Environment Variables** di Vercel dashboard

3. **Setup GitHub Actions** untuk cron job scraping

4. **Test production** dengan URL live

## 📞 Support

Jika mengalami masalah:

1. Periksa logs di terminal
2. Cek environment variables
3. Pastikan semua services (Supabase, Gemini) aktif
4. Restart development server

---

**Happy Coding! 🎉**
