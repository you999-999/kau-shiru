-- 冷凍食品カテゴリを追加するマイグレーション
-- 既存のデータベースがある場合に安全に実行できます

-- 1. 既存のCHECK制約を削除（PostgreSQL 9.5以降は IF EXISTS が使えます）
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_item_category_check;

-- 2. 新しいCHECK制約を追加（冷凍食品を含む）
ALTER TABLE posts 
ADD CONSTRAINT posts_item_category_check 
CHECK (item_category IN ('卵', '牛乳', '肉', '野菜', '冷凍食品', 'その他'));

-- 完了メッセージ（オプション）
DO $$ 
BEGIN
    RAISE NOTICE '冷凍食品カテゴリが正常に追加されました';
END $$;
