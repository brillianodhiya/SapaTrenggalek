# Facebook Integration untuk Sapa Trenggalek

## Overview

Sistem monitoring Sapa Trenggalek telah diintegrasikan dengan Facebook menggunakan **Facebook Graph API** untuk mengumpulkan konten dari halaman Facebook terkait Trenggalek. Pendekatan ini menggunakan Facebook Graph API resmi dengan access token yang valid.

## Current Status: ✅ READY FOR CONFIGURATION

Facebook integration sudah siap untuk dikonfigurasi dengan access token yang akan disediakan.

## Features & Capabilities

### ✅ What Will Work

- **Page Posts Scraping**: Mengambil post dari Facebook pages yang dapat diakses
- **Complete Post Data**: Content, media, engagement metrics (likes, comments, shares, reactions)
- **Official Rate Limiting**: Mengikuti rate limit resmi Facebook Graph API
- **Real-time Analytics**: Statistik engagement dan post types
- **Multiple Post Types**: Status, photo, video, link, event posts

### ⚠️ Current Limitations

- **Page Access Only**: Hanya bisa mengakses public pages atau pages dengan permission
- **Search Limitations**: Post search memerlukan special permissions
- **Rate Limiting**: Mengikuti rate limit Facebook Graph API
- **Public Content Only**: Hanya konten publik yang dapat diakses

## Setup & Configuration

### Environment Variables Required

```env
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token
```

### Getting Facebook Access Token

1. **Create Facebook App**: Buat aplikasi di Facebook Developers
2. **Add Graph API**: Tambahkan produk Facebook Graph API
3. **Configure Permissions**: Setup permissions untuk pages_read_engagement
4. **Generate Token**: Dapatkan access token melalui Graph API Explorer
5. **Test Access**: Verifikasi token dapat mengakses page posts

### Target Pages for Monitoring

- `pemkabtrenggalek` - Akun resmi Pemkab Trenggalek
- `humastrengggalek` - Humas Kabupaten Trenggalek
- `dispartrenggalek` - Dinas Pariwisata Trenggalek
- `trenggalekhits` - Akun komunitas Trenggalek
- `exploretrenggalek` - Akun eksplorasi Trenggalek

## API Endpoints

### Manual Facebook Scraping

```
POST /api/admin/scrape-facebook
```

**Request Body:**

```json
{
  "type": "page|search|multiple",
  "pageId": "optional_page_id",
  "query": "optional_search_query",
  "maxResults": 20
}
```

**Response:**

```json
{
  "success": true,
  "type": "multiple",
  "results": [...],
  "analysis": {
    "totalPosts": 25,
    "uniquePages": 3,
    "postTypes": {"status": 10, "photo": 8, "video": 5, "link": 2},
    "totalEngagement": 1250,
    "engagementStats": {
      "avgLikes": 45,
      "avgComments": 12,
      "avgShares": 8,
      "totalReactions": 890
    }
  },
  "count": 25
}
```

### Check API Status

```
GET /api/admin/scrape-facebook
```

Returns current Facebook API configuration status and available features.

## Automatic Scraping

Facebook scraping dapat diintegrasikan dengan cron job system:

```javascript
// Dalam /api/cron/scrape/route.ts
const facebookScraper = new FacebookScraper();
const facebookData = await facebookScraper.scrapeAll();
```

## Rate Limiting & Error Handling

### Facebook Graph API Rate Limits

- **200 calls per hour** per access token (default)
- **Automatic retry** dengan exponential backoff
- **Error logging** untuk debugging

### Common Issues & Solutions

1. **401 Authentication Error**: Check access token validity
2. **429 Rate Limited**: Wait for rate limit reset
3. **400 Bad Request**: Verify request parameters and permissions
4. **Network Issues**: Check internet connection

### Error Response Format

```json
{
  "error": "Rate limit exceeded",
  "message": "Facebook API rate limit reached. Please try again later.",
  "retryAfter": "1 hour"
}
```

## Admin Interface

### Facebook Manager Component

- **API Status Check**: Verifikasi konfigurasi Facebook API
- **Manual Scraping**: Trigger scraping manual dengan berbagai opsi
- **Real-time Analytics**: Statistik engagement dan post types
- **Post Preview**: Preview post dengan media dan metadata

### Available Scraping Types

1. **Page Posts**: Scrape dari Facebook page tertentu
2. **Search Posts**: Search berdasarkan query (limited permissions)
3. **Multiple Pages**: Scrape dari semua pages yang dikonfigurasi

## Database Integration

Facebook data disimpan dalam tabel `entries` dengan struktur:

```sql
{
  "source": "Facebook",
  "content": "Post content",
  "author": "page_name",
  "source_url": "https://facebook.com/...",
  "metadata": {
    "post_id": "page_id_post_id",
    "user_id": "page_id",
    "username": "page_name",
    "page_name": "Official Page Name",
    "post_type": "status|photo|video|link|event",
    "media_url": "https://...",
    "thumbnail_url": "https://...",
    "like_count": 45,
    "comment_count": 12,
    "share_count": 8,
    "reaction_count": 67,
    "hashtags": ["#tag1", "#tag2"],
    "mentions": ["@user1", "@user2"]
  }
}
```

## Monitoring Keywords

Sistem memfilter konten berdasarkan keywords Trenggalek:

```javascript
const keywords = [
  "trenggalek",
  "pemkabtrenggalek",
  "bupati_trenggalek",
  "kabupaten_trenggalek",
  "dinas_trenggalek",
  "pemerintah_trenggalek",
  "wisata_trenggalek",
  "kuliner_trenggalek",
  "trenggalekhits",
  "exploretrenggalek",
];
```

## Security & Best Practices

1. **Access Token Security**: Store tokens in environment variables
2. **Rate Limiting**: Respect Facebook's official rate limits
3. **Error Logging**: Log errors without exposing sensitive data
4. **Data Privacy**: Only collect public data as permitted by Facebook

## Required Permissions

### For Basic Page Access:

- `pages_read_engagement` - Read page posts and engagement data
- `pages_show_list` - List pages that the app can access

### For Enhanced Features (Optional):

- `pages_read_user_content` - Read user-generated content on pages
- `pages_manage_posts` - Manage page posts (if needed for moderation)

## Testing & Validation

### Test Current Implementation

```bash
# Check API status
curl -X GET http://localhost:3000/api/admin/scrape-facebook

# Test page scraping
curl -X POST http://localhost:3000/api/admin/scrape-facebook \
  -H "Content-Type: application/json" \
  -d '{"type": "page", "pageId": "pemkabtrenggalek"}'

# Test multiple pages
curl -X POST http://localhost:3000/api/admin/scrape-facebook \
  -H "Content-Type: application/json" \
  -d '{"type": "multiple"}'
```

### Expected Results

- ✅ 200 OK response with post data
- ✅ Complete engagement metrics (likes, comments, shares, reactions)
- ✅ Valid media URLs and thumbnails
- ✅ Proper error handling for rate limits and permissions

## Access Token Setup Guide

### Step 1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "Create App" → "Business" type
3. Fill in app details and create

### Step 2: Add Graph API Product

1. In app dashboard, click "Add Product"
2. Find "Graph API" and click "Set Up"
3. This enables Graph API for your app

### Step 3: Generate Access Token

1. Go to Graph API Explorer: https://developers.facebook.com/tools/explorer/
2. Select your app from dropdown
3. Add permissions: `pages_read_engagement`
4. Click "Generate Access Token"
5. Copy the generated token

### Step 4: Test Token

1. In Graph API Explorer, try: `me/accounts`
2. This should return pages you have access to
3. Test with a page: `{page-id}/posts`

### Step 5: Configure Environment

```env
FACEBOOK_ACCESS_TOKEN=your_generated_access_token
```

## Troubleshooting

### Common Issues

1. **"Invalid OAuth access token"**

   - Token expired or invalid
   - Generate new token in Graph API Explorer

2. **"Insufficient permissions"**

   - Add required permissions to your app
   - Re-generate token with new permissions

3. **"Rate limit exceeded"**

   - Wait for rate limit reset (usually 1 hour)
   - Implement proper delays between requests

4. **"Page not found"**
   - Check page ID is correct
   - Ensure page is public or you have access

### Debug Tips

1. Use Graph API Explorer to test queries
2. Check app permissions in Facebook App settings
3. Verify token validity: `https://graph.facebook.com/me?access_token=YOUR_TOKEN`
4. Monitor rate limits in API responses
