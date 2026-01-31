'use client'

import { X } from 'lucide-react'

interface RecordSummaryModalProps {
  isOpen: boolean
  onClose: () => void
  data: {
    category?: string
    itemName?: string
    price?: number
    quantity?: string
    unit?: string
    sentiment?: number
    extraFlag?: boolean
    comment?: string
  }
}

export function RecordSummaryModal({ isOpen, onClose, data }: RecordSummaryModalProps) {
  if (!isOpen) return null

  // 感情レベルに応じた装飾スタイル
  const getSentimentStyle = (sentiment?: number) => {
    if (!sentiment) {
      return {
        border: 'border-gray-300',
        bg: 'bg-white',
        shadow: 'shadow-xl',
        decoration: '',
      }
    }
    
    switch (sentiment) {
      case 1: // ボロい
        return {
          border: 'border-4 border-red-800 border-dashed',
          bg: 'bg-red-50',
          shadow: 'shadow-2xl',
          decoration: 'before:content-[""] before:absolute before:inset-0 before:border-2 before:border-red-600 before:rounded-xl before:opacity-50',
        }
      case 2: // 木の装飾
        return {
          border: 'border-4 border-amber-800',
          bg: 'bg-amber-50',
          shadow: 'shadow-2xl',
          decoration: 'before:content-[""] before:absolute before:inset-0 before:border-2 before:border-amber-700 before:rounded-xl',
        }
      case 3: // 銅の装飾
        return {
          border: 'border-4 border-orange-700',
          bg: 'bg-orange-50',
          shadow: 'shadow-2xl',
          decoration: 'before:content-[""] before:absolute before:inset-0 before:border-2 before:border-orange-600 before:rounded-xl',
        }
      case 4: // 銀の装飾
        return {
          border: 'border-4 border-gray-400',
          bg: 'bg-gray-50',
          shadow: 'shadow-2xl',
          decoration: 'before:content-[""] before:absolute before:inset-0 before:border-2 before:border-gray-300 before:rounded-xl',
        }
      case 5: // 金の装飾
        return {
          border: 'border-4 border-yellow-500',
          bg: 'bg-yellow-50',
          shadow: 'shadow-2xl shadow-yellow-500/50',
          decoration: 'before:content-[""] before:absolute before:inset-0 before:border-2 before:border-yellow-400 before:rounded-xl',
        }
      default:
        return {
          border: 'border-gray-300',
          bg: 'bg-white',
          shadow: 'shadow-xl',
          decoration: '',
        }
    }
  }

  const sentimentLabels: Record<number, string> = {
    1: '高過ぎ',
    2: 'ちょい高い',
    3: '普通',
    4: '安い',
    5: '神コスパ',
  }

  const style = getSentimentStyle(data.sentiment)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={`relative bg-white rounded-2xl ${style.shadow} max-w-xs w-full p-5 space-y-3 ${style.border} ${style.bg}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-gray-900">記録内容</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="閉じる"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="space-y-2.5 text-xs">
          {/* カテゴリ */}
          <div>
            <div className="text-xs font-medium text-gray-500 mb-1">カテゴリ（任意）</div>
            <div className="text-sm text-gray-900">
              {data.category ? (
                <span className="inline-block px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-medium">
                  {data.category}
                </span>
              ) : (
                <span className="text-gray-400">未入力</span>
              )}
            </div>
          </div>

          {/* 商品名 */}
          <div>
            <div className="text-xs font-medium text-gray-500 mb-1">商品名（任意）</div>
            <div className="text-sm text-gray-900">
              {data.itemName || <span className="text-gray-400">未入力</span>}
            </div>
          </div>

          {/* 金額 */}
          <div>
            <div className="text-xs font-medium text-gray-500 mb-1">金額（任意・ざっくりOK）</div>
            <div className="text-sm text-gray-900">
              {data.price ? `${data.price.toLocaleString()}円` : <span className="text-gray-400">未入力</span>}
            </div>
          </div>

          {/* 量と単位 */}
          <div>
            <div className="text-xs font-medium text-gray-500 mb-1">量（任意）</div>
            <div className="text-sm text-gray-900">
              {data.quantity || <span className="text-gray-400">未入力</span>}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-gray-500 mb-1">単位（任意）</div>
            <div className="text-sm text-gray-900">
              {data.unit || <span className="text-gray-400">未入力</span>}
            </div>
          </div>

          {/* 感情 */}
          <div>
            <div className="text-xs font-medium text-gray-500 mb-1">感情（任意）</div>
            <div className="text-sm text-gray-900 font-semibold">
              {data.sentiment ? (
                <span className={`px-2 py-1 rounded-lg ${
                  data.sentiment === 1 ? 'bg-red-100 text-red-700' :
                  data.sentiment === 2 ? 'bg-amber-100 text-amber-700' :
                  data.sentiment === 3 ? 'bg-orange-100 text-orange-700' :
                  data.sentiment === 4 ? 'bg-gray-100 text-gray-700' :
                  data.sentiment === 5 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {data.sentiment}: {sentimentLabels[data.sentiment]}
                </span>
              ) : (
                <span className="text-gray-400">未選択</span>
              )}
            </div>
          </div>

          {/* 余分だったかも */}
          <div>
            <div className="text-xs font-medium text-gray-500 mb-1">余分だったかも？</div>
            <div className="text-sm text-gray-900">
              {data.extraFlag ? (
                <span className="text-amber-600 font-medium">✓ 余分だったかも</span>
              ) : (
                <span className="text-gray-400">未選択</span>
              )}
            </div>
          </div>

          {/* ひとこと */}
          <div>
            <div className="text-xs font-medium text-gray-500 mb-1">ひとこと（任意）</div>
            <div className="text-sm text-gray-900">
              {data.comment || <span className="text-gray-400">未入力</span>}
            </div>
          </div>
        </div>

        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors mt-4 text-sm"
        >
          閉じる
        </button>
      </div>
    </div>
  )
}
