-- Sapa Trenggalek Database Schema
-- Jalankan script ini di Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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