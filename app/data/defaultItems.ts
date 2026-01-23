// 主要食材（初期表示用）

export interface DefaultItem {
  name: string
  category: '肉' | '魚' | '野菜' | 'その他'
  emoji: string
  defaultUnit?: string
}

export const DEFAULT_ITEMS: DefaultItem[] = [
  // 野菜
  { name: 'キャベツ', category: '野菜', emoji: '🥬', defaultUnit: '個' },
  { name: '玉ねぎ', category: '野菜', emoji: '🧅', defaultUnit: '個' },
  { name: 'にんじん', category: '野菜', emoji: '🥕', defaultUnit: '個' },
  { name: 'トマト', category: '野菜', emoji: '🍅', defaultUnit: '個' },
  { name: 'きゅうり', category: '野菜', emoji: '🥒', defaultUnit: '個' },
  { name: 'レタス', category: '野菜', emoji: '🥬', defaultUnit: '個' },
  { name: '白菜', category: '野菜', emoji: '🥬', defaultUnit: '個' },
  { name: 'じゃがいも', category: '野菜', emoji: '🥔', defaultUnit: '個' },
  
  // 肉
  { name: '鶏もも', category: '肉', emoji: '🍗', defaultUnit: 'g' },
  { name: '鶏むね', category: '肉', emoji: '🍗', defaultUnit: 'g' },
  { name: '豚こま', category: '肉', emoji: '🥩', defaultUnit: 'g' },
  { name: '豚バラ', category: '肉', emoji: '🥩', defaultUnit: 'g' },
  { name: '牛こま', category: '肉', emoji: '🥩', defaultUnit: 'g' },
  { name: '合い挽き肉', category: '肉', emoji: '🥩', defaultUnit: 'g' },
  
  // 魚
  { name: '鮭', category: '魚', emoji: '🐟', defaultUnit: '切れ' },
  { name: 'さんま', category: '魚', emoji: '🐟', defaultUnit: '尾' },
  { name: 'いわし', category: '魚', emoji: '🐟', defaultUnit: '尾' },
  { name: 'さば', category: '魚', emoji: '🐟', defaultUnit: '切れ' },
  { name: 'まぐろ', category: '魚', emoji: '🐟', defaultUnit: 'g' },
  
  // その他
  { name: '食パン', category: 'その他', emoji: '🍞', defaultUnit: '斤' },
  { name: '卵', category: 'その他', emoji: '🥚', defaultUnit: 'パック' },
  { name: '牛乳', category: 'その他', emoji: '🥛', defaultUnit: '本' },
  { name: '豆腐', category: 'その他', emoji: '🧈', defaultUnit: '丁' },
]
