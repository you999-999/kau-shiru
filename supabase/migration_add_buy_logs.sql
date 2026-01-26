-- buy_logsテーブル作成（単品メモ・今日の買い物用）
-- 既存のpostsテーブルとは独立して動作します

CREATE TABLE IF NOT EXISTS buy_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_uuid UUID NOT NULL,
  log_type TEXT NOT NULL CHECK (log_type IN ('item', 'daily')),
  is_public BOOLEAN NOT NULL DEFAULT true,
  
  -- 単品メモ用（log_type = 'item'）
  category TEXT,
  price INTEGER CHECK (price IS NULL OR price >= 0),
  quantity_note TEXT,
  extra_flag BOOLEAN,
  comment TEXT,
  
  -- 今日の買い物用（log_type = 'daily'）
  total_price INTEGER CHECK (total_price IS NULL OR total_price >= 0),
  days_covered INTEGER CHECK (days_covered IS NULL OR days_covered > 0),
  extra_level TEXT CHECK (extra_level IS NULL OR extra_level IN ('yes', 'maybe', 'no')),
  daily_comment TEXT
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_buy_logs_created_at ON buy_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_buy_logs_user_uuid ON buy_logs(user_uuid);
CREATE INDEX IF NOT EXISTS idx_buy_logs_log_type ON buy_logs(log_type);
CREATE INDEX IF NOT EXISTS idx_buy_logs_is_public ON buy_logs(is_public) WHERE is_public = true;

-- Row Level Security (RLS) を有効化
ALTER TABLE buy_logs ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが公開ログを読み取り可能
CREATE POLICY "Anyone can read public buy_logs" ON buy_logs
  FOR SELECT
  USING (is_public = true);

-- 全ユーザーが投稿可能（自分のログのみ）
CREATE POLICY "Anyone can insert buy_logs" ON buy_logs
  FOR INSERT
  WITH CHECK (true);

-- ユーザーは自分のログを削除可能
CREATE POLICY "Users can delete own buy_logs" ON buy_logs
  FOR DELETE
  USING (true);

-- 完了メッセージ
DO $$ 
BEGIN
    RAISE NOTICE 'buy_logsテーブルが正常に作成されました';
END $$;
