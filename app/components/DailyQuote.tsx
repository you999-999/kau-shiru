'use client'

import { useEffect, useState } from 'react'
import { getTodayQuote } from '../actions'
import type { DailyQuote } from '../actions'

export function DailyQuote() {
  const [quote, setQuote] = useState<DailyQuote | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        setLoading(true)
        const result = await getTodayQuote()
        
        if (result.success && result.data) {
          setQuote(result.data)
        } else {
          // データなしの場合はnullのまま（後で「なし」と表示）
          setQuote(null)
        }
      } catch (error) {
        // テーブルが存在しない場合などは静かに処理（エラーを表示しない）
        setQuote(null)
      } finally {
        setLoading(false)
      }
    }

    fetchQuote()
  }, [])

  // ローディング中は何も表示しない
  if (loading) {
    return null
  }

  // 商品情報の表示文字列を生成
  const formatItemInfo = (quote: DailyQuote): string => {
    const parts: string[] = []
    
    if (quote.item_name) {
      parts.push(quote.item_name)
    }
    
    if (quote.price) {
      parts.push(`${quote.price.toLocaleString()}円`)
    }
    
    if (quote.quantity && quote.unit) {
      parts.push(`${quote.quantity}${quote.unit}`)
    } else if (quote.unit) {
      parts.push(quote.unit)
    }
    
    return parts.join(' ')
  }

  return (
      <div className="mb-6 p-4 sm:p-6 bg-gradient-to-br from-emerald-50 to-emerald-100/30 rounded-2xl shadow-sm border border-emerald-200">
        <h3 className="text-xs sm:text-sm font-semibold text-emerald-800 mb-2">今日のひとこと</h3>
      {quote ? (
        <div className="space-y-1">
          {quote.item_name && (
            <p className="text-gray-900 font-medium text-base">
              {formatItemInfo(quote)}
            </p>
          )}
          <p className="text-gray-700 leading-relaxed">{quote.content}</p>
        </div>
      ) : (
        <p className="text-gray-500 text-sm">なし</p>
      )}
    </div>
  )
}
