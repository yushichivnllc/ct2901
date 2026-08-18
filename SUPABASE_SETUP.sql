-- ============================================
-- CT2901 Attendance System - Database Setup
-- ============================================
-- Run these SQL queries in Supabase SQL Editor
-- to create the required tables

-- 1. Attendance Records Table
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_name TEXT NOT NULL,
  recorded_by TEXT NOT NULL,
  recorded_at TIMESTAMP NOT NULL,
  records JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_attendance_recorded_by 
  ON attendance_records(recorded_by);
CREATE INDEX IF NOT EXISTS idx_attendance_created_at 
  ON attendance_records(created_at DESC);

-- 2. Attendance History Table
CREATE TABLE IF NOT EXISTS attendance_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  session_name TEXT NOT NULL,
  recorded_by TEXT NOT NULL,
  recorded_at TIMESTAMP NOT NULL,
  total_students INT NOT NULL,
  present_count INT NOT NULL,
  absent_excused_count INT NOT NULL,
  absent_unexcused_count INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_history_recorded_by 
  ON attendance_history(recorded_by);
CREATE INDEX IF NOT EXISTS idx_history_recorded_at 
  ON attendance_history(recorded_at DESC);

-- 3. Student Statistics Table
CREATE TABLE IF NOT EXISTS student_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name TEXT NOT NULL,
  total_sessions INT DEFAULT 0,
  present_count INT DEFAULT 0,
  absent_excused_count INT DEFAULT 0,
  absent_unexcused_count INT DEFAULT 0,
  attendance_rate FLOAT DEFAULT 0,
  recorded_by TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  UNIQUE(student_name, recorded_by)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_stats_recorded_by 
  ON student_statistics(recorded_by);
CREATE INDEX IF NOT EXISTS idx_stats_updated_at 
  ON student_statistics(updated_at DESC);

-- ============================================
-- Enable RLS (Row Level Security) if needed
-- ============================================
-- Uncomment below if you want to restrict data access

-- ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE attendance_history ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE student_statistics ENABLE ROW LEVEL SECURITY;

-- Example RLS Policy (allow users to see only their own data):
-- CREATE POLICY "Users can only see their own data" ON attendance_records
--   FOR SELECT USING (recorded_by = auth.jwt()->>'email' OR auth.jwt()->>'email' IS NULL);

-- ============================================
-- Summary
-- ============================================
-- Created 3 tables:
-- - attendance_records: Lưu chi tiết điểm danh
-- - attendance_history: Lưu lịch sử phiên điểm danh
-- - student_statistics: Lưu thống kê học sinh
--
-- All tables have proper indexes for performance
-- Ready for data insertion from the web app
