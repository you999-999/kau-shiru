-- 今日のひとことテーブル作成
CREATE TABLE IF NOT EXISTS daily_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成（クエリパフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_daily_quotes_created_at ON daily_quotes(created_at DESC);

-- Row Level Security (RLS) を有効化
ALTER TABLE daily_quotes ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが読み取り可能
CREATE POLICY "Anyone can read daily_quotes" ON daily_quotes
  FOR SELECT
  USING (true);

-- 全ユーザーが投稿可能（将来的に管理画面から投稿する場合を想定）
CREATE POLICY "Anyone can insert daily_quotes" ON daily_quotes
  FOR INSERT
  WITH CHECK (true);
