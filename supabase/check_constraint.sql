-- データベース構造の確認用SQL
-- マイグレーションが正しく適用されたか確認します

-- 1. postsテーブルのCHECK制約を確認
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'posts'::regclass
AND conname LIKE '%item_category%';

-- 2. postsテーブルの構造を確認
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'posts'
ORDER BY ordinal_position;

-- 3. 実際に冷凍食品カテゴリが許可されているかテスト（エラーが出なければOK）
-- 注意: これは実際にデータを挿入しません（ROLLBACKで取り消します）
BEGIN;
INSERT INTO posts (
    item_category, 
    price, 
    is_tax_included, 
    size_status, 
    sentiment_level, 
    area_group, 
    user_uuid
) VALUES (
    '冷凍食品',  -- これがエラーにならなければOK
    100,
    true,
    'normal',
    3,
    '愛知西部',
    gen_random_uuid()
);
ROLLBACK; -- テストデータを削除

-- 4. 現在のカテゴリ別の投稿数を確認（既存データがある場合）
SELECT 
    item_category,
    COUNT(*) as count
FROM posts
GROUP BY item_category
ORDER BY item_category;
