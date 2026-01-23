-- 地域カラムを追加するマイグレーション
-- 既存のデータベースがある場合に安全に実行できます

-- 1. 地域カラムを追加
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS region_big TEXT,
ADD COLUMN IF NOT EXISTS region_pref TEXT,
ADD COLUMN IF NOT EXISTS region_city TEXT;

-- 2. 既存データの移行（area_groupから推測）
-- 愛知西部 → 中部 / 愛知県 / 名古屋市（デフォルト）
UPDATE posts 
SET 
  region_big = '中部',
  region_pref = '愛知県',
  region_city = '名古屋市'
WHERE region_big IS NULL AND area_group LIKE '%愛知%';

-- その他の既存データは地域のみ設定
UPDATE posts 
SET region_big = '中部'
WHERE region_big IS NULL;

-- 3. インデックス作成（クエリパフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_posts_region_big ON posts(region_big);
CREATE INDEX IF NOT EXISTS idx_posts_region_pref ON posts(region_pref);
CREATE INDEX IF NOT EXISTS idx_posts_region_city ON posts(region_city);

-- 完了メッセージ
DO $$ 
BEGIN
    RAISE NOTICE '地域カラムが正常に追加されました';
END $$;
