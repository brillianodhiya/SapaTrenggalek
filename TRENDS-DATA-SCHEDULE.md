# 📊 Jadwal Pengisian Data Tren & Isu Viral

## 🕐 Kapan Data Trends Akan Terisi?

Data Tren & Isu Viral akan terisi secara **otomatis** melalui beberapa proses:

### 1. **Scraping Data (Setiap 6 Jam)**

- **Jadwal**: Setiap 6 jam (00:00, 06:00, 12:00, 18:00 WIB)
- **Proses**: Mengumpulkan data dari Twitter, Facebook, Instagram
- **File**: `.github/workflows/scraping-cron.yml`
- **Endpoint**: `/api/cron/scrape`

### 2. **Analisis Trends (Setiap 2 Jam)**

- **Jadwal**: Setiap 2 jam (00:00, 02:00, 04:00, 06:00, dst.)
- **Proses**: Menganalisis data yang sudah dikumpulkan untuk mencari trends
- **File**: `.github/workflows/trends-analysis-cron.yml`
- **Endpoint**: `/api/cron/analyze-trends`

### 3. **Trigger Otomatis**

- **Kapan**: Setiap kali ada data baru dari scraping
- **Proses**: Scraping job otomatis memanggil trends analysis
- **Hasil**: Data trends langsung terupdate setelah scraping selesai

## 📈 Jenis Data yang Dianalisis

### **Keyword Trends**

- Ekstraksi kata kunci dari konten yang di-scrape
- Pengelompokan berdasarkan waktu (per jam)
- Analisis sentiment (positif, negatif, netral)
- Tracking sumber (Twitter, Facebook, Instagram)

### **Emerging Issues**

- Deteksi isu yang sedang trending
- Berdasarkan urgency level ≥ 7
- Perhitungan velocity (mentions per hour)
- Penentuan departemen yang relevan

## 🔄 Alur Kerja Otomatis

```
1. Scraping Job (6 jam sekali)
   ↓
2. Data masuk ke database (data_entries)
   ↓
3. AI Analysis (kategori, sentiment, urgency)
   ↓
4. Trends Analysis dipanggil otomatis
   ↓
5. Keyword extraction & emerging issues detection
   ↓
6. Data disimpan ke keyword_trends & emerging_issues
   ↓
7. API trends menampilkan data terbaru
```

## 📊 Status Saat Ini

### ✅ **Sudah Aktif:**

- Database tables sudah dibuat
- Sample data sudah ada (16 keyword trends, 6 emerging issues)
- API endpoints sudah menggunakan Supabase
- Trends analysis job sudah berfungsi

### 🔄 **Akan Berjalan Otomatis:**

- GitHub Actions untuk scraping (setiap 6 jam)
- GitHub Actions untuk trends analysis (setiap 2 jam)
- Auto-trigger setelah scraping selesai

## 🧪 Testing Manual

Untuk test manual trends analysis:

```bash
node scripts/test-trends-analysis.js
```

Untuk menambah sample data:

```bash
node scripts/add-more-trends-data.js
```

## 📱 Monitoring

### **Logs yang Bisa Dipantau:**

- GitHub Actions logs untuk melihat status cron jobs
- Vercel function logs untuk debugging
- Database logs di Supabase

### **Indikator Data Aktif:**

- Metadata API menunjukkan `"data_source": "supabase"`
- Timestamp `generated_at` terupdate otomatis
- Jumlah trends dan emerging issues bertambah

## ⚡ Frekuensi Update

| Komponen            | Frekuensi | Keterangan                 |
| ------------------- | --------- | -------------------------- |
| **Scraping**        | 6 jam     | Mengumpulkan data baru     |
| **Trends Analysis** | 2 jam     | Analisis data untuk trends |
| **Auto Trigger**    | Real-time | Setelah scraping selesai   |
| **Data Cleanup**    | Harian    | Hapus data lama (>7 hari)  |

## 🎯 Hasil yang Diharapkan

Setelah sistem berjalan penuh:

- **Real-time trends** berdasarkan data scraping terbaru
- **Emerging issues** terdeteksi dalam 2-6 jam
- **Historical data** untuk analisis pola trends
- **Department-specific insights** untuk tindak lanjut

---

**💡 Catatan**: Data sample saat ini sudah cukup untuk testing. Data real akan mulai terisi setelah scraping jobs berjalan dan mengumpulkan konten baru dari media sosial.
