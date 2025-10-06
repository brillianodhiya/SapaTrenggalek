-- Add image column to data_entries table
ALTER TABLE data_entries 
ADD COLUMN image_url TEXT,
ADD COLUMN image_alt TEXT,
ADD COLUMN image_caption TEXT;

-- Create index for better performance when filtering by image availability
CREATE INDEX IF NOT EXISTS idx_data_entries_image_url ON data_entries(image_url) WHERE image_url IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN data_entries.image_url IS 'URL of the main image associated with the news entry';
COMMENT ON COLUMN data_entries.image_alt IS 'Alt text for the image for accessibility';
COMMENT ON COLUMN data_entries.image_caption IS 'Caption or description of the image';