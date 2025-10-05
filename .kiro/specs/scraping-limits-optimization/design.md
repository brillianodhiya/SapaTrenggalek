# Design Document: Scraping Limits Optimization

## Overview

This design addresses the current limitation in the scraping system where hardcoded low limits (10-50 items) prevent comprehensive data collection. The solution implements configurable scraping limits, intelligent rate limit handling, and optimized data collection strategies to maximize coverage while respecting API constraints.

## Architecture

### Current State Issues

- Twitter scraping limited to 30 recent tweets and 10 timeline tweets per account
- Hardcoded limits in scraper classes
- **Cron job processing limited to only 10 items per run** (major bottleneck)
- No configuration flexibility between environments
- No intelligent rate limit handling
- Missing comprehensive error handling and fallback strategies
- Scraped data gets discarded if more than 10 items are collected

### Proposed Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Config Layer  │────│  Scraper Manager │────│  Data Processor │
│                 │    │                  │    │                 │
│ - Env Variables │    │ - Rate Limiting  │    │ - Deduplication │
│ - Default Limits│    │ - Retry Logic    │    │ - Validation    │
│ - Per-Source    │    │ - Error Handling │    │ - Storage       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌──────────────────┐
                    │  Individual      │
                    │  Scrapers        │
                    │                  │
                    │ - Twitter API    │
                    │ - Instagram API  │
                    │ - News RSS       │
                    │ - Facebook API   │
                    └──────────────────┘
```

## Components and Interfaces

### 1. Configuration Management

**ScrapingConfig Interface:**

```typescript
interface ScrapingConfig {
  twitter: {
    recentTweets: {
      maxResults: number;
      searchQueries: string[];
      retryAttempts: number;
    };
    userTimeline: {
      maxResults: number;
      accounts: string[];
      retryAttempts: number;
    };
    rateLimits: {
      requestsPerWindow: number;
      windowMinutes: number;
      backoffMultiplier: number;
    };
  };
  instagram: {
    maxPostsPerAccount: number;
    accounts: string[];
    retryAttempts: number;
  };
  news: {
    maxArticles: number;
    sources: string[];
  };
  global: {
    maxTotalItems: number;
    timeoutSeconds: number;
    enableFallback: boolean;
  };
}
```

**Configuration Sources (Priority Order):**

1. Environment variables (highest priority)
2. Configuration file (.kiro/scraping-config.json)
3. Default values (fallback)

### 2. Rate Limit Manager

**RateLimitManager Class:**

```typescript
class RateLimitManager {
  private limits: Map<string, RateLimit>;

  async checkLimit(source: string): Promise<boolean>;
  async recordRequest(source: string): Promise<void>;
  async waitForReset(source: string): Promise<void>;
  private calculateBackoff(attempts: number): number;
}

interface RateLimit {
  requests: number;
  windowStart: Date;
  maxRequests: number;
  windowMinutes: number;
  lastReset: Date;
}
```

### 3. Enhanced Scraper Manager

**ScraperManager Class:**

```typescript
class ScraperManager {
  private config: ScrapingConfig;
  private rateLimitManager: RateLimitManager;
  private scrapers: Map<string, BaseScraper>;

  async scrapeAll(): Promise<ScrapedData[]>;
  async scrapeSource(source: string): Promise<ScrapedData[]>;
  private async handleRateLimit(source: string, error: any): Promise<void>;
  private async retryWithBackoff(fn: Function, attempts: number): Promise<any>;
}
```

### 4. Updated Twitter Scraper

**Enhanced TwitterScraper:**

- Remove hardcoded limits
- Accept configuration from ScraperManager
- Implement intelligent retry logic
- Better error categorization (rate limit vs auth vs network)
- Batch processing for multiple accounts

## Data Models

### Configuration Schema

```json
{
  "twitter": {
    "recentTweets": {
      "maxResults": 100,
      "searchQueries": ["trenggalek", "pemkab trenggalek"],
      "retryAttempts": 3
    },
    "userTimeline": {
      "maxResults": 100,
      "accounts": ["pemkabtrenggalek", "humas_trenggalek"],
      "retryAttempts": 3
    },
    "rateLimits": {
      "requestsPerWindow": 300,
      "windowMinutes": 15,
      "backoffMultiplier": 2
    }
  },
  "global": {
    "maxTotalItems": 1000,
    "timeoutSeconds": 300,
    "enableFallback": true
  }
}
```

### Environment Variables

```
# Twitter API Limits
TWITTER_MAX_RECENT_TWEETS=100
TWITTER_MAX_TIMELINE_TWEETS=100
TWITTER_RETRY_ATTEMPTS=3

# Instagram Limits
INSTAGRAM_MAX_POSTS_PER_ACCOUNT=50
INSTAGRAM_RETRY_ATTEMPTS=3

# Global Settings
SCRAPING_MAX_TOTAL_ITEMS=1000
SCRAPING_TIMEOUT_SECONDS=300
SCRAPING_ENABLE_FALLBACK=true
```

## Error Handling

### Error Categories and Responses

1. **Rate Limit Errors (429)**

   - Implement exponential backoff
   - Wait for rate limit reset
   - Continue with other sources
   - Log rate limit hit with reset time

2. **Authentication Errors (401)**

   - Log authentication failure
   - Switch to fallback data
   - Continue with other configured sources
   - Alert system administrators

3. **Network Errors (5xx, timeouts)**

   - Retry with exponential backoff
   - Maximum 3 retry attempts
   - Log network issues
   - Continue with other sources

4. **Data Processing Errors**
   - Log malformed data
   - Skip problematic items
   - Continue processing remaining items
   - Report processing statistics

### Fallback Strategy

```
Primary Source Failed → Retry with Backoff → Alternative Source → Fallback Data → Graceful Degradation
```

## Testing Strategy

### Unit Tests

- Configuration loading and validation
- Rate limit manager functionality
- Error handling for different scenarios
- Data conversion and validation

### Integration Tests

- End-to-end scraping with mocked APIs
- Rate limit simulation and handling
- Configuration override testing
- Fallback mechanism validation

### Performance Tests

- Large dataset processing
- Memory usage monitoring
- API response time measurement
- Concurrent scraping efficiency

### API Limit Testing

- Simulate rate limit scenarios
- Test backoff and retry logic
- Validate graceful degradation
- Monitor API quota usage

## Implementation Considerations

### Twitter API Limits (Based on Research)

- **Free Tier**: 1 request per 15 minutes for search
- **Basic Tier**: 60 requests per 15 minutes for search
- **Pro Tier**: 300 requests per 15 minutes for search
- **User Timeline**: Up to 1500 requests per 15 minutes (Pro)

### Optimization Strategies

1. **Batch Processing**: Group related requests to minimize API calls
2. **Intelligent Caching**: Cache results to reduce redundant requests
3. **Priority Queuing**: Process high-priority sources first
4. **Distributed Timing**: Spread requests across time windows
5. **Smart Filtering**: Apply filters at API level to reduce data transfer

### Monitoring and Metrics

- Requests per minute by source
- Success/failure rates
- Rate limit hit frequency
- Data collection volume
- Processing time per source
- API quota utilization

This design ensures maximum data collection while respecting API constraints and providing robust error handling and fallback mechanisms.
