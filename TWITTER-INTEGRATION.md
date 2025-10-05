# Twitter/X Integration Guide

## Overview

Sistem Sapa Trenggalek sekarang mendukung scraping otomatis dari Twitter/X menggunakan Twitter API v2. Fitur ini memungkinkan monitoring real-time mentions, hashtags, dan konten terkait Trenggalek di platform Twitter/X.

## Features

### 🔍 **Recent Tweets Search**

- Search tweets yang mention keywords terkait Trenggalek
- Filter berdasarkan bahasa Indonesia
- Exclude retweets untuk konten original
- Real-time monitoring dengan rate limiting

### 👤 **User Timeline Scraping**

- Scrape timeline dari akun official (Pemkab, Humas, dll)
- Get original tweets only (no retweets/replies)
- Configurable tweet count limit

### 📈 **Trending Topics**

- Get trending topics di Indonesia
- Monitor viral hashtags
- Identify emerging issues

### 📊 **Analytics & Insights**

- Engagement metrics (likes, retweets, replies)
- Top hashtags analysis
- User engagement statistics
- Sentiment analysis integration

## Setup Instructions

### 1. Twitter Developer Account

1. Buat akun di [Twitter Developer Portal](https://developer.twitter.com/)
2. Apply for API access (Essential/Basic tier sudah cukup)
3. Create new App dan generate API keys

### 2. Environment Variables

Tambahkan ke `.env.local`:

```bash
TWITTER_API_KEY=your-twitter-api-key
TWITTER_API_SECRET=your-twitter-api-secret
TWITTER_ACCESS_TOKEN=your-twitter-access-token
TWITTER_ACCESS_TOKEN_SECRET=your-twitter-access-token-secret
```

### 3. Verification

- Buka Admin Panel → Twitter/X tab
- Click "Status" untuk verify configuration
- Jika configured ✅, siap digunakan

## Usage

### Manual Scraping

1. **Recent Tweets**: Search tweets dengan keywords Trenggalek
2. **User Timeline**: Scrape dari akun specific (@pemkabtrenggalek)
3. **Trending Topics**: Get trending topics Indonesia

### Automated Scraping

Twitter scraping terintegrasi dengan cron job scraping:

- Otomatis scrape setiap interval
- Duplicate prevention
- AI analysis integration

## Keywords Monitoring

Default keywords yang dimonitor:

- `trenggalek`
- `pemkab trenggalek`
- `bupati trenggalek`
- `kabupaten trenggalek`
- `dinas trenggalek`
- `pemerintah trenggalek`
- `warga trenggalek`
- `masyarakat trenggalek`
- `#trenggalek`
- `@pemkabtrenggalek`

## Rate Limits

Twitter API v2 Essential (Free):

- **Tweet search**: 300 requests per 15 minutes
- **User timeline**: 75 requests per 15 minutes
- **Trending topics**: 75 requests per 15 minutes

Rate limiting otomatis di-handle dengan:

- Exponential backoff
- Error handling
- Retry mechanism

## Data Structure

Setiap tweet yang di-scrape menyimpan:

```typescript
{
  content: string;           // Tweet text (cleaned)
  source: "Twitter/X";
  source_url: string;        // Direct link to tweet
  author: string;            // Display name
  timestamp: Date;
  metadata: {
    tweet_id: string;
    username: string;        // @username
    like_count: number;
    retweet_count: number;
    reply_count: number;
    quote_count: number;
    hashtags: string[];      // Extracted hashtags
    mentions: string[];      // Extracted mentions
    is_retweet: boolean;
    is_reply: boolean;
  }
}
```

## Integration Points

### 1. **Cron Job Integration**

- `lib/simple-scraper.ts` → `scrapeTwitterData()`
- Otomatis include dalam `scrapeAllSources()`
- Duplicate prevention dengan content hash

### 2. **AI Analysis**

- Tweet content dianalisis dengan Gemini AI
- Sentiment analysis
- Category classification
- Hoax probability detection

### 3. **Vector Search**

- Tweet content di-embed untuk similarity search
- Cross-platform content matching
- Related content discovery

## Monitoring & Analytics

### Engagement Metrics

- Total likes, retweets, replies
- Average engagement per tweet
- Top performing content
- User engagement patterns

### Content Analysis

- Most used hashtags
- Trending topics correlation
- Mention network analysis
- Viral content identification

### Performance Tracking

- API usage monitoring
- Rate limit tracking
- Error rate analysis
- Scraping success rate

## Best Practices

### 1. **Respectful Usage**

- Follow Twitter API Terms of Service
- Respect rate limits
- Don't spam or abuse API

### 2. **Data Privacy**

- Only scrape public tweets
- Respect user privacy settings
- Comply with data protection laws

### 3. **Content Moderation**

- Monitor for inappropriate content
- Implement content filtering
- Handle sensitive topics carefully

### 4. **Performance Optimization**

- Use appropriate batch sizes
- Implement caching where possible
- Monitor API quota usage

## Troubleshooting

### Common Issues

**❌ Authentication Failed**

- Check API keys validity
- Verify app permissions
- Regenerate tokens if needed

**❌ Rate Limit Exceeded**

- Wait for rate limit reset (15 minutes)
- Reduce scraping frequency
- Implement better batching

**❌ No Tweets Found**

- Check keyword relevance
- Verify search query syntax
- Try broader search terms

**❌ API Quota Exceeded**

- Monitor monthly usage
- Upgrade to higher tier if needed
- Optimize scraping strategy

### Debug Steps

1. Check Twitter API status
2. Verify environment variables
3. Test with simple queries
4. Monitor API response codes
5. Check application logs

## Future Enhancements

### Planned Features

- **Real-time streaming**: Twitter Streaming API integration
- **Advanced analytics**: Sentiment trends, influence mapping
- **Alert system**: Notification for viral content
- **Content classification**: Auto-categorize tweets
- **Multi-language support**: Support for regional languages

### Integration Opportunities

- **WhatsApp integration**: Cross-platform monitoring
- **Facebook integration**: Complete social media coverage
- **Instagram integration**: Visual content monitoring
- **News correlation**: Link tweets with news articles

## Support

Untuk bantuan teknis:

1. Check logs di Admin Panel
2. Verify API configuration
3. Test dengan manual scraping
4. Monitor rate limit usage
5. Contact system administrator

---

**Twitter Integration siap digunakan untuk monitoring komprehensif media sosial Kabupaten Trenggalek!** 🐦✨
