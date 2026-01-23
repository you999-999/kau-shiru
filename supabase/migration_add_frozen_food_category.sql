-- 冷凍食品カテゴリをcategory_newに追加するマイグレーション

-- 1. 既存のCHECK制約を削除
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'posts_category_new_check'
    ) THEN
        ALTER TABLE posts DROP CONSTRAINT posts_category_new_check;
    END IF;
END $$;

-- 2. 新しいCHECK制約を追加（冷凍食品を含む）
ALTER TABLE posts 
ADD CONSTRAINT posts_category_new_check 
CHECK (category_new IS NULL OR category_new IN ('肉', '魚', '野菜', '冷凍食品', 'その他'));

-- 3. 既存の冷凍食品データを移行（item_category = '冷凍食品'の場合）
UPDATE posts 
SET category_new = '冷凍食品'
WHERE item_category = '冷凍食品' AND category_new IS NULL;

-- 完了メッセージ
DO $$ 
BEGIN
    RAISE NOTICE '冷凍食品カテゴリが正常に追加されました';
END $$;
