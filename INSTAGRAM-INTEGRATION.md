# Instagram Integration untuk Sapa Trenggalek

## Overview

Sistem monitoring Sapa Trenggalek telah diintegrasikan dengan Instagram menggunakan **Instagram Official API** untuk mengumpulkan konten terkait Trenggalek. Pendekatan ini menggunakan Instagram Graph API resmi dengan access token yang valid.

## Current Status: ✅ ACTIVE

Instagram Official API sudah dikonfigurasi dan berfungsi dengan baik untuk akun terautentikasi.

## Features & Capabilities

### ✅ What Works

- **Authenticated User Media**: Mengambil post dari akun yang terautentikasi
- **Complete Media Data**: URL gambar/video, thumbnail, engagement metrics
- **Official Rate Limiting**: Mengikuti rate limit resmi Instagram (200 requests/hour)
- **Real-time Analytics**: Statistik engagement dan media types

### ⚠️ Current Limitations

- **Authenticated User Only**: Hanya bisa mengakses media dari akun yang terautentikasi
- **Business Account Required**: Hashtag search memerlukan business account verification
- **Public Access Limited**: Akses akun publik lain memerlukan izin khusus dari Instagram

## Setup & Configuration

### Environment Variables Required

```env
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token
INSTAGRAM_SECRET_KEY=your_app_secret_key
```

### Getting Instagram Access Token

1. **Create Facebook App**: Buat aplikasi di Facebook Developers
2. **Add Instagram Basic Display**: Tambahkan produk Instagram Basic Display
3. **Configure OAuth**: Setup redirect URLs dan permissions
4. **Generate Token**: Dapatkan access token melalui OAuth flow
5. **Test Access**: Verifikasi token dapat mengakses user media

### Target Monitoring (Future - After Business Verification)

- `@pemkabtrenggalek` - Akun resmi Pemkab Trenggalek
- `@humas_trenggalek` - Humas Kabupaten Trenggalek
- `@dispar_trenggalek` - Dinas Pariwisata Trenggalek
- `@trenggalekhits` - Akun komunitas Trenggalek
- `@exploretrenggalek` - Akun eksplorasi Trenggalek
- Hashtag: `#trenggalek`, `#pemkabtrenggalek`, `#wisatatrenggalek`

## API Endpoints

### Manual Instagram Scraping

```
POST /api/admin/scrape-instagram
```

**Request Body:**

```json
{
  "type": "user|hashtag|multiple",
  "username": "optional_username",
  "hashtag": "optional_hashtag",
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
    "uniqueUsers": 1,
    "mediaTypes": {"VIDEO": 7, "IMAGE": 12, "CAROUSEL_ALBUM": 6},
    "totalEngagement": 563,
    "engagementStats": {"avgLikes": 20, "avgComments": 2}
  },
  "count": 25
}
```

### Check API Status

```
GET /api/admin/scrape-instagram
```

Returns current Instagram API configuration status and limitations.

## Automatic Scraping

Instagram scraping terintegrasi dengan cron job system:

```javascript
// Dalam /api/cron/scrape/route.ts
const instagramScraper = new InstagramScraper();
const instagramData = await instagramScraper.scrapeAll();
```

## Rate Limiting & Error Handling

### Official API Rate Limits

- **200 requests per hour** per access token
- **Automatic retry** dengan exponential backoff
- **Error logging** untuk debugging

### Common Issues & Solutions

1. **401 Authentication Error**: Check access token validity
2. **429 Rate Limited**: Wait for rate limit reset (1 hour)
3. **400 Bad Request**: Verify request parameters
4. **Network Issues**: Check internet connection

### Error Response Format

```json
{
  "error": "Rate limit exceeded",
  "message": "Instagram API rate limit reached. Please try again later.",
  "retryAfter": "1 hour"
}
```

## Admin Interface

### Instagram Manager Component

- **API Status Check**: Verifikasi konfigurasi Instagram API
- **Manual Scraping**: Trigger scraping manual dengan berbagai opsi
- **Real-time Analytics**: Statistik engagement dan media types
- **Post Preview**: Preview post dengan thumbnail dan metadata

### Available Scraping Types

1. **User Media**: Scrape dari akun terautentikasi
2. **Hashtag Posts**: Search berdasarkan hashtag (requires business account)
3. **Multiple Accounts**: Scrape dari semua akun yang dikonfigurasi

## Database Integration

Instagram data disimpan dalam tabel `entries` dengan struktur:

```sql
{
  "source": "Instagram",
  "content": "Post caption",
  "author": "username",
  "source_url": "https://www.instagram.com/p/...",
  "metadata": {
    "post_id": "17885246493200871",
    "user_id": "24639025682434359",
    "username": "username",
    "media_type": "IMAGE|VIDEO|CAROUSEL_ALBUM",
    "media_url": "https://...",
    "thumbnail_url": "https://...",
    "like_count": 19,
    "comments_count": 0,
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
2. **Rate Limiting**: Respect Instagram's official rate limits
3. **Error Logging**: Log errors without exposing sensitive data
4. **Data Privacy**: Only collect public data as permitted by Instagram

## Business Account Upgrade Path

### For Enhanced Features:

1. **Convert to Business Account**: Switch Instagram account to business
2. **Connect Facebook Page**: Link Instagram to Facebook business page
3. **Prepare Legal Pages**: Ensure required legal pages are available
4. **App Review**: Submit app for Instagram permissions review
5. **Hashtag Access**: Gain access to hashtag search endpoints
6. **Multiple Accounts**: Access other accounts with proper permissions

### Required Legal Pages for App Review:

- **Privacy Policy**: `/privacy-policy` - ✅ Available
- **Terms of Service**: `/terms-of-service` - ✅ Available
- **Data Deletion Instructions**: `/data-deletion` - ✅ Available

These pages are required by Instagram for app verification and business account features.

## Testing & Validation

### Test Current Implementation

```bash
# Check API status
curl -X GET http://localhost:3000/api/admin/scrape-instagram

# Test user media scraping
curl -X POST http://localhost:3000/api/admin/scrape-instagram \
  -H "Content-Type: application/json" \
  -d '{"type": "multiple"}'
```

### Expected Results

- ✅ 200 OK response with media data
- ✅ Complete engagement metrics
- ✅ Valid media URLs and thumbnails
- ✅ Proper error handling for rate limits
