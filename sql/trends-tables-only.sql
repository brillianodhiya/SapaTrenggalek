-- Simple Trends Tables Migration (Without Functions)
-- Run this in Supabase SQL Editor to create basic trends tables

-- Keyword trends tracking table
CREATE TABLE IF NOT EXISTS keyword_trends (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  keyword VARCHAR(255) NOT NULL,
  time_bucket TIMESTAMP NOT NULL,
  mention_count INTEGER DEFAULT 0,
  positive_count INTEGER DEFAULT 0,
  negative_count INTEGER DEFAULT 0,
  neutral_count INTEGER DEFAULT 0,
  sources JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Emerging issues detection table
CREATE TABLE IF NOT EXISTS emerging_issues (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- Trend analysis cache table
CREATE TABLE IF NOT EXISTS trend_analysis_cache (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cache_key VARCHAR(255) UNIQUE NOT NULL,
  data JSONB NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_keyword_trends_keyword ON keyword_trends(keyword);
CREATE INDEX IF NOT EXISTS idx_keyword_trends_time_bucket ON keyword_trends(time_bucket DESC);
CREATE INDEX IF NOT EXISTS idx_keyword_trends_keyword_time ON keyword_trends(keyword, time_bucket DESC);

CREATE INDEX IF NOT EXISTS idx_emerging_issues_status ON emerging_issues(status);
CREATE INDEX IF NOT EXISTS idx_emerging_issues_velocity ON emerging_issues(velocity DESC);
CREATE INDEX IF NOT EXISTS idx_emerging_issues_first_detected ON emerging_issues(first_detected DESC);

CREATE INDEX IF NOT EXISTS idx_trend_cache_key ON trend_analysis_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_trend_cache_expires ON trend_analysis_cache(expires_at);

-- RLS policies
ALTER TABLE keyword_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE emerging_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_analysis_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on keyword_trends" ON keyword_trends FOR ALL USING (true);
CREATE POLICY "Allow all operations on emerging_issues" ON emerging_issues FOR ALL USING (true);
CREATE POLICY "Allow all operations on trend_analysis_cache" ON trend_analysis_cache FOR ALL USING (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON keyword_trends TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON emerging_issues TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON trend_analysis_cache TO authenticated;

GRANT SELECT ON keyword_trends TO anon;
GRANT SELECT ON emerging_issues TO anon;

-- Success message
SELECT 'Trends tables created successfully!' as status;