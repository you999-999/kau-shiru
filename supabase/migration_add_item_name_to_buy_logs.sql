-- buy_logsテーブルにitem_nameカラムを追加
ALTER TABLE buy_logs 
ADD COLUMN IF NOT EXISTS item_name TEXT;

-- インデックス作成（検索パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_buy_logs_item_name ON buy_logs(item_name) WHERE item_name IS NOT NULL;

-- 完了メッセージ
DO $$ 
BEGIN
    RAISE NOTICE 'buy_logsテーブルにitem_nameカラムが正常に追加されました';
END $$;
