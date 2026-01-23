// 参考相場データ（仮想データ）
// データがない状態で表示するための参考価格

export interface ReferencePrice {
  item_name: string
  category: '肉' | '魚' | '野菜' | 'その他'
  emoji: string
  unit: string | null
  min_price: number
  max_price: number
  note: string
}

export const REFERENCE_PRICES: ReferencePrice[] = [
  // 野菜
  { item_name: 'キャベツ', category: '野菜', emoji: '🥬', unit: '個', min_price: 98, max_price: 198, note: '全国平均（参考）' },
  { item_name: '玉ねぎ', category: '野菜', emoji: '🧅', unit: '個', min_price: 50, max_price: 150, note: '全国平均（参考）' },
  { item_name: 'にんじん', category: '野菜', emoji: '🥕', unit: '個', min_price: 80, max_price: 180, note: '全国平均（参考）' },
  { item_name: 'トマト', category: '野菜', emoji: '🍅', unit: '個', min_price: 100, max_price: 300, note: '全国平均（参考）' },
  { item_name: 'きゅうり', category: '野菜', emoji: '🥒', unit: '個', min_price: 50, max_price: 150, note: '全国平均（参考）' },
  { item_name: 'レタス', category: '野菜', emoji: '🥬', unit: '個', min_price: 100, max_price: 250, note: '全国平均（参考）' },
  { item_name: '白菜', category: '野菜', emoji: '🥬', unit: '個', min_price: 150, max_price: 400, note: '全国平均（参考）' },
  { item_name: 'じゃがいも', category: '野菜', emoji: '🥔', unit: '個', min_price: 30, max_price: 100, note: '全国平均（参考）' },
  
  // 肉
  { item_name: '鶏もも', category: '肉', emoji: '🍗', unit: '100g', min_price: 80, max_price: 150, note: '全国平均（参考）' },
  { item_name: '鶏むね', category: '肉', emoji: '🍗', unit: '100g', min_price: 60, max_price: 120, note: '全国平均（参考）' },
  { item_name: '豚こま', category: '肉', emoji: '🥩', unit: '100g', min_price: 100, max_price: 200, note: '全国平均（参考）' },
  { item_name: '豚バラ', category: '肉', emoji: '🥩', unit: '100g', min_price: 120, max_price: 250, note: '全国平均（参考）' },
  { item_name: '牛こま', category: '肉', emoji: '🥩', unit: '100g', min_price: 200, max_price: 400, note: '全国平均（参考）' },
  { item_name: '合い挽き肉', category: '肉', emoji: '🥩', unit: '100g', min_price: 150, max_price: 300, note: '全国平均（参考）' },
  
  // 魚
  { item_name: '鮭', category: '魚', emoji: '🐟', unit: '1切れ', min_price: 150, max_price: 400, note: '全国平均（参考）' },
  { item_name: 'さんま', category: '魚', emoji: '🐟', unit: '1尾', min_price: 80, max_price: 200, note: '全国平均（参考）' },
  { item_name: 'いわし', category: '魚', emoji: '🐟', unit: '1尾', min_price: 50, max_price: 150, note: '全国平均（参考）' },
  { item_name: 'さば', category: '魚', emoji: '🐟', unit: '1切れ', min_price: 100, max_price: 300, note: '全国平均（参考）' },
  { item_name: 'まぐろ', category: '魚', emoji: '🐟', unit: '100g', min_price: 200, max_price: 500, note: '全国平均（参考）' },
  
  // その他
  { item_name: '食パン', category: 'その他', emoji: '🍞', unit: '1斤', min_price: 100, max_price: 300, note: '全国平均（参考）' },
  { item_name: '卵', category: 'その他', emoji: '🥚', unit: '1パック', min_price: 150, max_price: 300, note: '全国平均（参考）' },
  { item_name: '牛乳', category: 'その他', emoji: '🥛', unit: '1本', min_price: 150, max_price: 250, note: '全国平均（参考）' },
  { item_name: '豆腐', category: 'その他', emoji: '🧈', unit: '1丁', min_price: 30, max_price: 80, note: '全国平均（参考）' },
]
