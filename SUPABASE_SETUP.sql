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
-- Thống kê CHUNG toàn lớp (mỗi học sinh 1 dòng, cộng dồn từ phiên của tất cả cán bộ)
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
  UNIQUE(student_name)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_stats_recorded_by 
  ON student_statistics(recorded_by);
CREATE INDEX IF NOT EXISTS idx_stats_updated_at 
  ON student_statistics(updated_at DESC);

-- ============================================
-- RLS (Row Level Security)
-- ============================================
-- App dùng anon key (không có Supabase Auth) nên phải TẮT RLS
-- hoặc thêm policy cho phép tất cả. Nếu đang bật RLS mà không có
-- policy, mọi INSERT/SELECT sẽ bị chặn (lỗi 42501 / dữ liệu trống).

ALTER TABLE attendance_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_statistics DISABLE ROW LEVEL SECURITY;

-- Đảm bảo client có quyền đọc/ghi
GRANT ALL ON attendance_records TO anon, authenticated;
GRANT ALL ON attendance_history TO anon, authenticated;
GRANT ALL ON student_statistics TO anon, authenticated;

-- ============================================
-- MIGRATION cho database đang chạy (quan trọng!)
-- ============================================
-- Nếu bạn đã tạo bảng theo phiên bản cũ (UNIQUE gồm cả recorded_by),
-- chạy đoạn sau trong SQL Editor để chuyển sang thống kê chung toàn lớp:
--
-- DELETE FROM student_statistics;
-- ALTER TABLE student_statistics
--   DROP CONSTRAINT IF EXISTS student_statistics_student_name_recorded_by_key;
-- ALTER TABLE student_statistics
--   ADD CONSTRAINT student_statistics_student_name_key UNIQUE (student_name);

-- ============================================
-- Summary
-- ============================================
-- Created 3 tables:
-- - attendance_records: Lưu chi tiết điểm danh (kèm tên người thực hiện: recorded_by)
-- - attendance_history: Lưu lịch sử phiên điểm danh
-- - student_statistics: Lưu thống kê CHUNG toàn lớp (1 dòng / học sinh)
--
-- All tables have proper indexes for performance
-- Ready for data insertion from the web app
