'use client'

import { PriceTrend } from '../actions'

interface SparklineProps {
  trends: PriceTrend[]
  width?: number
  height?: number
}

export function Sparkline({ trends, width = 60, height = 20 }: SparklineProps) {
  if (trends.length < 2) {
    return <div className="text-xs text-gray-400">データ不足</div>
  }

  const prices = trends.map(t => t.avg_price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const priceRange = maxPrice - minPrice || 1

  // SVGパスを生成
  const points = trends.map((trend, index) => {
    const x = (index / (trends.length - 1)) * width
    const y = height - ((trend.avg_price - minPrice) / priceRange) * height
    return { x, y }
  })

  // トレンドの方向を判定
  const firstPrice = prices[0]
  const lastPrice = prices[prices.length - 1]
  const isUp = lastPrice > firstPrice
  const isDown = lastPrice < firstPrice

  const pointsString = points.map(p => `${p.x},${p.y}`).join(' ')

  return (
    <div className="flex items-center gap-2">
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          points={pointsString}
          fill="none"
          stroke={isUp ? '#ef4444' : isDown ? '#10b981' : '#6b7280'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className={`text-xs font-medium ${
        isUp ? 'text-coral-500' : isDown ? 'text-emerald-500' : 'text-gray-500'
      }`}>
        {isUp ? '↑' : isDown ? '↓' : '→'}
      </span>
    </div>
  )
}
