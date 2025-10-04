-- Fix for PostgreSQL compatibility issues
-- Run this if you encounter ROUND function errors

-- Drop and recreate the view with proper type casting
DROP VIEW IF EXISTS embedding_stats;

CREATE OR REPLACE VIEW embedding_stats AS
SELECT 
    COUNT(*) as total_entries,
    COUNT(content_embedding) as entries_with_embeddings,
    COUNT(*) - COUNT(content_embedding) as entries_without_embeddings,
    CASE 
        WHEN COUNT(*) = 0 THEN 0::numeric
        ELSE ROUND(((COUNT(content_embedding)::numeric / COUNT(*)::numeric) * 100), 2)
    END as completion_percentage
FROM data_entries;

-- Test the view
SELECT * FROM embedding_stats;

-- Alternative simpler version if above still fails
CREATE OR REPLACE VIEW embedding_stats_simple AS
SELECT 
    COUNT(*) as total_entries,
    COUNT(content_embedding) as entries_with_embeddings,
    COUNT(*) - COUNT(content_embedding) as entries_without_embeddings,
    CASE 
        WHEN COUNT(*) = 0 THEN 0
        ELSE CAST(((COUNT(content_embedding) * 100) / COUNT(*)) AS INTEGER)
    END as completion_percentage
FROM data_entries;

-- Test vector operations
SELECT '[1,2,3]'::vector(3) as test_vector;

-- Test cosine similarity if vectors exist
-- SELECT 1 - ('[1,0,0]'::vector(3) <=> '[0,1,0]'::vector(3)) as similarity;