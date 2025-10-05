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
-- ==
==========================================================================
-- 7. URGENT ITEMS MANAGEMENT TABLES
-- ============================================================================

-- Urgent item actions tracking table
CREATE TABLE urgent_item_actions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    item_id UUID REFERENCES data_entries(id) ON DELETE CASCADE,
    action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('handled', 'escalated', 'assigned', 'noted')),
    user_id VARCHAR(255) NOT NULL,
    assigned_to VARCHAR(255),
    department VARCHAR(100),
    notes TEXT,
    previous_status VARCHAR(20),
    new_status VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add urgent items related columns to data_entries
ALTER TABLE data_entries 
ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(255),
ADD COLUMN IF NOT EXISTS handled_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS handled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS escalated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS escalation_reason TEXT;

-- Update status check constraint to include new statuses
ALTER TABLE data_entries DROP CONSTRAINT IF EXISTS data_entries_status_check;
ALTER TABLE data_entries ADD CONSTRAINT data_entries_status_check 
CHECK (status IN ('baru', 'diverifikasi', 'diteruskan', 'dikerjakan', 'selesai', 'handled', 'escalated', 'assigned'));

-- Indexes for urgent items performance
CREATE INDEX idx_urgent_actions_item_id ON urgent_item_actions(item_id);
CREATE INDEX idx_urgent_actions_created_at ON urgent_item_actions(created_at DESC);
CREATE INDEX idx_urgent_actions_user_id ON urgent_item_actions(user_id);
CREATE INDEX idx_urgent_actions_action_type ON urgent_item_actions(action_type);

-- Composite index for urgent items query optimization
CREATE INDEX idx_data_entries_urgency_status ON data_entries(urgency_level DESC, status, created_at DESC);
CREATE INDEX idx_data_entries_assigned_to ON data_entries(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_data_entries_handled_by ON data_entries(handled_by) WHERE handled_by IS NOT NULL;

-- Trigger for urgent_item_actions updated_at
CREATE TRIGGER update_urgent_item_actions_updated_at 
    BEFORE UPDATE ON urgent_item_actions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS policies for urgent_item_actions
ALTER TABLE urgent_item_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on urgent_item_actions" ON urgent_item_actions FOR ALL USING (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON urgent_item_actions TO authenticated;
GRANT SELECT ON urgent_item_actions TO anon;

-- ============================================================================
-- 8. URGENT ITEMS UTILITY FUNCTIONS
-- ============================================================================

-- Function to get urgent items with filters
CREATE OR REPLACE FUNCTION get_urgent_items(
    urgency_min int DEFAULT 7,
    categories text[] DEFAULT NULL,
    sources text[] DEFAULT NULL,
    time_range_hours int DEFAULT NULL,
    status_filter text[] DEFAULT NULL,
    limit_count int DEFAULT 50,
    offset_count int DEFAULT 0
)
RETURNS TABLE(
    id UUID,
    content TEXT,
    source VARCHAR(100),
    source_url TEXT,
    author VARCHAR(255),
    category VARCHAR(20),
    sentiment VARCHAR(10),
    urgency_level INTEGER,
    status VARCHAR(20),
    assigned_to VARCHAR(255),
    handled_by VARCHAR(255),
    handled_at TIMESTAMP WITH TIME ZONE,
    escalated_at TIMESTAMP WITH TIME ZONE,
    escalation_reason TEXT,
    ai_analysis JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
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
        de.source_url,
        de.author,
        de.category,
        de.sentiment,
        de.urgency_level,
        de.status,
        de.assigned_to,
        de.handled_by,
        de.handled_at,
        de.escalated_at,
        de.escalation_reason,
        de.ai_analysis,
        de.created_at,
        de.updated_at
    FROM data_entries de
    WHERE de.urgency_level >= urgency_min
        AND (categories IS NULL OR de.category = ANY(categories))
        AND (sources IS NULL OR de.source = ANY(sources))
        AND (time_range_hours IS NULL OR de.created_at >= NOW() - INTERVAL '1 hour' * time_range_hours)
        AND (status_filter IS NULL OR de.status = ANY(status_filter))
    ORDER BY de.urgency_level DESC, de.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$;

-- Function to get urgent items statistics
CREATE OR REPLACE FUNCTION get_urgent_items_stats(
    urgency_min int DEFAULT 7,
    time_range_hours int DEFAULT 24
)
RETURNS TABLE(
    total_urgent bigint,
    by_category jsonb,
    by_source jsonb,
    by_status jsonb,
    avg_response_time_minutes float,
    handled_today bigint,
    escalated_today bigint,
    trends_hourly jsonb
) 
SECURITY INVOKER
SET search_path = ''
LANGUAGE plpgsql
AS $
DECLARE
    category_stats jsonb;
    source_stats jsonb;
    status_stats jsonb;
    hourly_trends jsonb;
    avg_response float;
    handled_count bigint;
    escalated_count bigint;
    total_count bigint;
BEGIN
    -- Get total urgent items
    SELECT COUNT(*) INTO total_count
    FROM data_entries 
    WHERE urgency_level >= urgency_min
        AND created_at >= NOW() - INTERVAL '1 hour' * time_range_hours;
    
    -- Get category breakdown
    SELECT jsonb_object_agg(category, count) INTO category_stats
    FROM (
        SELECT category, COUNT(*) as count
        FROM data_entries 
        WHERE urgency_level >= urgency_min
            AND created_at >= NOW() - INTERVAL '1 hour' * time_range_hours
        GROUP BY category
    ) cat_counts;
    
    -- Get source breakdown
    SELECT jsonb_object_agg(source, count) INTO source_stats
    FROM (
        SELECT source, COUNT(*) as count
        FROM data_entries 
        WHERE urgency_level >= urgency_min
            AND created_at >= NOW() - INTERVAL '1 hour' * time_range_hours
        GROUP BY source
    ) src_counts;
    
    -- Get status breakdown
    SELECT jsonb_object_agg(status, count) INTO status_stats
    FROM (
        SELECT status, COUNT(*) as count
        FROM data_entries 
        WHERE urgency_level >= urgency_min
            AND created_at >= NOW() - INTERVAL '1 hour' * time_range_hours
        GROUP BY status
    ) status_counts;
    
    -- Calculate average response time (in minutes)
    SELECT AVG(EXTRACT(EPOCH FROM (handled_at - created_at))/60) INTO avg_response
    FROM data_entries 
    WHERE urgency_level >= urgency_min
        AND handled_at IS NOT NULL
        AND created_at >= NOW() - INTERVAL '1 hour' * time_range_hours;
    
    -- Count handled today
    SELECT COUNT(*) INTO handled_count
    FROM data_entries 
    WHERE urgency_level >= urgency_min
        AND status = 'handled'
        AND handled_at >= CURRENT_DATE;
    
    -- Count escalated today
    SELECT COUNT(*) INTO escalated_count
    FROM data_entries 
    WHERE urgency_level >= urgency_min
        AND status = 'escalated'
        AND escalated_at >= CURRENT_DATE;
    
    -- Get hourly trends for last 24 hours
    SELECT jsonb_object_agg(hour_label, count) INTO hourly_trends
    FROM (
        SELECT 
            TO_CHAR(date_trunc('hour', created_at), 'HH24:00') as hour_label,
            COUNT(*) as count
        FROM data_entries 
        WHERE urgency_level >= urgency_min
            AND created_at >= NOW() - INTERVAL '24 hours'
        GROUP BY date_trunc('hour', created_at)
        ORDER BY date_trunc('hour', created_at)
    ) hourly_counts;
    
    RETURN QUERY
    SELECT 
        total_count,
        COALESCE(category_stats, '{}'::jsonb),
        COALESCE(source_stats, '{}'::jsonb),
        COALESCE(status_stats, '{}'::jsonb),
        COALESCE(avg_response, 0.0),
        handled_count,
        escalated_count,
        COALESCE(hourly_trends, '{}'::jsonb);
END;
$;

-- Function to log urgent item action
CREATE OR REPLACE FUNCTION log_urgent_item_action(
    p_item_id UUID,
    p_action_type VARCHAR(20),
    p_user_id VARCHAR(255),
    p_assigned_to VARCHAR(255) DEFAULT NULL,
    p_department VARCHAR(100) DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID
SECURITY INVOKER
SET search_path = ''
LANGUAGE plpgsql
AS $
DECLARE
    action_id UUID;
    old_status VARCHAR(20);
    new_status VARCHAR(20);
BEGIN
    -- Get current status
    SELECT status INTO old_status FROM data_entries WHERE id = p_item_id;
    
    -- Determine new status based on action
    CASE p_action_type
        WHEN 'handled' THEN new_status := 'handled';
        WHEN 'escalated' THEN new_status := 'escalated';
        WHEN 'assigned' THEN new_status := 'assigned';
        ELSE new_status := old_status;
    END CASE;
    
    -- Insert action log
    INSERT INTO urgent_item_actions (
        item_id, action_type, user_id, assigned_to, department, 
        notes, previous_status, new_status
    ) VALUES (
        p_item_id, p_action_type, p_user_id, p_assigned_to, p_department,
        p_notes, old_status, new_status
    ) RETURNING id INTO action_id;
    
    -- Update data_entries based on action
    CASE p_action_type
        WHEN 'handled' THEN
            UPDATE data_entries 
            SET status = 'handled', handled_by = p_user_id, handled_at = NOW()
            WHERE id = p_item_id;
        WHEN 'escalated' THEN
            UPDATE data_entries 
            SET status = 'escalated', escalated_at = NOW(), escalation_reason = p_notes
            WHERE id = p_item_id;
        WHEN 'assigned' THEN
            UPDATE data_entries 
            SET status = 'assigned', assigned_to = p_assigned_to
            WHERE id = p_item_id;
    END CASE;
    
    RETURN action_id;
END;
$;

-- Grant execute permissions on new functions
GRANT EXECUTE ON FUNCTION get_urgent_items(int, text[], text[], int, text[], int, int) TO authenticated;
GRANT EXECUTE ON FUNCTION get_urgent_items_stats(int, int) TO authenticated;
GRANT EXECUTE ON FUNCTION log_urgent_item_action(UUID, VARCHAR, VARCHAR, VARCHAR, VARCHAR, TEXT) TO authenticated;

-- Grant read-only access to anon for stats
GRANT EXECUTE ON FUNCTION get_urgent_items_stats(int, int) TO anon;