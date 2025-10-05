# Design Document: Trends & Issues Page

## Overview

The Trends & Issues page provides comprehensive analysis of trending topics, sentiment patterns, and emerging issues from collected social media and news data. The design emphasizes data visualization, trend analysis, and actionable insights to help government officials understand public discourse and respond proactively to emerging concerns.

## Architecture

### Page Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    Header with Overview                     │
│  📈 Trending Now | 📊 Sentiment: 65% Positive | 🔄 Live    │
├─────────────────────────────────────────────────────────────┤
│                    Time Range & Filters                     │
│  [24h ▼] [All Departments ▼] [All Sources ▼] [🔍 Search]   │
├─────────────────────────────────────────────────────────────┤
│  Top Trends (Left)          │  Sentiment Analysis (Right)   │
│  ┌─────────────────────────┐ │ ┌─────────────────────────────┐ │
│  │ 🔥 #TrenggalekMaju      │ │ │     Sentiment Over Time     │ │
│  │ 📈 +150% (2.3k mentions)│ │ │ ┌─────────────────────────┐ │ │
│  │ ⬆️ Rising Fast          │ │ │ │   📊 Line Chart        │ │ │
│  └─────────────────────────┘ │ │ │   Pos/Neg/Neutral      │ │ │
│  ┌─────────────────────────┐ │ │ └─────────────────────────┘ │ │
│  │ 🚧 Infrastruktur        │ │ └─────────────────────────────┘ │
│  │ 📊 +45% (890 mentions) │ │                                 │
│  │ ⬆️ Trending Up          │ │  Issue Detection (Bottom)       │
│  └─────────────────────────┘ │ ┌─────────────────────────────┐ │
├─────────────────────────────┤ │ │ 🚨 Emerging Issues          │ │
│  Keyword Cloud (Center)     │ │ │ • Jalan Rusak Panggul      │ │
│  ┌─────────────────────────┐ │ │ │   Velocity: +200%/hour     │ │
│  │    TRENGGALEK           │ │ │ │ • Pelayanan Kesehatan      │ │
│  │  infrastruktur JALAN    │ │ │ │   Velocity: +80%/hour      │ │
│  │    kesehatan            │ │ │ └─────────────────────────────┘ │
│  │  PELAYANAN  pendidikan  │ │ │                                 │
│  └─────────────────────────┘ │ │                                 │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
TrendsIssuesPage
├── TrendsHeader (overview stats, live indicator)
├── FilterPanel (time range, department, source filters)
├── TrendsGrid
│   ├── TopTrends (trending keywords/topics)
│   ├── SentimentAnalysis (sentiment charts)
│   ├── KeywordCloud (visual word cloud)
│   └── EmergingIssues (issue detection)
├── DetailModal (detailed trend analysis)
└── ExportPanel (data export options)
```

## Components and Interfaces

### 1. Trend Analysis Engine

**Core trend detection and analysis:**

```typescript
interface TrendData {
  keyword: string;
  mentions: number;
  growth_rate: number;
  momentum: "rising" | "stable" | "declining";
  sentiment_distribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  sources: Record<string, number>;
  time_series: Array<{
    timestamp: Date;
    count: number;
    sentiment_avg: number;
  }>;
  related_keywords: string[];
  sample_entries: string[];
}

interface EmergingIssue {
  id: string;
  title: string;
  keywords: string[];
  velocity: number; // growth rate per hour
  urgency_score: number;
  department_relevance: string[];
  geographic_distribution: Record<string, number>;
  first_detected: Date;
  peak_time?: Date;
  related_entries: string[];
}
```

### 2. Sentiment Analysis System

**Advanced sentiment tracking:**

```typescript
interface SentimentTrend {
  keyword: string;
  time_range: {
    start: Date;
    end: Date;
  };
  sentiment_timeline: Array<{
    timestamp: Date;
    positive_ratio: number;
    negative_ratio: number;
    neutral_ratio: number;
    confidence_score: number;
    sample_size: number;
  }>;
  significant_shifts: Array<{
    timestamp: Date;
    shift_type: "positive" | "negative";
    magnitude: number;
    statistical_significance: number;
  }>;
}
```

### 3. Data Processing Pipeline

**Real-time trend calculation:**

```typescript
interface TrendCalculator {
  calculateTrends(timeRange: string): Promise<TrendData[]>;
  detectEmergingIssues(threshold: number): Promise<EmergingIssue[]>;
  analyzeSentimentTrends(keywords: string[]): Promise<SentimentTrend[]>;
  generateKeywordCloud(limit: number): Promise<KeywordCloudData>;
}

interface KeywordCloudData {
  keywords: Array<{
    text: string;
    weight: number;
    sentiment: "positive" | "negative" | "neutral";
    category: string;
  }>;
  total_mentions: number;
  time_range: string;
}
```

## Data Models

### Database Schema Extensions

**Trends analysis tables:**

```sql
-- Keyword trends tracking
CREATE TABLE keyword_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword VARCHAR(255) NOT NULL,
  time_bucket TIMESTAMP NOT NULL, -- hourly buckets
  mention_count INTEGER DEFAULT 0,
  positive_count INTEGER DEFAULT 0,
  negative_count INTEGER DEFAULT 0,
  neutral_count INTEGER DEFAULT 0,
  sources JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Emerging issues detection
CREATE TABLE emerging_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  keywords TEXT[] NOT NULL,
  velocity FLOAT NOT NULL,
  urgency_score INTEGER NOT NULL,
  department_relevance TEXT[],
  status VARCHAR(20) DEFAULT 'active',
  first_detected TIMESTAMP DEFAULT NOW(),
  peak_detected TIMESTAMP,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Trend analysis cache
CREATE TABLE trend_analysis_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key VARCHAR(255) UNIQUE NOT NULL,
  data JSONB NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints

**New API routes for trends:**

```typescript
// GET /api/trends - Get trending topics
interface TrendsQuery {
  timeRange?: "1h" | "6h" | "24h" | "7d" | "30d";
  department?: string[];
  sources?: string[];
  limit?: number;
  minMentions?: number;
}

// GET /api/trends/sentiment - Get sentiment analysis
interface SentimentQuery {
  keywords?: string[];
  timeRange?: string;
  granularity?: "hour" | "day" | "week";
}

// GET /api/trends/emerging - Get emerging issues
interface EmergingIssuesQuery {
  velocityThreshold?: number;
  urgencyMin?: number;
  departments?: string[];
  status?: "active" | "resolved" | "all";
}

// GET /api/trends/keywords - Get keyword cloud data
interface KeywordCloudQuery {
  timeRange?: string;
  limit?: number;
  minWeight?: number;
  categories?: string[];
}

// POST /api/trends/analyze - Trigger trend analysis
interface AnalyzeRequest {
  forceRefresh?: boolean;
  timeRange?: string;
  keywords?: string[];
}
```

## Error Handling

### Error Scenarios and Responses

1. **Insufficient Data**

   - Display message about data collection period
   - Show available data with disclaimers
   - Suggest longer time ranges

2. **Analysis Processing Errors**

   - Graceful fallback to cached results
   - Show partial results with warnings
   - Retry mechanism for failed calculations

3. **Real-time Update Failures**

   - Continue with last successful data
   - Show connection status indicator
   - Manual refresh option

4. **Performance Issues**
   - Implement progressive loading
   - Show loading indicators for heavy calculations
   - Cache frequently requested analyses

## Testing Strategy

### Unit Tests

- Trend calculation algorithms
- Sentiment analysis accuracy
- Keyword extraction and weighting
- Statistical significance calculations

### Integration Tests

- End-to-end trend detection workflow
- Real-time data processing pipeline
- API endpoint functionality
- Database query performance

### Performance Tests

- Large dataset processing (10k+ entries)
- Real-time calculation speed
- Memory usage during analysis
- Concurrent user load testing

### Data Quality Tests

- Trend accuracy validation
- Sentiment analysis precision
- Emerging issue detection reliability
- Statistical significance verification

## Implementation Considerations

### Real-time Processing

- Scheduled trend calculation (every 15 minutes)
- Incremental data processing
- Efficient caching strategies
- Background job processing

### Performance Optimization

- Pre-calculated trend data
- Indexed keyword searches
- Materialized views for complex queries
- CDN for static visualizations

### Visualization Libraries

- Chart.js for time-series charts
- D3.js for custom visualizations
- WordCloud library for keyword clouds
- Responsive design for mobile devices

### Statistical Analysis

- Moving averages for trend smoothing
- Statistical significance testing
- Confidence intervals for predictions
- Anomaly detection algorithms

### Scalability Considerations

- Horizontal scaling for analysis workers
- Database partitioning by time
- Caching layer for frequent queries
- Asynchronous processing for heavy calculations

This design ensures comprehensive trend analysis while maintaining performance and providing actionable insights for government decision-making.
