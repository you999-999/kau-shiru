# かうしる - 愛知西部の物価予報

物価・サイズ・感情を記録し、エリア全体の物価予報を作るWebアプリ。

## 技術スタック

- Next.js 15 (App Router, Server Actions)
- Tailwind CSS v4
- Supabase (PostgreSQL, Auth, SSR)
- Lucide React (Icons)
- TypeScript

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabaseプロジェクトの設定

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. SQL Editorで `supabase/schema.sql` の内容を実行してテーブルを作成
3. プロジェクトのSettings > APIから以下を取得：
   - Project URL
   - anon/public key

### 3. 環境変数の設定

プロジェクトルートに `.env.local` ファイルを作成：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## データベーススキーマ

`supabase/schema.sql` をSupabaseのSQL Editorで実行してください。

テーブル構造：
- `id`: UUID (主キー)
- `created_at`: タイムスタンプ
- `item_category`: カテゴリ（卵、牛乳、肉、野菜、その他）
- `price`: 価格（整数）
- `is_tax_included`: 税込かどうか
- `size_status`: サイズ状態（normal, less, tiny）
- `sentiment_level`: 感情レベル（1-5）
- `area_group`: エリアグループ（デフォルト: 愛知西部）
- `user_uuid`: ユーザーUUID（localStorage管理）

## 機能

- カテゴリ別の価格記録
- 税込/税別の自動計算表示
- サイズ状態の記録
- 感情レベルの記録（5段階）
- 匿名での投稿（localStorageでUUID管理）
- リアルタイム予報表示（最新3件）

## プライバシー

- 個人や店舗が特定されないよう、匿名性を最優先
- ユーザーUUIDはlocalStorageで管理
- エリアは「愛知西部」として抽象化
