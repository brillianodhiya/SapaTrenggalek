-- Add Vector Embedding Support to Sapa Trenggalek
-- Run this after the main schema.sql

-- Enable vector extension (pgvector)
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to data_entries
ALTER TABLE data_entries 
ADD COLUMN content_embedding vector(768); -- Google Gemini embeddings are 768 dimensions

-- Add vector similarity index
CREATE INDEX idx_data_entries_embedding ON data_entries 
USING ivfflat (content_embedding vector_cosine_ops) WITH (lists = 100);

-- Create function for similarity search
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
) AS $$
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
$$ LANGUAGE plpgsql;

-- Create function for hoax detection based on similarity
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
) AS $$
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
$$ LANGUAGE plpgsql;

-- Create function for content deduplication
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
) AS $$
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
$$ LANGUAGE plpgsql;

-- Add indexes for better performance
CREATE INDEX idx_data_entries_hoax_embedding ON data_entries(hoax_probability, content_embedding) 
WHERE hoax_probability > 50;

-- Update the trigger to handle embedding updates
CREATE OR REPLACE FUNCTION update_content_embedding_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Mark that embedding needs to be updated when content changes
    IF OLD.content IS DISTINCT FROM NEW.content THEN
        NEW.content_embedding = NULL; -- Will be updated by background job
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_embedding_on_content_change
    BEFORE UPDATE ON data_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_content_embedding_trigger();

-- Add system setting for embedding model
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('embedding_model', 'text-embedding-004', 'Google Gemini embedding model'),
('similarity_threshold_search', '0.8', 'Threshold untuk similarity search'),
('similarity_threshold_hoax', '0.9', 'Threshold untuk hoax detection'),
('similarity_threshold_duplicate', '0.95', 'Threshold untuk duplicate detection')
ON CONFLICT (setting_key) DO NOTHING;

-- Create view for embedding statistics
CREATE OR REPLACE VIEW embedding_stats AS
SELECT 
    COUNT(*) as total_entries,
    COUNT(content_embedding) as entries_with_embeddings,
    COUNT(*) - COUNT(content_embedding) as entries_without_embeddings,
    CASE 
        WHEN COUNT(*) = 0 THEN 0
        ELSE ROUND(((COUNT(content_embedding)::numeric / COUNT(*)::numeric) * 100), 2)
    END as completion_percentage
FROM data_entries;

-- Create function to get similar entries for a given entry ID
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
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        de2.id,
        de2.content,
        de2.source,
        de2.category,
        1 - (de1.content_embedding <=> de2.content_embedding) as similarity_score
    FROM data_entries de1
    CROSS JOIN data_entries de2
    WHERE de1.id = entry_id
        AND de2.id != entry_id
        AND de1.content_embedding IS NOT NULL
        AND de2.content_embedding IS NOT NULL
        AND 1 - (de1.content_embedding <=> de2.content_embedding) >= similarity_threshold
    ORDER BY de1.content_embedding <=> de2.content_embedding
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Create function for batch embedding update status
CREATE OR REPLACE FUNCTION get_embedding_batch_info(batch_size int DEFAULT 50)
RETURNS TABLE(
    total_without_embeddings int,
    batch_count int,
    estimated_time_minutes int
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::int as total_without_embeddings,
        CEIL(COUNT(*)::float / batch_size::float)::int as batch_count,
        CEIL((COUNT(*)::float * 0.2) / 60)::int as estimated_time_minutes
    FROM data_entries 
    WHERE content_embedding IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON COLUMN data_entries.content_embedding IS 'Vector embedding (768 dimensions) generated by Google Gemini text-embedding-004';
COMMENT ON FUNCTION find_similar_content IS 'Find similar content using vector cosine similarity';
COMMENT ON FUNCTION detect_potential_hoax IS 'Detect potential hoax content based on similarity to known hoax entries';
COMMENT ON FUNCTION find_duplicate_content IS 'Find duplicate content using high similarity threshold';
COMMENT ON VIEW embedding_stats IS 'Statistics about embedding coverage in the database';