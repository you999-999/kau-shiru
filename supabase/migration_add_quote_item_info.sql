-- daily_quotesテーブルに商品情報カラムを追加するマイグレーション
-- 既存のデータベースがある場合に安全に実行できます

-- 商品情報カラムを追加
ALTER TABLE daily_quotes 
ADD COLUMN IF NOT EXISTS item_name TEXT,
ADD COLUMN IF NOT EXISTS price INTEGER,
ADD COLUMN IF NOT EXISTS quantity INTEGER,
ADD COLUMN IF NOT EXISTS unit TEXT;

-- 完了メッセージ
DO $$ 
BEGIN
    RAISE NOTICE 'daily_quotesテーブルに商品情報カラムが正常に追加されました';
END $$;
