# 🤖 Cronjob Embeddings & Deduplication - Sapa Trenggalek

## 🎯 **Overview**

Sistem cronjob telah diperluas untuk menjalankan **embeddings generation** dan **deduplication** secara otomatis, sehingga database tetap optimal dan search functionality bekerja dengan baik.

## 🔄 **Cronjob Architecture**

### **1. Scraping Cronjob (Enhanced)**

- **Endpoint:** `/api/cron/scrape`
- **Schedule:** Every 6 hours
- **New Feature:** Auto-generate embeddings untuk entries baru

### **2. Maintenance Cronjob (New)**

- **Endpoint:** `/api/cron/maintenance`
- **Schedule:** Daily at 2 AM UTC
- **Features:** Embeddings, Deduplication, Cleanup

## 🚀 **Enhanced Scraping Cronjob**

### **New Features Added:**

```typescript
// After saving new entry to database
await updateEntryEmbedding(data[0].id, item.content);
```

### **What It Does Now:**

1. ✅ **Scrapes** data from sources
2. ✅ **AI Analysis** dengan Gemini
3. ✅ **Database Storage**
4. ✅ **Auto Embedding Generation** (NEW)
5. ✅ **Similar Entry Grouping**

### **Benefits:**

- **Real-time embeddings** untuk entries baru
- **Immediate search capability** untuk new content
- **No manual intervention** required

## 🔧 **New Maintenance Cronjob**

### **Endpoint:** `/api/cron/maintenance`

### **Features:**

#### **1. Embeddings Update**

```typescript
const updatedCount = await batchUpdateEmbeddings(25);
```

- **Process:** 25 entries per run (avoid timeout)
- **Target:** Entries without embeddings
- **Rate limiting:** Built-in delays

#### **2. Deduplication**

```typescript
const deduplicationResult = await runDeduplication();
```

- **Hash-based:** Exact duplicate detection
- **Content-based:** 85% similarity threshold
- **Smart removal:** Keep oldest entry

#### **3. Database Cleanup**

```typescript
const cleanupResult = await cleanupOldEntries();
```

- **Target:** Entries older than 1 year
- **Condition:** Status = 'selesai' (completed)
- **Purpose:** Keep database size manageable

## 📊 **Deduplication Algorithm**

### **Two-Phase Approach:**

#### **Phase 1: Hash-Based (Exact Matches)**

```typescript
// Group by content_hash
const hashGroups = new Map();
entries.forEach((entry) => {
  if (entry.content_hash) {
    if (!hashGroups.has(entry.content_hash)) {
      hashGroups.set(entry.content_hash, []);
    }
    hashGroups.get(entry.content_hash).push(entry);
  }
});
```

#### **Phase 2: Content-Based (Similar Matches)**

```typescript
const similarity = calculateSimilarity(currentPreview, comparePreview);
if (similarity >= 0.85) {
  // Mark as duplicate
}
```

### **Similarity Calculation:**

- **Levenshtein Distance** algorithm
- **85% threshold** untuk similarity
- **Normalize content** sebelum comparison
- **Keep oldest entry** when duplicates found

## ⏰ **Scheduling Strategy**

### **Scraping Cronjob:**

```yaml
# Every 6 hours
- cron: "0 */6 * * *"
```

**Times (UTC):** 00:00, 06:00, 12:00, 18:00
**Times (WIB):** 07:00, 13:00, 19:00, 01:00

### **Maintenance Cronjob:**

```yaml
# Daily at 2 AM UTC (9 AM WIB)
- cron: "0 2 * * *"
```

**Reasoning:**

- **Low traffic time** untuk maintenance
- **After scraping runs** untuk process accumulated data
- **Daily frequency** sufficient untuk maintenance tasks

## 🔐 **Security & Authentication**

### **Same CRON_SECRET** untuk both endpoints:

```bash
Authorization: Bearer YOUR_CRON_SECRET
```

### **Environment Variables:**

```env
CRON_SECRET=your_secure_secret_here
GEMINI_API_KEY=your_gemini_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key
```

## 📈 **Performance Optimization**

### **Batch Processing:**

- **Embeddings:** 25 entries per run
- **Deduplication:** Process in chunks
- **Rate limiting:** Delays between API calls

### **Timeout Prevention:**

- **Limited batch sizes**
- **Progress logging**
- **Error handling** per item

### **Memory Management:**

- **Process recent entries** only (30 days for deduplication)
- **Cleanup old data** automatically
- **Efficient queries** dengan proper indexing

## 🧪 **Testing Commands**

### **Development Testing:**

```bash
# Test scraping cronjob (with embeddings)
npm run test-cron

# Test maintenance cronjob
npm run test-maintenance

# Manual embedding update
curl -X POST "http://localhost:3000/api/admin/update-embeddings" \
  -H "Content-Type: application/json" \
  -d '{"limit": 10}'

# Manual deduplication
curl -X POST "http://localhost:3000/api/admin/deduplicate" \
  -H "Content-Type: application/json" \
  -d '{"threshold": 0.85, "dryRun": true}'
```

### **Production Testing:**

```bash
# Test maintenance cronjob
curl -X POST "https://your-app.vercel.app/api/cron/maintenance" \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```

## 📊 **Expected Responses**

### **Maintenance Cronjob Success:**

```json
{
  "success": true,
  "timestamp": "2024-12-15T02:00:00.000Z",
  "results": {
    "embeddings": {
      "processed": 25,
      "errors": 0
    },
    "deduplication": {
      "found": 3,
      "removed": 3,
      "errors": 0
    },
    "cleanup": {
      "cleaned": 12,
      "errors": 0
    }
  },
  "statistics": {
    "totalEntries": 1250,
    "entriesWithEmbeddings": 1225,
    "entriesWithoutEmbeddings": 25,
    "completionPercentage": 98
  },
  "message": "✅ Maintenance completed! Embeddings: 25, Deduplication: 3 removed, Cleanup: 12"
}
```

## 🚨 **Monitoring & Alerts**

### **Key Metrics to Monitor:**

1. **Embedding Completion Rate**

   ```
   completionPercentage >= 95%
   ```

2. **Deduplication Effectiveness**

   ```
   duplicatesFound < 5% of total entries
   ```

3. **Database Growth**

   ```
   totalEntries growth rate
   ```

4. **Error Rates**
   ```
   errors < 5% per cronjob run
   ```

### **GitHub Actions Logs:**

```yaml
# Scraping workflow logs
GitHub → Actions → "Scheduled Data Scraping"

# Maintenance workflow logs
GitHub → Actions → "Scheduled Maintenance"
```

### **Vercel Function Logs:**

```
Vercel Dashboard → Functions → /api/cron/maintenance
```

## 🔧 **Configuration Options**

### **Embeddings Batch Size:**

```typescript
const embeddingLimit = 25; // Adjust based on performance
```

### **Deduplication Threshold:**

```typescript
const threshold = 0.85; // 85% similarity
```

### **Cleanup Age:**

```typescript
const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
```

## 📅 **Deployment Checklist**

### **GitHub Secrets Setup:**

```
SCRAPING_ENDPOINT = https://your-app.vercel.app/api/cron/scrape
MAINTENANCE_ENDPOINT = https://your-app.vercel.app/api/cron/maintenance
CRON_SECRET = your_production_cron_secret
```

### **Workflow Files:**

- ✅ `.github/workflows/scraping-cron.yml` (updated)
- ✅ `.github/workflows/maintenance-cron.yml` (new)

### **Environment Variables:**

- ✅ `CRON_SECRET` in Vercel
- ✅ `GEMINI_API_KEY` in Vercel
- ✅ `SUPABASE_SERVICE_ROLE_KEY` in Vercel

## 🎯 **Benefits Summary**

### **For System Performance:**

- ✅ **Automatic embeddings** untuk search functionality
- ✅ **Duplicate prevention** untuk clean database
- ✅ **Database optimization** dengan cleanup
- ✅ **Consistent data quality**

### **For Maintenance:**

- ✅ **Zero manual intervention** required
- ✅ **Automated optimization** daily
- ✅ **Proactive cleanup** prevents issues
- ✅ **Monitoring & logging** built-in

### **For Users:**

- ✅ **Fast search results** dengan embeddings
- ✅ **No duplicate content** in results
- ✅ **Consistent performance** over time
- ✅ **Always up-to-date** search index

## 🎉 **Ready for Production**

**Cronjob System ENHANCED:**

- ✅ **Scraping + Auto Embeddings** every 6 hours
- ✅ **Maintenance + Deduplication** daily
- ✅ **GitHub Actions** workflows configured
- ✅ **Error handling** & logging
- ✅ **Performance optimized** dengan batching
- ✅ **Zero maintenance** required

**Sistem sekarang fully automated untuk optimal performance!** 🚀
