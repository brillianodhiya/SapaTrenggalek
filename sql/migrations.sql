-- Sapa Trenggalek Database Migrations
-- Run this on existing databases to update to latest schema

-- ============================================================================
-- MIGRATION UTILITIES
-- ============================================================================

-- Function to check if column exists
CREATE OR REPLACE FUNCTION column_exists(table_name text, column_name text)
RETURNS boolean AS $
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = $1 
        AND column_name = $2
    );
END;
$ LANGUAGE plpgsql;

-- Function to check if extension exists
CREATE OR REPLACE FUNCTION extension_exists(ext_name text)
RETURNS boolean AS $
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM pg_extension 
        WHERE extname = $1
    );
END;
$ LANGUAGE plpgsql;

-- ============================================================================
-- MIGRATION 1: ADD VECTOR SUPPORT
-- ============================================================================

DO $
BEGIN
    -- Install vector extension if not exists
    IF NOT extension_exists('vector') THEN
        CREATE EXTENSION vector;
        RAISE NOTICE 'Vector extension installed';
    ELSE
        RAISE NOTICE 'Vector extension already exists';
    END IF;
    
    -- Add content_embedding column if not exists
    IF NOT column_exists('data_entries', 'content_embedding') THEN
        ALTER TABLE data_entries ADD COLUMN content_embedding vector(768);
        RAISE NOTICE 'Added content_embedding column';
    ELSE
        RAISE NOTICE 'content_embedding column already exists';
    END IF;
    
    -- Add vector index if not exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'data_entries' 
        AND indexname = 'idx_data_entries_embedding'
    ) THEN
        CREATE INDEX idx_data_entries_embedding ON data_entries 
        USING ivfflat (content_embedding vector_cosine_ops) WITH (lists = 100);
        RAISE NOTICE 'Added vector similarity index';
    ELSE
        RAISE NOTICE 'Vector similarity index already exists';
    END IF;
END;
$;

-- ============================================================================
-- MIGRATION 2: ADD CONTENT HASH FOR DEDUPLICATION
-- ============================================================================

DO $
BEGIN
    -- Add content_hash column if not exists
    IF NOT column_exists('data_entries', 'content_hash') THEN
        ALTER TABLE data_entries ADD COLUMN content_hash VARCHAR(16);
        RAISE NOTICE 'Added content_hash column';
    ELSE
        RAISE NOTICE 'content_hash column already exists';
    END IF;
    
    -- Add content hash index if not exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'data_entries' 
        AND indexname = 'idx_data_entries_content_hash'
    ) THEN
        CREATE INDEX idx_data_entries_content_hash ON data_entries(content_hash);
        RAISE NOTICE 'Added content hash index';
    ELSE
        RAISE NOTICE 'Content hash index already exists';
    END IF;
END;
$;

-- ============================================================================
-- MIGRATION 3: UPDATE VECTOR FUNCTIONS (SECURITY FIXES)
-- ============================================================================

-- Drop old functions that might have security issues
DROP FUNCTION IF EXISTS find_similar_content(vector, float, int);
DROP FUNCTION IF EXISTS get_similar_entries_by_id(UUID, float, int);
DROP FUNCTION IF EXISTS find_duplicate_content(vector, float);
DROP FUNCTION IF EXISTS get_embedding_statistics();
DROP FUNCTION IF EXISTS get_embedding_batch_info(int);

-- Recreate functions with security fixes
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
SET search_path = ''
LANGUAGE plpgsql
AS $
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
$;

CREATE OR REPLACE FUNCTION get_similar_entries_by_id(
    entry_id UUID,
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
SET search_path = ''
LANGUAGE plpgsql
AS $
DECLARE
    query_embedding vector(768);
BEGIN
    SELECT content_embedding INTO query_embedding
    FROM data_entries
    WHERE data_entries.id = entry_id;
    
    IF query_embedding IS NULL THEN
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT 
        de.id,
        de.content,
        de.source,
        de.category,
        1 - (de.content_embedding <=> query_embedding) as similarity_score
    FROM data_entries de
    WHERE de.content_embedding IS NOT NULL
        AND de.id != entry_id
        AND 1 - (de.content_embedding <=> query_embedding) >= similarity_threshold
    ORDER BY de.content_embedding <=> query_embedding
    LIMIT max_results;
END;
$;

CREATE OR REPLACE FUNCTION find_duplicate_content(
    query_embedding vector(768),
    similarity_threshold float DEFAULT 0.95
)
RETURNS TABLE(
    id UUID,
    content TEXT,
    source VARCHAR(100),
    similarity_score float
) 
SECURITY INVOKER
SET search_path = ''
LANGUAGE plpgsql
AS $
BEGIN
    RETURN QUERY
    SELECT 
        de.id,
        de.content,
        de.source,
        1 - (de.content_embedding <=> query_embedding) as similarity_score
    FROM data_entries de
    WHERE de.content_embedding IS NOT NULL
        AND 1 - (de.content_embedding <=> query_embedding) >= similarity_threshold
    ORDER BY de.content_embedding <=> query_embedding;
END;
$;

CREATE OR REPLACE FUNCTION get_embedding_statistics()
RETURNS TABLE(
    total_entries bigint,
    entries_with_embeddings bigint,
    entries_without_embeddings bigint,
    completion_percentage integer
) 
SECURITY INVOKER
SET search_path = ''
LANGUAGE plpgsql
AS $
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
$;

CREATE OR REPLACE FUNCTION get_embedding_batch_info(batch_size int DEFAULT 100)
RETURNS TABLE(
    total_without_embeddings bigint,
    batch_count integer,
    sample_ids UUID[]
) 
SECURITY INVOKER
SET search_path = ''
LANGUAGE plpgsql
AS $
DECLARE
    total_count bigint;
    sample_array UUID[];
BEGIN
    SELECT COUNT(*) INTO total_count
    FROM data_entries 
    WHERE content_embedding IS NULL;
    
    SELECT ARRAY(
        SELECT id 
        FROM data_entries 
        WHERE content_embedding IS NULL 
        ORDER BY created_at 
        LIMIT batch_size
    ) INTO sample_array;
    
    RETURN QUERY
    SELECT 
        total_count,
        CASE 
            WHEN total_count = 0 THEN 0
            ELSE CEIL(total_count::float / batch_size)::integer
        END as batch_count,
        sample_array;
END;
$;

-- ============================================================================
-- MIGRATION 4: REMOVE PROBLEMATIC VIEWS
-- ============================================================================

-- Drop any problematic views that might cause security warnings
DROP VIEW IF EXISTS embedding_stats;
DROP VIEW IF EXISTS embedding_stats_simple;

-- ============================================================================
-- MIGRATION 5: UPDATE PERMISSIONS
-- ============================================================================

-- Grant permissions to authenticated users
GRANT EXECUTE ON FUNCTION find_similar_content(vector, float, int) TO authenticated;
GRANT EXECUTE ON FUNCTION get_similar_entries_by_id(UUID, float, int) TO authenticated;
GRANT EXECUTE ON FUNCTION find_duplicate_content(vector, float) TO authenticated;
GRANT EXECUTE ON FUNCTION get_embedding_statistics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_embedding_batch_info(int) TO authenticated;

-- Grant read-only permissions to anon
GRANT EXECUTE ON FUNCTION get_embedding_statistics() TO anon;

-- ============================================================================
-- MIGRATION CLEANUP
-- ============================================================================

-- Drop utility functions
DROP FUNCTION IF EXISTS column_exists(text, text);
DROP FUNCTION IF EXISTS extension_exists(text);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

SELECT 'Database migration completed successfully!' as status;
SELECT 'Current embedding statistics:' as info;
SELECT * FROM get_embedding_statistics();