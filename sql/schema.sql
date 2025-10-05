-- Sapa Trenggalek Database Schema - Complete Setup
-- Jalankan script ini di Supabase SQL Editor untuk setup lengkap

-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable vector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- 2. MAIN TABLES
-- ============================================================================

-- Main data entries table
CREATE TABLE data_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content TEXT NOT NULL,
    source VARCHAR(100) NOT NULL,
    source_url TEXT,
    author VARCHAR(255),
    category VARCHAR(20) CHECK (category IN ('berita', 'laporan', 'aspirasi', 'lainnya')) DEFAULT 'lainnya',
    sentiment VARCHAR(10) CHECK (sentiment IN ('positif', 'negatif', 'netral')) DEFAULT 'netral',
    urgency_level INTEGER CHECK (urgency_level >= 1 AND urgency_level <= 10) DEFAULT 1,
    hoax_probability INTEGER CHECK (hoax_probability >= 0 AND hoax_probability <= 100) DEFAULT 0,
    status VARCHAR(20) CHECK (status IN ('baru', 'diverifikasi', 'diteruskan', 'dikerjakan', 'selesai')) DEFAULT 'baru',
    processed_by_ai BOOLEAN DEFAULT FALSE,
    ai_analysis JSONB,
    related_entries UUID[],
    admin_notes TEXT,
    content_embedding vector(768), -- Google Gemini embeddings (768 dimensions)
    content_hash VARCHAR(16), -- For deduplication
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Keywords tracking table
CREATE TABLE monitoring_keywords (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    keyword VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System settings table
CREATE TABLE system_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin users table (for authentication)
CREATE TABLE admin_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_data_entries_created_at ON data_entries(created_at DESC);
CREATE INDEX idx_data_entries_category ON data_entries(category);
CREATE INDEX idx_data_entries_status ON data_entries(status);
CREATE INDEX idx_data_entries_urgency ON data_entries(urgency_level DESC);
CREATE INDEX idx_data_entries_hoax_prob ON data_entries(hoax_probability DESC);
CREATE INDEX idx_data_entries_source ON data_entries(source);

-- Full text search index
CREATE INDEX idx_data_entries_content_search ON data_entries USING gin(to_tsvector('indonesian', content));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_data_entries_updated_at 
    BEFORE UPDATE ON data_entries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at 
    BEFORE UPDATE ON system_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default monitoring keywords
INSERT INTO monitoring_keywords (keyword) VALUES
('trenggalek'),
('pemkab trenggalek'),
('bupati trenggalek'),
('dinas trenggalek'),
('kecamatan trenggalek'),
('kabupaten trenggalek'),
('pemerintah trenggalek');

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('scraping_interval_hours', '6', 'Interval scraping dalam jam'),
('max_hoax_probability_alert', '70', 'Threshold probabilitas hoaks untuk alert'),
('min_urgency_level_alert', '7', 'Minimum level urgensi untuk alert'),
('auto_categorization', 'true', 'Aktifkan kategorisasi otomatis dengan AI'),
('notification_email', '', 'Email untuk notifikasi sistem');

-- Row Level Security (RLS) policies
ALTER TABLE data_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (in production, implement proper auth)
CREATE POLICY "Allow all operations on data_entries" ON data_entries FOR ALL USING (true);
CREATE POLICY "Allow all operations on monitoring_keywords" ON monitoring_keywords FOR ALL USING (true);
CREATE POLICY "Allow all operations on system_settings" ON system_settings FOR ALL USING (true);
CREATE POLICY "Allow all operations on admin_users" ON admin_users FOR ALL USING (true);

-- ============================================================================
-- 3. VECTOR SEARCH SUPPORT
-- ============================================================================

-- Vector similarity index for embeddings
CREATE INDEX idx_data_entries_embedding ON data_entries 
USING ivfflat (content_embedding vector_cosine_ops) WITH (lists = 100);

-- Content hash index for deduplication
CREATE INDEX idx_data_entries_content_hash ON data_entries(content_hash);

-- ============================================================================
-- 4. VECTOR SEARCH FUNCTIONS
-- ============================================================================

-- Function for similarity search
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

-- Function to find similar entries by ID
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
    -- Get the embedding of the specified entry
    SELECT content_embedding INTO query_embedding
    FROM data_entries
    WHERE data_entries.id = entry_id;
    
    -- If no embedding found, return empty result
    IF query_embedding IS NULL THEN
        RETURN;
    END IF;
    
    -- Find similar entries
    RETURN QUERY
    SELECT 
        de.id,
        de.content,
        de.source,
        de.category,
        1 - (de.content_embedding <=> query_embedding) as similarity_score
    FROM data_entries de
    WHERE de.content_embedding IS NOT NULL
        AND de.id != entry_id  -- Exclude the original entry
        AND 1 - (de.content_embedding <=> query_embedding) >= similarity_threshold
    ORDER BY de.content_embedding <=> query_embedding
    LIMIT max_results;
END;
$;

-- Function to detect potential duplicates
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

-- Function to get embedding statistics
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

-- Function to get embedding batch info
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
    -- Get total count of entries without embeddings
    SELECT COUNT(*) INTO total_count
    FROM data_entries 
    WHERE content_embedding IS NULL;
    
    -- Get sample IDs for the first batch
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
-- 5. UTILITY FUNCTIONS
-- ============================================================================

-- Function to clean up old entries (optional)
CREATE OR REPLACE FUNCTION cleanup_old_entries(days_old int DEFAULT 365)
RETURNS integer
SECURITY INVOKER
SET search_path = ''
LANGUAGE plpgsql
AS $
DECLARE
    deleted_count integer;
BEGIN
    DELETE FROM data_entries 
    WHERE created_at < NOW() - INTERVAL '1 day' * days_old
        AND status = 'selesai';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$;

-- ============================================================================
-- 6. GRANTS AND PERMISSIONS
-- ============================================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON data_entries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON monitoring_keywords TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON system_settings TO authenticated;
GRANT SELECT ON admin_users TO authenticated;

-- Grant permissions to anonymous users (read-only for public data)
GRANT SELECT ON data_entries TO anon;
GRANT SELECT ON monitoring_keywords TO anon;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION find_similar_content(vector, float, int) TO authenticated;
GRANT EXECUTE ON FUNCTION get_similar_entries_by_id(UUID, float, int) TO authenticated;
GRANT EXECUTE ON FUNCTION find_duplicate_content(vector, float) TO authenticated;
GRANT EXECUTE ON FUNCTION get_embedding_statistics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_embedding_batch_info(int) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_entries(int) TO authenticated;

-- Grant execute permissions to anon for read-only functions
GRANT EXECUTE ON FUNCTION get_embedding_statistics() TO anon;

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================

-- Verify setup
SELECT 'Sapa Trenggalek Database Setup Complete!' as status;
SELECT 'Extensions installed:' as info;
SELECT extname, extversion FROM pg_extension WHERE extname IN ('uuid-ossp', 'vector');
SELECT 'Tables created:' as info;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE '%data_entries%' OR tablename LIKE '%monitoring%';
SELECT 'Functions created:' as info;
SELECT proname FROM pg_proc WHERE proname LIKE '%similar%' OR proname LIKE '%embedding%';