'use client'

import { useEffect, useState } from 'react'
import { getAreaStats, getPriceTrends, CategoryStats, PriceTrend } from '../actions'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Sparkline } from './Sparkline'

interface AreaStatsProps {
  refreshKey?: number
}

export function AreaStats({ refreshKey = 0 }: AreaStatsProps) {
  const [stats, setStats] = useState<CategoryStats[]>([])
  const [priceTrends, setPriceTrends] = useState<Record<string, PriceTrend[]>>({})
  const [loading, setLoading] = useState(true)
  const [previousStats, setPreviousStats] = useState<CategoryStats[]>([])

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true)
      const [statsResult, trendsResult] = await Promise.all([
        getAreaStats(),
        getPriceTrends(),
      ])
      
      if (statsResult.success && statsResult.data) {
        // 前回の統計を保存（前日比計算用）
        setPreviousStats(prev => stats.length > 0 ? stats : prev)
        setStats(statsResult.data)
      }
      
      if (trendsResult.success && trendsResult.data) {
        setPriceTrends(trendsResult.data)
      }
      
      setLoading(false)
    }

    loadStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey])

  const getPriceComparison = (category: string, currentAvg: number): number | null => {
    const prev = previousStats.find(s => s.item_category === category)
    if (!prev) return null
    return currentAvg - prev.avg_price
  }

  if (loading) {
    return (
      <div className="mb-6 p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">愛知西部のいまの相場</h3>
        <p className="text-xs text-gray-500">読み込み中...</p>
      </div>
    )
  }

  if (stats.length === 0) {
    return (
      <div className="mb-6 p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">愛知西部のいまの相場</h3>
        <p className="text-xs text-gray-500">データがまだありません</p>
      </div>
    )
  }

  return (
    <div className="mb-6 p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">愛知西部のいまの相場</h3>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => {
          const comparison = getPriceComparison(stat.item_category, stat.avg_price)
          const isUp = comparison !== null && comparison > 0
          const isDown = comparison !== null && comparison < 0
          
          return (
            <div
              key={stat.item_category}
              className="p-4 bg-gray-50 rounded-xl border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700">{stat.item_category}</span>
                {comparison !== null && (
                  <div className="flex items-center gap-1">
                    {isUp && <TrendingUp className="w-3 h-3 text-coral-500" />}
                    {isDown && <TrendingDown className="w-3 h-3 text-emerald-500" />}
                    {comparison === 0 && <Minus className="w-3 h-3 text-gray-400" />}
                  </div>
                )}
              </div>
              <div className="text-xl font-bold text-gray-900 mb-1">
                {stat.avg_price.toLocaleString()}円
              </div>
              <div className="text-xs text-gray-600 mb-2 font-medium">
                このあたり（愛知西部）では、¥{stat.min_price.toLocaleString()}くらいがお得感あり。
              </div>
              {priceTrends[stat.item_category] && priceTrends[stat.item_category].length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <Sparkline trends={priceTrends[stat.item_category]} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
