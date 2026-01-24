-- daily_quotesテーブルに地域情報カラムを追加
ALTER TABLE daily_quotes 
ADD COLUMN IF NOT EXISTS region_big TEXT,
ADD COLUMN IF NOT EXISTS region_pref TEXT,
ADD COLUMN IF NOT EXISTS region_city TEXT;

-- インデックス作成（クエリパフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_daily_quotes_region_big ON daily_quotes(region_big) WHERE region_big IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_daily_quotes_region_pref ON daily_quotes(region_pref) WHERE region_pref IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_daily_quotes_region_city ON daily_quotes(region_city) WHERE region_city IS NOT NULL;

-- 完了メッセージ
DO $$ 
BEGIN
  RAISE NOTICE 'daily_quotesテーブルに地域情報カラムが正常に追加されました';
END $$;
