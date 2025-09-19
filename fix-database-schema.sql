-- Fix MediVerse AI Database Schema Issues

-- 1. Add missing columns to diagnostic_reports table
ALTER TABLE diagnostic_reports 
ADD COLUMN IF NOT EXISTS ai_summary TEXT,
ADD COLUMN IF NOT EXISTS explanation TEXT,
ADD COLUMN IF NOT EXISTS original_text TEXT;

-- 2. Ensure key_findings and follow_ups are JSONB arrays (not TEXT)
ALTER TABLE diagnostic_reports 
ALTER COLUMN key_findings TYPE JSONB USING key_findings::JSONB,
ALTER COLUMN follow_ups TYPE JSONB USING follow_ups::JSONB;

-- 3. Update risk_level to include all possible values
ALTER TABLE diagnostic_reports 
DROP CONSTRAINT IF EXISTS diagnostic_reports_risk_level_check;

ALTER TABLE diagnostic_reports 
ADD CONSTRAINT diagnostic_reports_risk_level_check 
CHECK (risk_level IN ('low', 'medium', 'high', 'critical'));

-- 4. Ensure processing_status has all needed values
ALTER TABLE diagnostic_reports 
DROP CONSTRAINT IF EXISTS diagnostic_reports_processing_status_check;

ALTER TABLE diagnostic_reports 
ADD CONSTRAINT diagnostic_reports_processing_status_check 
CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed'));

-- 5. Create medical-files storage bucket (run this in Supabase Dashboard -> Storage)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('medical-files', 'medical-files', false);

-- 6. Set up RLS policies for the medical-files bucket
-- CREATE POLICY "Users can upload their own medical files" ON storage.objects
-- FOR INSERT WITH CHECK (bucket_id = 'medical-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can view their own medical files" ON storage.objects
-- FOR SELECT USING (bucket_id = 'medical-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 7. Ensure diagnostic_reports table has proper RLS
ALTER TABLE diagnostic_reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own reports" ON diagnostic_reports;
DROP POLICY IF EXISTS "Users can insert their own reports" ON diagnostic_reports;
DROP POLICY IF EXISTS "Users can update their own reports" ON diagnostic_reports;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view their own reports" ON diagnostic_reports
FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Users can insert their own reports" ON diagnostic_reports
FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Users can update their own reports" ON diagnostic_reports
FOR UPDATE USING (auth.uid() = patient_id);

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_diagnostic_reports_patient_id ON diagnostic_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_reports_created_at ON diagnostic_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_diagnostic_reports_processing_status ON diagnostic_reports(processing_status);

-- 9. Sample data for testing (optional)
-- INSERT INTO diagnostic_reports (
--   patient_id, 
--   file_type, 
--   file_name, 
--   processing_status, 
--   ai_summary,
--   key_findings,
--   follow_ups,
--   risk_level,
--   explanation,
--   original_text
-- ) VALUES (
--   auth.uid(),
--   'text',
--   'Sample Symptom Analysis',
--   'completed',
--   'Patient reported chest pain and shortness of breath',
--   '["Chest pain symptoms", "Respiratory concerns", "Requires medical evaluation"]'::jsonb,
--   '["Schedule cardiology consultation", "Monitor symptoms", "Seek immediate care if symptoms worsen"]'::jsonb,
--   'medium',
--   'Based on the reported symptoms of chest pain and shortness of breath, this requires prompt medical evaluation to rule out cardiac or respiratory conditions.',
--   'I have been experiencing chest pain for the past 2 days, especially when I breathe deeply.'
-- );

-- 10. Verify the schema
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'diagnostic_reports' 
ORDER BY ordinal_position;
