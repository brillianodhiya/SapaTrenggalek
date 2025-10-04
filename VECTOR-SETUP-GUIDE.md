# 🚀 Vector Embedding Setup Guide

## ⚠️ **Important Notes**

### **PostgreSQL Compatibility:**

If you encounter `function round(double precision, integer) does not exist` error:

- See `POSTGRESQL-COMPATIBILITY-FIX.md` for manual setup
- Or run `sql/fix-vector-functions.sql` in Supabase SQL Editor

### **Security Warnings:**

If you see security warnings in Supabase Dashboard:

- **Final Fix**: See `FINAL-SECURITY-WARNINGS.md` and run `sql/fix-final-security-warnings.sql`
- **Critical**: Fixes Security Definer View ERROR (embedding_stats)
- **Extension Warning**: Extension in Public (acceptable for Supabase hosted)
- **Complete**: All function search_path warnings resolved

## 📋 **Quick Setup (5 Minutes)**

### **Step 1: Database Setup**

```bash
# Setup main database (if not done yet)
npm run setup-db

# Setup vector support
npm run setup-vector
```

### **Step 2: Enable pgvector Extension**

1. **Supabase Dashboard** → Database → Extensions
2. **Search** for "vector"
3. **Enable** pgvector extension
4. **Confirm** installation

### **Step 3: Run Vector Setup**

```bash
# Run vector setup script
npm run setup-vector

# Or force re-run if needed
npm run setup-vector -- --force
```

### **Step 4: Fix Security Warnings**

```sql
-- Run in Supabase SQL Editor
\i sql/fix-final-security-warnings.sql
```

### **Step 5: Generate Embeddings**

1. **Start development server**: `npm run dev`
2. **Open admin panel**: http://localhost:3000/admin
3. **Login**: admin@trenggalek.go.id / admin123
4. **Go to "Embeddings" tab**
5. **Click "Update Missing (Batch 50)"**
6. **Wait for completion** (~10 seconds per batch)

### **Step 6: Test Vector Search**

1. **Go to "Vector Search" tab**
2. **Enter test query**: "kerusakan jalan di trenggalek"
3. **Select search type**: "Konten Serupa"
4. **Click "Cari"**
5. **View results** with similarity scores

## 🎯 **Features After Setup**

### **1. Semantic Search**

- **Meaning-based** search vs keyword matching
- **Example**: "jalan rusak" finds "kerusakan infrastruktur"
- **Threshold**: 70-95% similarity
- **Results**: Ranked by relevance

### **2. Hoax Detection**

- **Pattern recognition** from known hoax content
- **Similarity scoring** to flagged content
- **Automatic flagging** of suspicious patterns
- **Confidence levels** for decisions

### **3. Duplicate Prevention**

- **Automatic detection** of similar content
- **95%+ similarity** threshold
- **Prevents spam** and duplicate reports
- **Content deduplication**

### **4. Content Clustering**

- **Group similar** reports/news
- **Trend analysis** through clustering
- **Related content** suggestions
- **Topic modeling**

## 🔍 **Troubleshooting**

### **Error: "function round(double precision, integer) does not exist"**

**Solution**: PostgreSQL compatibility issue. Run `sql/fix-vector-functions.sql`

### **Error: "Security Definer View"**

**Solution**: Run `sql/fix-final-security-warnings.sql` to fix critical security issue

### **Error: "extension vector does not exist"**

**Solution**: Enable pgvector in Supabase Dashboard → Extensions

### **Error: "column content_embedding does not exist"**

**Solution**: Run `ALTER TABLE` command manually or re-run setup script

### **Error: "function find_similar_content does not exist"**

**Solution**: Copy functions from `sql/add-vector-support.sql` and run manually

### **Error: "permission denied for extension vector"**

**Solution**: Use service role key, not anon key

### **Slow embedding generation**

**Solution**: Normal - each embedding takes ~200ms. Use smaller batches.

### **No search results**

**Solution**: Generate embeddings first in admin panel

## 📈 **Performance Tips**

### **Embedding Generation**

- **Batch size**: 25-50 entries
- **Rate limiting**: 100ms delay between requests
- **Progress tracking**: Check admin panel statistics
- **Background processing**: Can run while using other features

### **Search Performance**

- **Index optimization**: IVFFlat with 100 lists
- **Query speed**: <50ms for 10k entries
- **Similarity threshold**: Higher = faster but fewer results
- **Result limit**: 10-20 results optimal

## 🎉 **Success Indicators**

### **✅ Setup Complete When:**

1. **pgvector extension** enabled
2. **content_embedding column** exists
3. **Vector functions** created successfully
4. **Security warnings** resolved (except Extension in Public)
5. **Admin panel** shows embedding statistics
6. **Search returns** relevant results
7. **No errors** in browser console

### **✅ Ready for Production When:**

1. **All existing content** has embeddings (100%)
2. **Search performance** <100ms
3. **Hoax detection** working with test content
4. **Duplicate prevention** blocking similar submissions
5. **Admin interface** fully functional
6. **Security dashboard** clean (1 acceptable warning)

## 📞 **Support**

### **Common Commands**

```bash
# Check setup status
npm run setup-vector

# Force re-setup
npm run setup-vector -- --force

# View logs
npm run dev

# Test build
npm run build
```

### **SQL Debugging**

```sql
-- Check embedding coverage
SELECT * FROM get_embedding_statistics();

-- Find entries without embeddings
SELECT id, content, created_at
FROM data_entries
WHERE content_embedding IS NULL
ORDER BY created_at DESC
LIMIT 10;

-- Test vector operations
SELECT '[1,2,3]'::vector(3) as test_vector;
```

**🚀 Vector embedding setup selesai! Ready untuk semantic search dan hoax detection!** ✅
