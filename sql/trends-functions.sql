-- Trends Functions (Run after tables are created)
-- Run this ONLY after trends-tables-only.sql has been executed successfully

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
AS $$
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
$$;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION calculate_trending_keywords(INTEGER, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_trending_keywords(INTEGER, INTEGER, INTEGER) TO anon;

SELECT 'Trends functions created successfully!' as status;