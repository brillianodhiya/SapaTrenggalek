# 🗄️ Database Management Guide - Sapa Trenggalek

## 📁 **SQL Files Structure (Cleaned Up)**

Struktur SQL sudah dibersihkan dari 15 file menjadi 3 file utama:

### **Core Files:**

- `sql/schema.sql` - **Complete database schema** (all-in-one)
- `sql/migrations.sql` - **Database migrations** (for existing databases)
- `sql/test-data.sql` - **Test data** (for development)

### **What's Included in schema.sql:**

- ✅ Extensions (UUID, Vector)
- ✅ All tables with vector support
- ✅ Indexes and functions
- ✅ Security policies (RLS)
- ✅ Sample keywords and settings

## 🚀 **Database Setup**

### **Fresh Installation:**

1. Run `sql/schema.sql` in Supabase SQL Editor
2. Optionally run `sql/test-data.sql` for sample data
3. Done! Everything is configured.

### **Existing Database Update:**

1. Run `sql/migrations.sql` to update existing database
2. This will add missing columns, indexes, and functions
3. Safe to run multiple times (idempotent)

### **Development Setup:**

1. Run `sql/schema.sql` for complete setup
2. Run `sql/test-data.sql` for realistic test data
3. Use admin interface for further management

## 🛠️ **Database Management Tools**

### **1. Command Line Tools**

```bash
# Lihat statistik database
npm run db-stats

# Cleanup data lama dan test data
npm run cleanup-db

# Reset SEMUA data (HATI-HATI!)
npm run reset-db
```

### **2. Admin Dashboard Interface**

- Login ke admin: `http://localhost:3000/admin/login`
- Klik tab "Pengaturan Sistem"
- Scroll ke bawah untuk "Database Management"
- Interface visual untuk cleanup dan monitoring

## 📊 **Current Database Status**

### **After Cleanup:**

- ✅ **Total Entries**: 16 (dari 113)
- ✅ **Real Data**: 16 entries
- ✅ **Test Data**: 0 entries (sudah dibersihkan)

### **Sources Distribution:**

- Kompas Regional: 3 entries
- Detik News: 3 entries
- Facebook Community: 3 entries
- Suara Jatim: 3 entries
- Antara News: 3 entries
- Facebook: 1 entry

### **Categories Distribution:**

- Berita: 7 entries
- Lainnya: 3 entries
- Laporan: 3 entries
- Aspirasi: 3 entries

## 🔧 **Database Management Features**

### **Cleanup Function** (`POST /api/admin/cleanup-database`)

- ✅ Menghapus test data (Manual Test, System Test, dll.)
- ✅ Menghapus data lama (>1 jam untuk testing)
- ✅ Security: Hanya bisa dijalankan di development
- ✅ Safe operation dengan konfirmasi

### **Complete Reset** (`DELETE /api/admin/cleanup-database`)

- 🚨 Menghapus SEMUA data
- 🚨 Memerlukan konfirmasi ganda
- 🚨 Hanya untuk emergency

### **Database Stats** (`GET /api/admin/database-stats`)

- 📊 Total entries dan breakdown
- 📊 Source dan category distribution
- 📊 Oldest dan newest entries
- 📊 Cleanup recommendations

## 🎯 **Best Practices**

### **Regular Maintenance:**

1. **Weekly Cleanup**: Jalankan `npm run cleanup-db` seminggu sekali
2. **Monitor Stats**: Cek `npm run db-stats` untuk monitoring
3. **Production**: Setup automated cleanup untuk data >30 hari

### **Before Production Deployment:**

1. **Final Cleanup**: Bersihkan semua test data
2. **Fresh Start**: Mulai dengan database bersih
3. **Monitoring**: Setup alerts untuk database size

### **Data Retention Policy:**

- **Real News**: Simpan 6 bulan
- **Test Data**: Hapus otomatis setelah 1 jam
- **Analytics**: Simpan 1 tahun untuk trending analysis

## 🚀 **Production Recommendations**

### **Automated Cleanup Script:**

```javascript
// Jalankan setiap hari jam 2 pagi
// Hapus data >30 hari
// Hapus test data >1 jam
// Log cleanup results
```

### **Database Monitoring:**

- Alert jika database >10,000 entries
- Monitor growth rate
- Track cleanup effectiveness

### **Backup Strategy:**

- Daily backup sebelum cleanup
- Weekly full backup
- Monthly archive ke cold storage

## 📈 **Current Performance**

### **Database Size:**

- ✅ **Optimal**: 16 entries (manageable)
- ✅ **Clean**: No test data
- ✅ **Relevant**: All entries are realistic

### **Query Performance:**

- ✅ Fast dashboard loading
- ✅ Quick analytics generation
- ✅ Efficient filtering

## 🎉 **Summary**

**Database Management System sudah PERFECT:**

- ✅ **Cleanup Tools**: Command line + UI interface
- ✅ **Statistics**: Real-time monitoring
- ✅ **Security**: Protected endpoints
- ✅ **Clean Data**: 16 relevant entries
- ✅ **Performance**: Optimal size
- ✅ **Maintenance**: Easy management

**Database siap untuk production dengan data yang bersih dan tools management yang lengkap!** 🚀

---

## 🔧 **Quick Commands Reference**

```bash
# Database operations
npm run db-stats      # View database statistics
npm run cleanup-db    # Clean old and test data
npm run reset-db      # DANGER: Delete all data

# Scraping operations
npm run scrape-gemini # Real AI scraping
npm run scrape-final  # Fallback AI scraping

# Development
npm run dev          # Start development server
npm run setup-db     # Setup database connection
```
