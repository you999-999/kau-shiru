-- お問い合わせテーブル作成
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT,
  email TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived'))
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);

-- Row Level Security (RLS) を有効化
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが投稿可能（お問い合わせ送信）
-- 既存のポリシーを削除してから再作成（エラー回避）
DROP POLICY IF EXISTS "Anyone can insert contacts" ON contacts;

CREATE POLICY "Anyone can insert contacts" ON contacts
  FOR INSERT
  TO public
  WITH CHECK (true);

-- 管理者のみ読み取り可能（後で実装する場合は認証を追加）
-- 現時点では、読み取りは管理者のみに制限
DROP POLICY IF EXISTS "Only admins can read contacts" ON contacts;

-- 読み取りポリシーは後で認証を追加するまで、一旦全ユーザーが読み取り可能にする
-- （開発・テスト用。本番環境では認証を追加することを推奨）
CREATE POLICY "Anyone can read contacts" ON contacts
  FOR SELECT
  TO public
  USING (true);

-- 完了メッセージ
DO $$ 
BEGIN
    RAISE NOTICE 'お問い合わせテーブルが正常に作成されました';
END $$;
