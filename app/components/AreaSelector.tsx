'use client'

import { MapPin } from 'lucide-react'
import { formatRegionDisplay } from '../utils/regionDisplay'

interface AreaSelectorProps {
  region?: {
    big?: string
    prefecture?: string
    city?: string
  }
}

export function AreaSelector({ region }: AreaSelectorProps) {
  // 地域情報を表示形式に変換
  const displayText = region 
    ? formatRegionDisplay({
        region_big: region.big,
        region_pref: region.prefecture,
        region_city: region.city,
      })
    : '📍 中部／愛知県／名古屋市'

  return (
    <div className="flex items-center gap-2">
      <MapPin className="w-4 h-4 text-gray-600" />
      <span className="text-sm font-medium text-gray-700">
        {displayText}
      </span>
    </div>
  )
}
