-- Migration for Urgent Items Feature
-- Run this in Supabase SQL Editor to add urgent items functionality

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

-- Create urgent_item_actions table
CREATE TABLE IF NOT EXISTS urgent_item_actions (
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

-- Indexes for urgent items performance
CREATE INDEX IF NOT EXISTS idx_urgent_actions_item_id ON urgent_item_actions(item_id);
CREATE INDEX IF NOT EXISTS idx_urgent_actions_created_at ON urgent_item_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_urgent_actions_user_id ON urgent_item_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_urgent_actions_action_type ON urgent_item_actions(action_type);

-- Composite index for urgent items query optimization
CREATE INDEX IF NOT EXISTS idx_data_entries_urgency_status ON data_entries(urgency_level DESC, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_data_entries_assigned_to ON data_entries(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_data_entries_handled_by ON data_entries(handled_by) WHERE handled_by IS NOT NULL;

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

SELECT 'Urgent Items Migration Complete!' as status;