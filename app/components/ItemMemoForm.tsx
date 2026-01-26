'use client'

import { useState } from 'react'
import { saveItemLog, type ItemLogData } from '../actions_buy_logs'

interface ItemMemoFormProps {
  userUuid: string | null
  onSuccess?: () => void
}

export function ItemMemoForm({ userUuid, onSuccess }: ItemMemoFormProps) {
  const [category, setCategory] = useState<string>('')
  const [price, setPrice] = useState<string>('')
  const [quantityNote, setQuantityNote] = useState<string>('')
  const [extraFlag, setExtraFlag] = useState<boolean>(false)
  const [comment, setComment] = useState<string>('')
  const [isPublic, setIsPublic] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const categories = ['肉', '魚', '野菜', '冷凍食品', 'その他']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userUuid) {
      alert('ユーザー情報が取得できませんでした')
      return
    }

    setIsSubmitting(true)

    try {
      const data: ItemLogData = {
        category: category || undefined,
        price: price ? parseInt(price) : undefined,
        quantity_note: quantityNote || undefined,
        extra_flag: extraFlag || undefined,
        comment: comment || undefined,
        is_public: isPublic,
      }

      const result = await saveItemLog(userUuid, data)

      if (result.success) {
        setSubmitSuccess(true)
        // フォームリセット
        setCategory('')
        setPrice('')
        setQuantityNote('')
        setExtraFlag(false)
        setComment('')
        setIsPublic(true)
        
        if (onSuccess) onSuccess()
        
        setTimeout(() => {
          setSubmitSuccess(false)
        }, 3000)
      } else {
        alert(`保存に失敗しました: ${result.error || '不明なエラー'}`)
      }
    } catch (error) {
      console.error('保存処理でエラーが発生しました:', error)
      alert(`保存に失敗しました: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 space-y-4">
      {/* カテゴリ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          カテゴリ（任意）
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`p-2 sm:p-3 rounded-lg border-2 transition-all text-xs sm:text-sm ${
                category === cat
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 金額 */}
      <div>
        <label htmlFor="item-price" className="block text-sm font-medium text-gray-700 mb-2">
          金額（任意・ざっくりOK）
        </label>
        <input
          id="item-price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="例：298"
          className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-sm"
          min="0"
        />
      </div>

      {/* 量 */}
      <div>
        <label htmlFor="quantity-note" className="block text-sm font-medium text-gray-700 mb-2">
          量（任意）
        </label>
        <input
          id="quantity-note"
          type="text"
          value={quantityNote}
          onChange={(e) => setQuantityNote(e.target.value)}
          placeholder="例：1パック、300g"
          className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-sm"
        />
      </div>

      {/* 余分だったかも */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={extraFlag}
            onChange={(e) => setExtraFlag(e.target.checked)}
            className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
          />
          <span className="text-sm text-gray-700">余分だったかも？</span>
        </label>
      </div>

      {/* ひとこと */}
      <div>
        <label htmlFor="item-comment" className="block text-sm font-medium text-gray-700 mb-2">
          ひとこと（任意）
        </label>
        <input
          id="item-comment"
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="例：お買い得だった"
          className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-sm"
        />
      </div>

      {/* 公開設定 */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
          />
          <span className="text-sm text-gray-700">公開する</span>
        </label>
      </div>

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={isSubmitting || !userUuid}
        className={`w-full py-3 font-bold text-base rounded-xl shadow-lg transition-all ${
          userUuid
            ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
            : 'bg-gray-300 text-gray-600 cursor-not-allowed'
        }`}
      >
        {isSubmitting ? '保存中...' : 'メモする'}
      </button>

      {submitSuccess && (
        <div className="p-3 bg-emerald-50 border-2 border-emerald-200 rounded-xl text-emerald-700 text-center">
          <p className="font-bold text-sm">メモ完了！✨</p>
        </div>
      )}
    </form>
  )
}
