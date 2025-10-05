-- Migration for Trends & Issues Feature
-- Run this in Supabase SQL Editor to add trends analysis functionality

-- Keyword trends tracking table
CREATE TABLE IF NOT EXISTS keyword_trends (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  keyword VARCHAR(255) NOT NULL,
  time_bucket TIMESTAMP NOT NULL, -- hourly buckets
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

-- Function to calculate trending keywords
CREATE OR REPLACE FUNCTION calculate_trending_keywords(
    time_range_hours INTEGER DEFAULT 24,
    min_mentions INTEGER DEFAULT 5,
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE(
    keyword VARCHAR(255),
    total_mentions BIGINT,
    growth_rate FLOAT,
    momentum VARCHAR(20),
    positive_ratio FLOAT,
    negative_ratio FLOAT,
    neutral_ratio FLOAT,
    sources JSONB,
    latest_mentions BIGINT
) 
SECURITY INVOKER
SET search_path = ''
LANGUAGE plpgsql
AS $
DECLARE
    current_period_start TIMESTAMP;
    previous_period_start TIMESTAMP;
    previous_period_end TIMESTAMP;
BEGIN
    -- Calculate time periods
    current_period_start := NOW() - INTERVAL '1 hour' * time_range_hours;
    previous_period_end := current_period_start;
    previous_period_start := current_period_start - INTERVAL '1 hour' * time_range_hours;
    
    RETURN QUERY
    WITH current_period AS (
        SELECT 
            kt.keyword,
            SUM(kt.mention_count) as current_mentions,
            SUM(kt.positive_count) as current_positive,
            SUM(kt.negative_count) as current_negative,
            SUM(kt.neutral_count) as current_neutral,
            jsonb_object_agg(
                COALESCE(source_key, 'unknown'), 
                COALESCE(source_value::int, 0)
            ) as aggregated_sources
        FROM keyword_trends kt
        CROSS JOIN LATERAL jsonb_each_text(kt.sources) AS source_entries(source_key, source_value)
        WHERE kt.time_bucket >= current_period_start
        GROUP BY kt.keyword
        HAVING SUM(kt.mention_count) >= min_mentions
    ),
    previous_period AS (
        SELECT 
            kt.keyword,
            SUM(kt.mention_count) as previous_mentions
        FROM keyword_trends kt
        WHERE kt.time_bucket >= previous_period_start 
            AND kt.time_bucket < previous_period_end
        GROUP BY kt.keyword
    ),
    latest_hour AS (
        SELECT 
            kt.keyword,
            SUM(kt.mention_count) as latest_mentions
        FROM keyword_trends kt
        WHERE kt.time_bucket >= NOW() - INTERVAL '1 hour'
        GROUP BY kt.keyword
    )
    SELECT 
        cp.keyword,
        cp.current_mentions as total_mentions,
        CASE 
            WHEN COALESCE(pp.previous_mentions, 0) = 0 THEN 100.0
            ELSE ((cp.current_mentions - COALESCE(pp.previous_mentions, 0))::FLOAT / COALESCE(pp.previous_mentions, 1)::FLOAT) * 100.0
        END as growth_rate,
        CASE 
            WHEN COALESCE(pp.previous_mentions, 0) = 0 OR cp.current_mentions > pp.previous_mentions * 1.5 THEN 'rising'
            WHEN cp.current_mentions < pp.previous_mentions * 0.8 THEN 'declining'
            ELSE 'stable'
        END as momentum,
        CASE 
            WHEN cp.current_mentions = 0 THEN 0.0
            ELSE cp.current_positive::FLOAT / cp.current_mentions::FLOAT
        END as positive_ratio,
        CASE 
            WHEN cp.current_mentions = 0 THEN 0.0
            ELSE cp.current_negative::FLOAT / cp.current_mentions::FLOAT
        END as negative_ratio,
        CASE 
            WHEN cp.current_mentions = 0 THEN 0.0
            ELSE cp.current_neutral::FLOAT / cp.current_mentions::FLOAT
        END as neutral_ratio,
        cp.aggregated_sources as sources,
        COALESCE(lh.latest_mentions, 0) as latest_mentions
    FROM current_period cp
    LEFT JOIN previous_period pp ON cp.keyword = pp.keyword
    LEFT JOIN latest_hour lh ON cp.keyword = lh.keyword
    ORDER BY cp.current_mentions DESC, growth_rate DESC
    LIMIT limit_count;
END;
$;

-- Function to detect emerging issues
CREATE OR REPLACE FUNCTION detect_emerging_issues(
    velocity_threshold FLOAT DEFAULT 200.0,
    min_mentions INTEGER DEFAULT 10,
    time_window_hours INTEGER DEFAULT 6
)
RETURNS TABLE(
    issue_title VARCHAR(500),
    keywords_array TEXT[],
    calculated_velocity FLOAT,
    urgency_score INTEGER,
    mention_count BIGINT,
    first_mention TIMESTAMP
) 
SECURITY INVOKER
SET search_path = ''
LANGUAGE plpgsql
AS $
DECLARE
    window_start TIMESTAMP;
BEGIN
    window_start := NOW() - INTERVAL '1 hour' * time_window_hours;
    
    RETURN QUERY
    WITH recent_keywords AS (
        SELECT 
            kt.keyword,
            SUM(kt.mention_count) as total_mentions,
            MIN(kt.time_bucket) as first_seen,
            MAX(kt.time_bucket) as last_seen,
            COUNT(DISTINCT kt.time_bucket) as time_buckets,
            AVG(kt.mention_count) as avg_mentions_per_hour
        FROM keyword_trends kt
        WHERE kt.time_bucket >= window_start
        GROUP BY kt.keyword
        HAVING SUM(kt.mention_count) >= min_mentions
    ),
    velocity_calc AS (
        SELECT 
            rk.*,
            CASE 
                WHEN EXTRACT(EPOCH FROM (rk.last_seen - rk.first_seen)) / 3600 > 0 
                THEN rk.total_mentions / (EXTRACT(EPOCH FROM (rk.last_seen - rk.first_seen)) / 3600)
                ELSE rk.total_mentions
            END as velocity
        FROM recent_keywords rk
    )
    SELECT 
        vc.keyword as issue_title,
        ARRAY[vc.keyword] as keywords_array,
        vc.velocity as calculated_velocity,
        CASE 
            WHEN vc.velocity > velocity_threshold * 2 THEN 10
            WHEN vc.velocity > velocity_threshold * 1.5 THEN 8
            WHEN vc.velocity > velocity_threshold THEN 6
            ELSE 4
        END as urgency_score,
        vc.total_mentions as mention_count,
        vc.first_seen as first_mention
    FROM velocity_calc vc
    WHERE vc.velocity >= velocity_threshold
    ORDER BY vc.velocity DESC, vc.total_mentions DESC
    LIMIT 10;
END;
$;

-- Function to get keyword cloud data
CREATE OR REPLACE FUNCTION get_keyword_cloud(
    time_range_hours INTEGER DEFAULT 24,
    limit_count INTEGER DEFAULT 50,
    min_weight INTEGER DEFAULT 3
)
RETURNS TABLE(
    text VARCHAR(255),
    weight INTEGER,
    sentiment VARCHAR(10),
    category VARCHAR(20)
) 
SECURITY INVOKER
SET search_path = ''
LANGUAGE plpgsql
AS $
DECLARE
    time_start TIMESTAMP;
BEGIN
    time_start := NOW() - INTERVAL '1 hour' * time_range_hours;
    
    RETURN QUERY
    SELECT 
        kt.keyword as text,
        SUM(kt.mention_count)::INTEGER as weight,
        CASE 
            WHEN SUM(kt.positive_count) > SUM(kt.negative_count) AND SUM(kt.positive_count) > SUM(kt.neutral_count) THEN 'positive'
            WHEN SUM(kt.negative_count) > SUM(kt.positive_count) AND SUM(kt.negative_count) > SUM(kt.neutral_count) THEN 'negative'
            ELSE 'neutral'
        END as sentiment,
        'general' as category
    FROM keyword_trends kt
    WHERE kt.time_bucket >= time_start
    GROUP BY kt.keyword
    HAVING SUM(kt.mention_count) >= min_weight
    ORDER BY SUM(kt.mention_count) DESC
    LIMIT limit_count;
END;
$;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION calculate_trending_keywords(INTEGER, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION detect_emerging_issues(FLOAT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_keyword_cloud(INTEGER, INTEGER, INTEGER) TO authenticated;

GRANT EXECUTE ON FUNCTION calculate_trending_keywords(INTEGER, INTEGER, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION detect_emerging_issues(FLOAT, INTEGER, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION get_keyword_cloud(INTEGER, INTEGER, INTEGER) TO anon;

SELECT 'Trends & Issues Migration Complete!' as status;