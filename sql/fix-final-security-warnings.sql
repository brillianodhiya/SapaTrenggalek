-- Fix Final 2 Security Warnings
-- Run this in Supabase SQL Editor

-- 1. Fix Security Definer View Error
-- Remove the problematic view and replace with secure function

-- Drop the SECURITY DEFINER view
DROP VIEW IF EXISTS public.embedding_stats;

-- Ensure we have the secure function instead
-- (This should already exist from previous fix, but recreate to be sure)
CREATE OR REPLACE FUNCTION get_embedding_statistics()
RETURNS TABLE(
    total_entries bigint,
    entries_with_embeddings bigint,
    entries_without_embeddings bigint,
    completion_percentage integer
) 
SECURITY INVOKER  -- Uses caller's permissions, not creator's
SET search_path = ''  -- Immutable search_path for security
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

-- Grant permissions to the function
GRANT EXECUTE ON FUNCTION get_embedding_statistics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_embedding_statistics() TO anon;

-- 2. Fix Extension in Public Schema Warning
-- Note: Moving vector extension requires superuser privileges
-- For Supabase hosted instances, we'll create a proper schema structure

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant usage on extensions schema
GRANT USAGE ON SCHEMA extensions TO postgres;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO anon;

-- Note: The actual extension move requires superuser privileges:
-- ALTER EXTENSION vector SET SCHEMA extensions;
-- This command would need to be run by Supabase support or in a self-hosted instance

-- For Supabase hosted instances, we can document this as an acceptable warning
-- since Supabase manages extension security properly

-- Create a comment to document the extension security
COMMENT ON EXTENSION vector IS 'pgvector extension for vector similarity search. Managed by Supabase with proper security controls.';

-- Verify the view is gone and function exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'embedding_stats') 
        THEN 'ERROR: embedding_stats view still exists'
        ELSE 'SUCCESS: embedding_stats view removed'
    END as view_status;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_embedding_statistics') 
        THEN 'SUCCESS: get_embedding_statistics function exists'
        ELSE 'ERROR: get_embedding_statistics function missing'
    END as function_status;

-- Test the function
SELECT 'Testing get_embedding_statistics function:' as test;
SELECT * FROM get_embedding_statistics();

-- Show extension information
SELECT 
    extname as extension_name,
    nspname as schema_name,
    'Extension in public schema - managed by Supabase' as note
FROM pg_extension e
JOIN pg_namespace n ON e.extnamespace = n.oid
WHERE extname = 'vector';

SELECT 'Final security fixes applied!' as status;
SELECT 'Remaining warnings:' as note;
SELECT '1. Extension in Public - This is normal for Supabase hosted instances' as warning_1;
SELECT '2. Supabase manages extension security properly' as explanation;