-- かうしる posts テーブル作成
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  item_category TEXT NOT NULL CHECK (item_category IN ('卵', '牛乳', '肉', '野菜', '冷凍食品', 'その他')),
  price INTEGER NOT NULL CHECK (price > 0),
  is_tax_included BOOLEAN NOT NULL DEFAULT true,
  size_status TEXT NOT NULL CHECK (size_status IN ('normal', 'less', 'tiny')),
  sentiment_level INTEGER NOT NULL CHECK (sentiment_level >= 1 AND sentiment_level <= 5),
  area_group TEXT NOT NULL DEFAULT '愛知西部',
  user_uuid UUID NOT NULL,
  comment TEXT CHECK (LENGTH(comment) <= 20)
);

-- インデックス作成（クエリパフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_area_group ON posts(area_group);
CREATE INDEX IF NOT EXISTS idx_posts_item_category ON posts(item_category);

-- Row Level Security (RLS) を有効化
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが読み取り可能
CREATE POLICY "Anyone can read posts" ON posts
  FOR SELECT
  USING (true);

-- 全ユーザーが投稿可能
CREATE POLICY "Anyone can insert posts" ON posts
  FOR INSERT
  WITH CHECK (true);

-- リアクション（いいね）テーブル
CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_uuid UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_uuid)
);

-- リアクションのインデックス
CREATE INDEX IF NOT EXISTS idx_reactions_post_id ON reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_uuid ON reactions(user_uuid);

-- リアクションのRLS
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- 全ユーザーがリアクションを読み取り可能
CREATE POLICY "Anyone can read reactions" ON reactions
  FOR SELECT
  USING (true);

-- 全ユーザーがリアクションを追加可能
CREATE POLICY "Anyone can insert reactions" ON reactions
  FOR INSERT
  WITH CHECK (true);

-- 全ユーザーが自分のリアクションを削除可能
CREATE POLICY "Anyone can delete own reactions" ON reactions
  FOR DELETE
  USING (true);
