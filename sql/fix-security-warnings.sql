-- Fix Security Warnings for Vector Embedding Views
-- Run this in Supabase SQL Editor to resolve security warnings

-- Drop the existing view that has SECURITY DEFINER issues
DROP VIEW IF EXISTS embedding_stats;

-- Create a safer view without SECURITY DEFINER
CREATE VIEW embedding_stats AS
SELECT 
    COUNT(*) as total_entries,
    COUNT(content_embedding) as entries_with_embeddings,
    COUNT(*) - COUNT(content_embedding) as entries_without_embeddings,
    CASE 
        WHEN COUNT(*) = 0 THEN 0
        ELSE CAST(((COUNT(content_embedding) * 100) / COUNT(*)) AS INTEGER)
    END as completion_percentage
FROM data_entries;

-- Grant appropriate permissions to the view
GRANT SELECT ON embedding_stats TO authenticated;
GRANT SELECT ON embedding_stats TO anon;

-- Create RLS policy for the view if needed
ALTER VIEW embedding_stats OWNER TO postgres;

-- Alternative: Create a function instead of view for better security control
CREATE OR REPLACE FUNCTION get_embedding_statistics()
RETURNS TABLE(
    total_entries bigint,
    entries_with_embeddings bigint,
    entries_without_embeddings bigint,
    completion_percentage integer
) 
SECURITY INVOKER  -- Use SECURITY INVOKER instead of DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_entries,
        COUNT(content_embedding) as entries_with_embeddings,
        COUNT(*) - COUNT(content_embedding) as entries_without_embeddings,
        CASE 
            WHEN COUNT(*) = 0 THEN 0
            ELSE CAST(((COUNT(content_embedding) * 100) / COUNT(*)) AS INTEGER)
        END as completion_percentage
    FROM data_entries;
END;
$$;

-- Grant execute permission to the function
GRANT EXECUTE ON FUNCTION get_embedding_statistics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_embedding_statistics() TO anon;

-- Test the function
SELECT * FROM get_embedding_statistics();

-- Update other functions to use SECURITY INVOKER for better security
CREATE OR REPLACE FUNCTION find_similar_content(
    query_embedding vector(768),
    similarity_threshold float DEFAULT 0.8,
    max_results int DEFAULT 10
)
RETURNS TABLE(
    id UUID,
    content TEXT,
    source VARCHAR(100),
    category VARCHAR(20),
    similarity_score float
) 
SECURITY INVOKER  -- Better security practice
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        de.id,
        de.content,
        de.source,
        de.category,
        1 - (de.content_embedding <=> query_embedding) as similarity_score
    FROM data_entries de
    WHERE de.content_embedding IS NOT NULL
        AND 1 - (de.content_embedding <=> query_embedding) >= similarity_threshold
    ORDER BY de.content_embedding <=> query_embedding
    LIMIT max_results;
END;
$$;

CREATE OR REPLACE FUNCTION detect_potential_hoax(
    query_embedding vector(768),
    content_text TEXT,
    similarity_threshold float DEFAULT 0.9
)
RETURNS TABLE(
    similar_id UUID,
    similar_content TEXT,
    similar_hoax_probability INTEGER,
    similarity_score float,
    is_potential_hoax BOOLEAN
) 
SECURITY INVOKER  -- Better security practice
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        de.id,
        de.content,
        de.hoax_probability,
        1 - (de.content_embedding <=> query_embedding) as similarity_score,
        CASE 
            WHEN de.hoax_probability > 70 AND 1 - (de.content_embedding <=> query_embedding) >= similarity_threshold 
            THEN TRUE 
            ELSE FALSE 
        END as is_potential_hoax
    FROM data_entries de
    WHERE de.content_embedding IS NOT NULL
        AND de.hoax_probability > 50
        AND 1 - (de.content_embedding <=> query_embedding) >= similarity_threshold
    ORDER BY de.content_embedding <=> query_embedding
    LIMIT 5;
END;
$$;

CREATE OR REPLACE FUNCTION find_duplicate_content(
    query_embedding vector(768),
    similarity_threshold float DEFAULT 0.95
)
RETURNS TABLE(
    id UUID,
    content TEXT,
    source VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE,
    similarity_score float
) 
SECURITY INVOKER  -- Better security practice
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        de.id,
        de.content,
        de.source,
        de.created_at,
        1 - (de.content_embedding <=> query_embedding) as similarity_score
    FROM data_entries de
    WHERE de.content_embedding IS NOT NULL
        AND 1 - (de.content_embedding <=> query_embedding) >= similarity_threshold
    ORDER BY de.content_embedding <=> query_embedding
    LIMIT 3;
END;
$$;

-- Grant execute permissions to all functions
GRANT EXECUTE ON FUNCTION find_similar_content(vector, float, int) TO authenticated;
GRANT EXECUTE ON FUNCTION find_similar_content(vector, float, int) TO anon;

GRANT EXECUTE ON FUNCTION detect_potential_hoax(vector, text, float) TO authenticated;
GRANT EXECUTE ON FUNCTION detect_potential_hoax(vector, text, float) TO anon;

GRANT EXECUTE ON FUNCTION find_duplicate_content(vector, float) TO authenticated;
GRANT EXECUTE ON FUNCTION find_duplicate_content(vector, float) TO anon;

-- Verify all functions are working
SELECT 'find_similar_content' as function_name, COUNT(*) as exists 
FROM information_schema.routines 
WHERE routine_name = 'find_similar_content'
UNION ALL
SELECT 'detect_potential_hoax' as function_name, COUNT(*) as exists 
FROM information_schema.routines 
WHERE routine_name = 'detect_potential_hoax'
UNION ALL
SELECT 'find_duplicate_content' as function_name, COUNT(*) as exists 
FROM information_schema.routines 
WHERE routine_name = 'find_duplicate_content'
UNION ALL
SELECT 'get_embedding_statistics' as function_name, COUNT(*) as exists 
FROM information_schema.routines 
WHERE routine_name = 'get_embedding_statistics';

-- Test embedding statistics
SELECT * FROM get_embedding_statistics();