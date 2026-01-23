-- contactsテーブルのRLSポリシーを修正
-- このマイグレーションは、既存のcontactsテーブルがある場合に実行してください

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Anyone can insert contacts" ON contacts;
DROP POLICY IF EXISTS "Only admins can read contacts" ON contacts;
DROP POLICY IF EXISTS "Anyone can read contacts" ON contacts;

-- INSERTポリシーを再作成（全ユーザーが投稿可能）
CREATE POLICY "Anyone can insert contacts" ON contacts
  FOR INSERT
  TO public
  WITH CHECK (true);

-- SELECTポリシーを再作成（全ユーザーが読み取り可能 - 開発用）
-- 本番環境では、認証を追加して管理者のみに制限することを推奨
CREATE POLICY "Anyone can read contacts" ON contacts
  FOR SELECT
  TO public
  USING (true);

-- 完了メッセージ
DO $$ 
BEGIN
    RAISE NOTICE 'contactsテーブルのRLSポリシーが正常に修正されました';
END $$;
