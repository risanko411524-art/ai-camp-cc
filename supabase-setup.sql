-- ============================================
-- バナナグループビジネス加速アプリ DB setup
-- Run this in Supabase SQL Editor
-- ============================================

-- 受講生テーブル
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  business_stage TEXT,
  missing_element TEXT,
  current_challenge TEXT,
  ideal_future TEXT,
  monthly_goals TEXT,
  main_task TEXT,
  other_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 日次活動記録テーブル
CREATE TABLE IF NOT EXISTS daily_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  grucon BOOLEAN DEFAULT FALSE,
  core_live BOOLEAN DEFAULT FALSE,
  seminar BOOLEAN DEFAULT FALSE,
  content_watch BOOLEAN DEFAULT FALSE,
  sns_reel BOOLEAN DEFAULT FALSE,
  sns_threads BOOLEAN DEFAULT FALSE,
  sns_stories BOOLEAN DEFAULT FALSE,
  sns_live BOOLEAN DEFAULT FALSE,
  sales_offer BOOLEAN DEFAULT FALSE,
  description TEXT,
  ai_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_daily_logs_student_id ON daily_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(date);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
