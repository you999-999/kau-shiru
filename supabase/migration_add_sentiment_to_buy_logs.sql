-- buy_logsテーブルにsentimentカラムを追加（感情レベル：1-5）
ALTER TABLE buy_logs 
ADD COLUMN IF NOT EXISTS sentiment INTEGER CHECK (sentiment IS NULL OR (sentiment >= 1 AND sentiment <= 5));

-- インデックス作成（検索パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_buy_logs_sentiment ON buy_logs(sentiment) WHERE sentiment IS NOT NULL;

-- 完了メッセージ
DO $$ 
BEGIN
    RAISE NOTICE 'buy_logsテーブルにsentimentカラムが正常に追加されました';
END $$;
