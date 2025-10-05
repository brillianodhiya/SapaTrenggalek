# 🕒 Cronjob Setup Guide - Sapa Trenggalek

## 🎯 **API Endpoints untuk Cronjob**

### **1. Scraping Cronjob (Main):**

```
POST /api/cron/scrape
```

**URL Lengkap:**

```
https://your-app.vercel.app/api/cron/scrape
```

### **2. Maintenance Cronjob (New):**

```
POST /api/cron/maintenance
```

**URL Lengkap:**

```
https://your-app.vercel.app/api/cron/maintenance
```

## 🔐 **Security & Authentication**

### **Required Headers:**

```bash
Authorization: Bearer YOUR_CRON_SECRET
Content-Type: application/json
```

### **Environment Variables:**

```env
CRON_SECRET=b8fc9de2837daabb6a8f2ea3a8b2117cbe8683a5a78b046098dca41c18b01324
```

## 🚀 **GitHub Actions Setup (Recommended)**

### **1. Scraping Cronjob File:**

```
.github/workflows/scraping-cron.yml
```

```yaml
name: Scheduled Data Scraping

on:
  schedule:
    # Run every 6 hours
    - cron: "0 */6 * * *"
  workflow_dispatch: # Manual trigger

jobs:
  scrape-data:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Scraping API
        run: |
          curl -X POST "${{ secrets.SCRAPING_ENDPOINT }}" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json" \
            -d '{"source": "github-actions", "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'
```

### **2. Maintenance Cronjob File:**

```
.github/workflows/maintenance-cron.yml
```

```yaml
name: Scheduled Maintenance

on:
  schedule:
    # Run daily at 2 AM UTC
    - cron: "0 2 * * *"
  workflow_dispatch: # Manual trigger

jobs:
  maintenance:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Maintenance API
        run: |
          curl -X POST "${{ secrets.MAINTENANCE_ENDPOINT }}" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json" \
            -d '{"source": "github-actions", "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'
```

### **3. GitHub Secrets Setup:**

Di GitHub repository → Settings → Secrets and variables → Actions:

```
SCRAPING_ENDPOINT = https://your-app.vercel.app/api/cron/scrape
MAINTENANCE_ENDPOINT = https://your-app.vercel.app/api/cron/maintenance
CRON_SECRET = b8fc9de2837daabb6a8f2ea3a8b2117cbe8683a5a78b046098dca41c18b01324
```

## ⏰ **Cron Schedule Options**

### **Recommended Schedules:**

```yaml
# Every 6 hours (recommended)
- cron: "0 */6 * * *"

# Every 3 hours (more frequent)
- cron: "0 */3 * * *"

# Every 12 hours (less frequent)
- cron: "0 */12 * * *"

# Daily at 6 AM UTC
- cron: "0 6 * * *"

# Twice daily (6 AM and 6 PM UTC)
- cron: "0 6,18 * * *"
```

## 🧪 **Testing Cronjob**

### **Manual Test (Development):**

```bash
# Test dengan CRON_SECRET dari .env.local
curl -X POST "http://localhost:3000/api/cron/scrape" \
  -H "Authorization: Bearer b8fc9de2837daabb6a8f2ea3a8b2117cbe8683a5a78b046098dca41c18b01324" \
  -H "Content-Type: application/json"
```

### **Manual Test (Production):**

```bash
# Test dengan production URL
curl -X POST "https://your-app.vercel.app/api/cron/scrape" \
  -H "Authorization: Bearer YOUR_PRODUCTION_CRON_SECRET" \
  -H "Content-Type: application/json"
```

### **GitHub Actions Manual Trigger:**

1. Buka GitHub repository
2. Actions tab
3. "Scheduled Data Scraping" workflow
4. "Run workflow" button

## 📊 **Expected Response**

### **Success Response:**

```json
{
  "success": true,
  "processed": 5,
  "scraped": 6,
  "errors": 0,
  "message": "✅ Cron job completed! Processed 5/6 entries",
  "timestamp": "2024-12-15T10:30:00.000Z",
  "summary": {
    "categories": {
      "berita": 3,
      "laporan": 1,
      "aspirasi": 1
    },
    "urgent_items": 2,
    "potential_hoax": 1
  }
}
```

### **Error Response:**

```json
{
  "success": false,
  "error": "Cron job failed",
  "details": "Error message here",
  "timestamp": "2024-12-15T10:30:00.000Z"
}
```

## 🔧 **Cronjob Features**

### **Scraping Cronjob Features:**

1. ✅ **Scrapes** data from Google News RSS + social media
2. ✅ **AI Analysis** dengan Google Gemini 2.5 Flash
3. ✅ **Categorization** otomatis (berita/laporan/aspirasi)
4. ✅ **Sentiment Analysis** (positif/negatif/netral)
5. ✅ **Hoax Detection** dengan probability scoring
6. ✅ **Database Storage** ke Supabase
7. ✅ **Similar Entry Grouping** untuk trend analysis
8. ✅ **Auto Embedding Generation** untuk new entries
9. ✅ **Rate Limiting** 2.5 detik delay antar AI calls

### **Maintenance Cronjob Features:**

1. ✅ **Embeddings Update** - Generate embeddings untuk entries tanpa embedding
2. ✅ **Deduplication** - Remove duplicate entries berdasarkan similarity
3. ✅ **Database Cleanup** - Remove old completed entries (>1 year)
4. ✅ **Statistics Update** - Update embedding completion statistics
5. ✅ **Batch Processing** - Process dalam batch untuk avoid timeout

### **Security Features:**

- 🔐 **CRON_SECRET** authentication
- 🔐 **Unauthorized** request blocking
- 🔐 **Error logging** tanpa expose sensitive data

## 📈 **Monitoring & Logs**

### **Vercel Logs:**

1. Buka Vercel Dashboard
2. Pilih project Anda
3. Functions tab
4. Lihat logs dari `/api/cron/scrape`

### **GitHub Actions Logs:**

1. GitHub repository → Actions
2. Pilih workflow run
3. Expand "Trigger Scraping API" step

### **Database Monitoring:**

```bash
# Check latest entries
npm run db-stats

# View admin dashboard
http://localhost:3000/admin/login
```

## 🚨 **Troubleshooting**

### **Common Issues:**

#### **401 Unauthorized:**

```
Error: Unauthorized
```

**Solution:** Check CRON_SECRET di GitHub Secrets

#### **500 Internal Server Error:**

```
Error: Cron job failed
```

**Solutions:**

1. Check Supabase connection
2. Verify Gemini API key
3. Check Vercel function logs

#### **No Data Scraped:**

```
"scraped": 0, "processed": 0
```

**Solutions:**

1. Google News mungkin tidak ada berita "Trenggalek"
2. Check scraper keywords
3. Tunggu berita baru

## 🎯 **Production Deployment Steps**

### **1. Deploy to Vercel:**

```bash
vercel --prod
```

### **2. Set Environment Variables di Vercel:**

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GEMINI_API_KEY=...
CRON_SECRET=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://your-app.vercel.app
```

### **3. Update GitHub Secrets:**

```
SCRAPING_ENDPOINT=https://your-app.vercel.app/api/cron/scrape
CRON_SECRET=your_production_cron_secret
```

### **4. Test Production Cronjob:**

```bash
# Manual trigger di GitHub Actions
# Atau curl ke production endpoint
```

### **5. Monitor First Runs:**

- Check Vercel logs
- Verify data di Supabase
- Test admin dashboard

## 📅 **Recommended Schedule**

### **For Production:**

```yaml
# Every 6 hours - optimal balance
- cron: "0 */6 * * *"
```

**Reasoning:**

- ✅ **Frequent enough** untuk capture breaking news
- ✅ **Not too frequent** untuk avoid rate limiting
- ✅ **Cost effective** untuk Vercel function usage
- ✅ **Good coverage** 4x per day

## 🎉 **Summary**

**Cronjob Setup READY:**

- ✅ **Endpoint**: `/api/cron/scrape` (updated & working)
- ✅ **GitHub Actions**: Configured & tested
- ✅ **Security**: CRON_SECRET authentication
- ✅ **AI Integration**: Google Gemini 2.5 Flash
- ✅ **Database**: Supabase integration
- ✅ **Monitoring**: Logs & admin dashboard
- ✅ **Error Handling**: Robust error management

**Siap untuk production deployment dengan automated scraping!** 🚀
