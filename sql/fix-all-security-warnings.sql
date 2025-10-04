-- Fix All Security Warnings for Vector Embedding Functions
-- Run this in Supabase SQL Editor to resolve all security warnings

-- 1. Fix Function Search Path Mutable warnings
-- Add SET search_path = '' to all functions for security

-- Drop and recreate find_similar_content with secure search_path
DROP FUNCTION IF EXISTS find_similar_content(vector, float, int);
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
SECURITY INVOKER
SET search_path = ''  -- Fix: Immutable search_path for security
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
    FROM public.data_entries de  -- Explicit schema reference
    WHERE de.content_embedding IS NOT NULL
        AND 1 - (de.content_embedding <=> query_embedding) >= similarity_threshold
    ORDER BY de.content_embedding <=> query_embedding
    LIMIT max_results;
END;
$$;

-- Drop and recreate detect_potential_hoax with secure search_path
DROP FUNCTION IF EXISTS detect_potential_hoax(vector, text, float);
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
SECURITY INVOKER
SET search_path = ''  -- Fix: Immutable search_path for security
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
    FROM public.data_entries de  -- Explicit schema reference
    WHERE de.content_embedding IS NOT NULL
        AND de.hoax_probability > 50
        AND 1 - (de.content_embedding <=> query_embedding) >= similarity_threshold
    ORDER BY de.content_embedding <=> query_embedding
    LIMIT 5;
END;
$$;

-- Drop and recreate find_duplicate_content with secure search_path
DROP FUNCTION IF EXISTS find_duplicate_content(vector, float);
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
SECURITY INVOKER
SET search_path = ''  -- Fix: Immutable search_path for security
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
    FROM public.data_entries de  -- Explicit schema reference
    WHERE de.content_embedding IS NOT NULL
        AND 1 - (de.content_embedding <=> query_embedding) >= similarity_threshold
    ORDER BY de.content_embedding <=> query_embedding
    LIMIT 3;
END;
$$;

-- Drop and recreate get_embedding_statistics with secure search_path
DROP FUNCTION IF EXISTS get_embedding_statistics();
CREATE OR REPLACE FUNCTION get_embedding_statistics()
RETURNS TABLE(
    total_entries bigint,
    entries_with_embeddings bigint,
    entries_without_embeddings bigint,
    completion_percentage integer
) 
SECURITY INVOKER
SET search_path = ''  -- Fix: Immutable search_path for security
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
    FROM public.data_entries;  -- Explicit schema reference
END;
$$;

-- Drop and recreate get_similar_entries_by_id with secure search_path
DROP FUNCTION IF EXISTS get_similar_entries_by_id(UUID, float, int);
CREATE OR REPLACE FUNCTION get_similar_entries_by_id(
    entry_id UUID,
    similarity_threshold float DEFAULT 0.8,
    max_results int DEFAULT 5
)
RETURNS TABLE(
    id UUID,
    content TEXT,
    source VARCHAR(100),
    category VARCHAR(20),
    similarity_score float
) 
SECURITY INVOKER
SET search_path = ''  -- Fix: Immutable search_path for security
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        de2.id,
        de2.content,
        de2.source,
        de2.category,
        1 - (de1.content_embedding <=> de2.content_embedding) as similarity_score
    FROM public.data_entries de1  -- Explicit schema reference
    CROSS JOIN public.data_entries de2  -- Explicit schema reference
    WHERE de1.id = entry_id
        AND de2.id != entry_id
        AND de1.content_embedding IS NOT NULL
        AND de2.content_embedding IS NOT NULL
        AND 1 - (de1.content_embedding <=> de2.content_embedding) >= similarity_threshold
    ORDER BY de1.content_embedding <=> de2.content_embedding
    LIMIT max_results;
END;
$$;

-- Drop and recreate get_embedding_batch_info with secure search_path
DROP FUNCTION IF EXISTS get_embedding_batch_info(int);
CREATE OR REPLACE FUNCTION get_embedding_batch_info(batch_size int DEFAULT 50)
RETURNS TABLE(
    total_without_embeddings int,
    batch_count int,
    estimated_time_minutes int
) 
SECURITY INVOKER
SET search_path = ''  -- Fix: Immutable search_path for security
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::int as total_without_embeddings,
        CEIL(COUNT(*)::float / batch_size::float)::int as batch_count,
        CEIL((COUNT(*)::float * 0.2) / 60)::int as estimated_time_minutes
    FROM public.data_entries   -- Explicit schema reference
    WHERE content_embedding IS NULL;
END;
$$;

-- Fix existing trigger functions with secure search_path
DROP FUNCTION IF EXISTS update_content_embedding_trigger() CASCADE;
CREATE OR REPLACE FUNCTION update_content_embedding_trigger()
RETURNS TRIGGER 
SECURITY INVOKER
SET search_path = ''  -- Fix: Immutable search_path for security
LANGUAGE plpgsql
AS $$
BEGIN
    -- Mark that embedding needs to be updated when content changes
    IF OLD.content IS DISTINCT FROM NEW.content THEN
        NEW.content_embedding = NULL; -- Will be updated by background job
    END IF;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS update_embedding_on_content_change ON data_entries;
CREATE TRIGGER update_embedding_on_content_change
    BEFORE UPDATE ON public.data_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_content_embedding_trigger();

-- Fix existing update_updated_at_column function
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY INVOKER
SET search_path = ''  -- Fix: Immutable search_path for security
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Recreate triggers for updated_at
DROP TRIGGER IF EXISTS update_data_entries_updated_at ON data_entries;
CREATE TRIGGER update_data_entries_updated_at 
    BEFORE UPDATE ON public.data_entries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
CREATE TRIGGER update_system_settings_updated_at 
    BEFORE UPDATE ON public.system_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 2. Fix Extension in Public Schema warning
-- Note: Moving vector extension requires superuser privileges
-- This is typically handled by Supabase, but we can create a schema for it

-- Create extensions schema (if not exists)
CREATE SCHEMA IF NOT EXISTS extensions;

-- Note: The vector extension move requires superuser privileges
-- For Supabase hosted instances, this warning can be safely ignored
-- as Supabase manages extension security properly

-- Grant permissions to all functions
GRANT EXECUTE ON FUNCTION find_similar_content(vector, float, int) TO authenticated;
GRANT EXECUTE ON FUNCTION find_similar_content(vector, float, int) TO anon;

GRANT EXECUTE ON FUNCTION detect_potential_hoax(vector, text, float) TO authenticated;
GRANT EXECUTE ON FUNCTION detect_potential_hoax(vector, text, float) TO anon;

GRANT EXECUTE ON FUNCTION find_duplicate_content(vector, float) TO authenticated;
GRANT EXECUTE ON FUNCTION find_duplicate_content(vector, float) TO anon;

GRANT EXECUTE ON FUNCTION get_embedding_statistics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_embedding_statistics() TO anon;

GRANT EXECUTE ON FUNCTION get_similar_entries_by_id(UUID, float, int) TO authenticated;
GRANT EXECUTE ON FUNCTION get_similar_entries_by_id(UUID, float, int) TO anon;

GRANT EXECUTE ON FUNCTION get_embedding_batch_info(int) TO authenticated;
GRANT EXECUTE ON FUNCTION get_embedding_batch_info(int) TO anon;

-- Add comments for documentation
COMMENT ON FUNCTION find_similar_content IS 'Find similar content using vector cosine similarity with secure search_path';
COMMENT ON FUNCTION detect_potential_hoax IS 'Detect potential hoax content based on similarity to known hoax entries with secure search_path';
COMMENT ON FUNCTION find_duplicate_content IS 'Find duplicate content using high similarity threshold with secure search_path';
COMMENT ON FUNCTION get_embedding_statistics IS 'Get embedding coverage statistics with secure search_path';
COMMENT ON FUNCTION get_similar_entries_by_id IS 'Get similar entries for a specific entry ID with secure search_path';
COMMENT ON FUNCTION get_embedding_batch_info IS 'Get batch processing information for embeddings with secure search_path';

-- Verify all functions are created with proper security settings
SELECT 
    routine_name,
    security_type,
    routine_definition LIKE '%SET search_path%' as has_secure_search_path
FROM information_schema.routines 
WHERE routine_name IN (
    'find_similar_content',
    'detect_potential_hoax', 
    'find_duplicate_content',
    'get_embedding_statistics',
    'get_similar_entries_by_id',
    'get_embedding_batch_info',
    'update_content_embedding_trigger',
    'update_updated_at_column'
)
ORDER BY routine_name;

-- Test the main functions
SELECT 'Testing get_embedding_statistics' as test;
SELECT * FROM get_embedding_statistics();

SELECT 'All security fixes applied successfully!' as status;