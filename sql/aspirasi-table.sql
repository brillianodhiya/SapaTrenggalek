-- Create aspirasi table
CREATE TABLE IF NOT EXISTS aspirasi (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    kecamatan VARCHAR(100),
    category VARCHAR(100),
    content TEXT NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    status VARCHAR(50) DEFAULT 'pending',
    admin_response TEXT,
    admin_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_aspirasi_status ON aspirasi(status);
CREATE INDEX IF NOT EXISTS idx_aspirasi_kecamatan ON aspirasi(kecamatan);
CREATE INDEX IF NOT EXISTS idx_aspirasi_category ON aspirasi(category);
CREATE INDEX IF NOT EXISTS idx_aspirasi_created_at ON aspirasi(created_at);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_aspirasi_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_aspirasi_updated_at
    BEFORE UPDATE ON aspirasi
    FOR EACH ROW
    EXECUTE FUNCTION update_aspirasi_updated_at();