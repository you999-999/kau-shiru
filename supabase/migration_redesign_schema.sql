-- かうしる リデザイン用マイグレーション
-- 既存のデータベースがある場合に安全に実行できます

-- 1. 新しいカラムを追加
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS item_name TEXT,
ADD COLUMN IF NOT EXISTS quantity INTEGER,
ADD COLUMN IF NOT EXISTS unit TEXT,
ADD COLUMN IF NOT EXISTS category_new TEXT;

-- 2. CHECK制約を追加（カラムが存在する場合のみ）
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'posts_category_new_check'
    ) THEN
        ALTER TABLE posts 
        ADD CONSTRAINT posts_category_new_check 
        CHECK (category_new IS NULL OR category_new IN ('肉', '魚', '野菜', 'その他'));
    END IF;
END $$;

-- 3. 既存データの移行（item_categoryからcategory_newへ）
-- 卵 → その他
-- 牛乳 → その他
-- 肉 → 肉
-- 野菜 → 野菜
-- 冷凍食品 → その他
-- その他 → その他
UPDATE posts 
SET category_new = CASE
  WHEN item_category = '肉' THEN '肉'
  WHEN item_category = '野菜' THEN '野菜'
  ELSE 'その他'
END
WHERE category_new IS NULL;

-- 4. 既存のitem_categoryカラムは後方互換性のため残す
-- （将来的に削除可能）

-- 5. インデックス作成
CREATE INDEX IF NOT EXISTS idx_posts_item_name ON posts(item_name) WHERE item_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_category_new ON posts(category_new) WHERE category_new IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_unit ON posts(unit) WHERE unit IS NOT NULL;

-- 完了メッセージ
DO $$ 
BEGIN
    RAISE NOTICE 'リデザイン用スキーマが正常に追加されました';
END $$;
