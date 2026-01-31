'use client'

import { useEffect, useState } from 'react'
import { getPublicBuyLogs, type BuyLog } from '../actions_buy_logs'

export function BuyLogsDisplay() {
  const [logs, setLogs] = useState<BuyLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true)
      const result = await getPublicBuyLogs()
      if (result.success) {
        setLogs(result.data)
      }
      setLoading(false)
    }
    loadLogs()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'たった今'
    if (diffMins < 60) return `${diffMins}分前`
    if (diffHours < 24) return `${diffHours}時間前`
    if (diffDays < 7) return `${diffDays}日前`
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  if (loading) {
    return (
      <div className="mb-6 p-4 bg-white rounded-2xl shadow-sm border border-gray-200">
        <p className="text-sm text-gray-500">読み込み中...</p>
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="mb-6 p-4 bg-white rounded-2xl shadow-sm border border-gray-200">
        <p className="text-sm text-gray-500">まだ記録がありません</p>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-gray-800 mb-3">みんなの買い物</h2>
      <div className="space-y-3">
        {logs.map((log) => (
          <div
            key={log.id}
            className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm"
          >
            {log.log_type === 'item' ? (
              // 単品メモ
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    {log.category && (
                      <span className="inline-block text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full mr-2">
                        {log.category}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">単品メモ</span>
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(log.created_at)}</span>
                </div>
                {log.item_name && (
                  <div className="text-base font-semibold text-gray-900 mb-1">
                    {log.item_name}
                  </div>
                )}
                {log.price && (
                  <div className="text-lg font-bold text-gray-900 mb-1">
                    {log.price.toLocaleString()}円
                  </div>
                )}
                {log.quantity_note && (
                  <div className="text-sm text-gray-600 mb-1">{log.quantity_note}</div>
                )}
                {log.extra_flag && (
                  <div className="text-xs text-amber-600 mb-1">余分だったかも</div>
                )}
                {log.comment && (
                  <div className="text-sm text-gray-700 mt-2 italic">「{log.comment}」</div>
                )}
              </div>
            ) : (
              // 今日の買い物
              <div>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs text-gray-500">今日の買い物</span>
                  <span className="text-xs text-gray-400">{formatDate(log.created_at)}</span>
                </div>
                {log.total_price && (
                  <div className="text-lg font-bold text-gray-900 mb-1">
                    {log.total_price.toLocaleString()}円
                  </div>
                )}
                {log.days_covered && (
                  <div className="text-sm text-gray-600 mb-1">{log.days_covered}日分</div>
                )}
                {log.extra_level && (
                  <div className="text-xs text-amber-600 mb-1">
                    {log.extra_level === 'yes' && '余分だった'}
                    {log.extra_level === 'maybe' && 'たぶん余分'}
                    {log.extra_level === 'no' && 'ちょうど良かった'}
                  </div>
                )}
                {log.daily_comment && (
                  <div className="text-sm text-gray-700 mt-2 italic">「{log.daily_comment}」</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
