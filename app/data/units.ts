// 単位データ定義

// 共通単位（肉・魚・加工品など）
export const COMMON_UNITS = ['g', 'kg', '個', 'パック', '枚'] as const

// 野菜カテゴリ限定の追加単位
export const VEGETABLE_UNITS = ['個', '半分', '1/4', '袋', '房'] as const

// 全単位（重複を除く）
export const ALL_UNITS = [...new Set([...COMMON_UNITS, ...VEGETABLE_UNITS])] as const

// カテゴリに応じた単位を取得
export function getUnitsForCategory(category: '肉' | '魚' | '野菜' | '冷凍食品' | 'その他'): string[] {
  if (category === '野菜') {
    return [...new Set([...COMMON_UNITS, ...VEGETABLE_UNITS])]
  }
  return [...COMMON_UNITS]
}
