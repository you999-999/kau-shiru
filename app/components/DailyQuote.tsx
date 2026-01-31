'use client'

import { useEffect, useState } from 'react'
import { getTodayQuote } from '../actions'
import type { DailyQuote } from '../actions'
import { DEFAULT_REGION } from '../data/regions'

interface DailyQuoteProps {
  region?: {
    big?: string
    prefecture?: string
    city?: string
  }
}

export function DailyQuote({ region }: DailyQuoteProps) {
  const [quote, setQuote] = useState<DailyQuote | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentRegion, setCurrentRegion] = useState<{ big?: string; prefecture?: string; city?: string }>(region || DEFAULT_REGION)

  // 地域情報をlocalStorageから取得（propsがない場合）
  useEffect(() => {
    if (region) {
      setCurrentRegion(region)
      return
    }

    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem('kau_shiru_selected_region')
      if (stored) {
        const parsed = JSON.parse(stored)
        setCurrentRegion({
          big: parsed.big || DEFAULT_REGION.big,
          prefecture: parsed.prefecture || DEFAULT_REGION.prefecture,
          city: parsed.city || DEFAULT_REGION.city,
        })
      } else {
        setCurrentRegion(DEFAULT_REGION)
      }
    } catch (e) {
      console.error('Failed to parse region from localStorage:', e)
      setCurrentRegion(DEFAULT_REGION)
    }
  }, [region])

  // ページ遷移時（マウント時）と地域変更時に再取得
  useEffect(() => {
    const fetchQuote = async () => {
      try {
        setLoading(true)
        const result = await getTodayQuote(currentRegion)
        
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
  }, [currentRegion])
  
  // ページ表示時（マウント時）にも必ず再取得（ページ遷移を検知）
  useEffect(() => {
    const fetchQuote = async () => {
      try {
        setLoading(true)
        const result = await getTodayQuote(currentRegion)
        
        if (result.success && result.data) {
          setQuote(result.data)
        } else {
          setQuote(null)
        }
      } catch (error) {
        setQuote(null)
      } finally {
        setLoading(false)
      }
    }
    
    // マウント時のみ実行（ページ遷移時）
    fetchQuote()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // マウント時のみ実行

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
