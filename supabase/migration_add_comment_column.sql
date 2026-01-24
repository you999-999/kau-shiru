-- postsテーブルにcommentカラムを追加するマイグレーション
-- 既存のデータベースがある場合に安全に実行できます

-- commentカラムを追加（最大20文字、NULL許可）
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS comment TEXT CHECK (LENGTH(comment) <= 20);

-- 完了メッセージ
DO $$ 
BEGIN
    RAISE NOTICE 'commentカラムが正常に追加されました';
END $$;
