// 地域表示用のユーティリティ関数

export interface RegionDisplayData {
  region_big?: string
  region_pref?: string
  region_city?: string
}

/**
 * 地域情報を表示形式に変換
 * 形式：📍 中部／愛知県／名古屋市（未選択の階層は省略）
 */
export function formatRegionDisplay(region: RegionDisplayData): string {
  const parts: string[] = []
  
  if (region.region_big) {
    parts.push(region.region_big)
  }
  
  if (region.region_pref) {
    parts.push(region.region_pref)
  }
  
  if (region.region_city) {
    parts.push(region.region_city)
  }
  
  if (parts.length === 0) {
    return ''
  }
  
  return `📍 ${parts.join('／')}`
}
