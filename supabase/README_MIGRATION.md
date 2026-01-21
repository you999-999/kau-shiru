# データベースマイグレーションガイド

## 冷凍食品カテゴリの追加

### 方法1: 新規データベースの場合（推奨）

既存のデータがない場合、`schema.sql`をそのまま実行できます：

1. Supabase Dashboard にログイン
2. SQL Editor を開く
3. `supabase/schema.sql` の内容を全てコピー＆ペースト
4. 「Run」ボタンをクリック

### 方法2: 既存データベースがある場合（安全な方法）

既存のデータがある場合、以下の手順で安全に更新してください：

#### ステップ1: マイグレーションSQLを実行

1. Supabase Dashboard にログイン
2. SQL Editor を開く
3. `supabase/migration_add_frozen_food.sql` の内容をコピー＆ペースト
4. 「Run」ボタンをクリック

これで、既存のデータを失うことなく、CHECK制約が更新されます。

#### ステップ2: 確認

以下のSQLで、新しいカテゴリが認識されているか確認できます：

```sql
-- 現在のCHECK制約を確認
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'posts'::regclass
AND conname LIKE '%item_category%';
```

### トラブルシューティング

#### エラー: "constraint does not exist"
- これは正常です。マイグレーションSQLは`IF EXISTS`を使っているので、エラーを無視して続行されます。

#### エラー: "constraint already exists"
- 既に新しいCHECK制約が存在している可能性があります。
- 上記の確認SQLで現在の制約を確認してください。

### 注意事項

- **既存のデータは削除されません**
- マイグレーションは安全に何度でも実行できます（冪等性）
- 本番環境で実行する前に、**必ずバックアップを取ってください**
