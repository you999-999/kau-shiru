# かうしる - 実装ガイド

## 📋 実装済み機能

### ✅ SEO対策
- [x] Open Graph タグ（Facebook、Twitter用）
- [x] Twitter Cards
- [x] 構造化データ（JSON-LD）
- [x] サイトマップ（`app/sitemap.ts`）
- [x] robots.txt

### ✅ ソーシャルシェア機能
- [x] Twitter/X シェアボタン
- [x] LINE シェアボタン
- [x] Facebook シェアボタン
- [x] ネイティブシェアAPI対応

### ✅ 広告配置基盤
- [x] Google AdSense コンポーネント
- [x] 広告配置箇所の設計

### ✅ アクセス解析基盤
- [x] Google Analytics 4 コンポーネント

---

## 🚀 次のステップ：設定が必要な項目

### 1. Google Analytics 4 の設定

#### 手順：
1. [Google Analytics](https://analytics.google.com/) でアカウントを作成
2. プロパティを作成し、測定ID（例：`G-XXXXXXXXXX`）を取得
3. `.env.local` に以下を追加：

```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

#### 確認方法：
- ブラウザの開発者ツールでネットワークタブを確認
- `gtag/js` へのリクエストが送信されているか確認

---

### 2. Google AdSense の設定

#### 手順：
1. [Google AdSense](https://www.google.com/adsense/) でアカウントを作成
2. サイトを登録し、承認を待つ（数日〜数週間）
3. 広告ユニットを作成し、広告スロットIDを取得
4. `.env.local` に以下を追加：

```env
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXX
NEXT_PUBLIC_ADSENSE_SLOT_HEADER=1234567890
NEXT_PUBLIC_ADSENSE_SLOT_CONTENT=0987654321
```

#### 広告配置箇所：
- **ヘッダー下**: ページ上部、買い物リストの上
- **コンテンツ間**: みんなの予報の下、ソーシャルシェアの上

#### 注意事項：
- 広告が承認されるまでは、プレースホルダーが表示されます
- クリック誘導や誤解を招く配置は避けてください
- モバイルでの表示を最適化してください

---

### 3. OGP画像の作成

#### 要件：
- サイズ: 1200px × 630px
- 形式: PNG または JPG
- ファイル名: `og-image.png`
- 配置場所: `public/og-image.png`

#### 推奨内容：
- アプリ名「かうしる」
- キャッチコピー「買い物にお得感と楽しさを！」
- 猫のイラスト（既存の `kausiru.png` を活用）
- エメラルドグリーンとオフホワイトの配色

#### 作成ツール：
- Canva（無料テンプレートあり）
- Figma
- Adobe Express

---

### 4. 本番URLの設定

以下のファイルで本番URLを設定してください：

#### `app/layout.tsx`
```typescript
url: 'https://kau-shiru.vercel.app', // ← 実際のURLに変更
```

#### `app/sitemap.ts`
```typescript
const baseUrl = 'https://kau-shiru.vercel.app' // ← 実際のURLに変更
```

#### `public/robots.txt`
```
Sitemap: https://kau-shiru.vercel.app/sitemap.xml  # ← 実際のURLに変更
```

---

## 📊 トラッキング設定（Google Analytics）

### 推奨イベント設定

以下のイベントをトラッキングすることを推奨します：

```typescript
// 投稿完了時
gtag('event', 'post_created', {
  event_category: 'engagement',
  event_label: selectedCategory,
  value: priceValue
})

// リアクション時
gtag('event', 'reaction_clicked', {
  event_category: 'engagement',
  event_label: 'natto'
})

// シェア時
gtag('event', 'share', {
  method: 'twitter', // または 'line', 'facebook'
  content_type: 'page'
})
```

実装例は `app/page.tsx` の `handleSubmit` 関数内に追加してください。

---

## 🎯 広告収益化のベストプラクティス

### 広告配置の原則
1. **ユーザー体験を優先**: 広告はコンテンツの邪魔をしない
2. **適切な間隔**: 広告間は最低300px以上空ける
3. **モバイル最適化**: スマホでの表示を最優先
4. **読み込み速度**: 広告の読み込みが遅くならないよう注意

### 収益化の段階的アプローチ
1. **Phase 1**: ヘッダー下のみ（ユーザー体験への影響を最小化）
2. **Phase 2**: コンテンツ間を追加（ユーザーが慣れてから）
3. **Phase 3**: サイドバー（PC表示時のみ）

---

## 🔍 SEO最適化の確認

### Google Search Console の設定
1. [Google Search Console](https://search.google.com/search-console) でサイトを登録
2. サイトマップを送信: `https://your-domain.com/sitemap.xml`
3. モバイルフレンドリーテストを実行

### 確認項目
- [ ] モバイルフレンドリー: ✅
- [ ] ページ速度: Core Web Vitals を確認
- [ ] 構造化データ: [Rich Results Test](https://search.google.com/test/rich-results) で確認
- [ ] OGP画像: [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) で確認

---

## 📈 次の実装候補（優先度順）

### 高優先度
1. **トレンドページ** (`/trends`)
   - カテゴリ別の価格推移グラフ
   - 週間/月間の統計

2. **ランキングページ** (`/ranking`)
   - お買い得度ランキング
   - 人気カテゴリランキング

3. **使い方ガイド** (`/howto`)
   - 初回ユーザー向けの説明
   - スクリーンショット付き

### 中優先度
4. **プッシュ通知**（PWA）
5. **バッジ・実績システム**
6. **週間サマリー機能**

---

## 🛠️ トラブルシューティング

### Google Analytics が動作しない
- `NEXT_PUBLIC_GA_ID` が正しく設定されているか確認
- ブラウザの広告ブロッカーを無効化してテスト
- ネットワークタブで `gtag` へのリクエストを確認

### AdSense が表示されない
- サイトが承認されているか確認（数日かかる場合あり）
- 広告スロットIDが正しく設定されているか確認
- 開発環境では表示されない場合がある（本番環境で確認）

### OGP画像が表示されない
- 画像のサイズが 1200×630px か確認
- `public/og-image.png` に配置されているか確認
- Facebook Sharing Debugger でキャッシュをクリア

---

## 📞 サポート

実装に関する質問は、GitHubのIssuesまたはメール（ichigoichie.contact.0015@gmail.com）までお問い合わせください。
