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
    extraFlag?: boolean
    comment?: string
  }
}

export function RecordSummaryModal({ isOpen, onClose, data }: RecordSummaryModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">記録内容</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="閉じる"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-3 text-sm">
          {/* カテゴリ */}
          <div>
            <div className="text-xs font-medium text-gray-500 mb-1">カテゴリ（任意）</div>
            <div className="text-base text-gray-900">
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
            <div className="text-base text-gray-900">
              {data.itemName || <span className="text-gray-400">未入力</span>}
            </div>
          </div>

          {/* 金額 */}
          <div>
            <div className="text-xs font-medium text-gray-500 mb-1">金額（任意・ざっくりOK）</div>
            <div className="text-base text-gray-900">
              {data.price ? `${data.price.toLocaleString()}円` : <span className="text-gray-400">未入力</span>}
            </div>
          </div>

          {/* 量と単位 */}
          <div>
            <div className="text-xs font-medium text-gray-500 mb-1">量（任意）</div>
            <div className="text-base text-gray-900">
              {data.quantity || <span className="text-gray-400">未入力</span>}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-gray-500 mb-1">単位（任意）</div>
            <div className="text-base text-gray-900">
              {data.unit || <span className="text-gray-400">未入力</span>}
            </div>
          </div>

          {/* 余分だったかも */}
          <div>
            <div className="text-xs font-medium text-gray-500 mb-1">余分だったかも？</div>
            <div className="text-base text-gray-900">
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
            <div className="text-base text-gray-900">
              {data.comment || <span className="text-gray-400">未入力</span>}
            </div>
          </div>
        </div>

        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors mt-6"
        >
          閉じる
        </button>
      </div>
    </div>
  )
}
