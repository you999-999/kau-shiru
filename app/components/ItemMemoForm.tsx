'use client'

import { useState } from 'react'
import { saveItemLog, type ItemLogData } from '../actions_buy_logs'
import { getUnitsForCategory } from '../data/units'
import { RecordSummaryModal } from './RecordSummaryModal'

interface ItemMemoFormProps {
  userUuid: string | null
  region?: {
    big?: string
    prefecture?: string
    city?: string
  }
  onSuccess?: () => void
}

export function ItemMemoForm({ userUuid, region, onSuccess }: ItemMemoFormProps) {
  const [category, setCategory] = useState<string>('')
  const [itemName, setItemName] = useState<string>('')
  const [price, setPrice] = useState<string>('')
  const [quantity, setQuantity] = useState<string>('')
  const [unit, setUnit] = useState<string>('')
  const [sentiment, setSentiment] = useState<number | null>(null)
  const [extraFlag, setExtraFlag] = useState<boolean>(false)
  const [comment, setComment] = useState<string>('')
  const [isPublic, setIsPublic] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [savedData, setSavedData] = useState<{
    category?: string
    itemName?: string
    price?: number
    quantity?: string
    unit?: string
    sentiment?: number
    extraFlag?: boolean
    comment?: string
  }>({})

  const categories = ['肉', '魚', '野菜', '冷凍食品', 'その他'] as const
  const availableUnits = category ? getUnitsForCategory(category as '肉' | '魚' | '野菜' | '冷凍食品' | 'その他') : []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userUuid) {
      alert('ユーザー情報が取得できませんでした')
      return
    }

    setIsSubmitting(true)

    try {
      // 量と単位を結合してquantity_noteに保存
      let quantityNote: string | undefined = undefined
      if (quantity || unit) {
        const parts: string[] = []
        if (quantity) parts.push(quantity)
        if (unit) parts.push(unit)
        quantityNote = parts.join('')
      }

      const data: ItemLogData = {
        item_name: itemName || undefined,
        category: category || undefined,
        price: price ? parseInt(price) : undefined,
        quantity_note: quantityNote,
        extra_flag: extraFlag || undefined,
        sentiment: sentiment || undefined,
        comment: comment || undefined,
        is_public: isPublic,
      }

      const result = await saveItemLog(userUuid, data, region)

      if (result.success) {
        setSubmitSuccess(true)
        
        // 記録内容を保存（モーダル表示用）
        setSavedData({
          category: category || undefined,
          itemName: itemName || undefined,
          price: price ? parseInt(price) : undefined,
          quantity: quantity || undefined,
          unit: unit || undefined,
          sentiment: sentiment || undefined,
          extraFlag: extraFlag || undefined,
          comment: comment || undefined,
        })
        
        // モーダルを表示
        setShowSummary(true)
        
        // フォームリセット
        setCategory('')
        setItemName('')
        setPrice('')
        setQuantity('')
        setUnit('')
        setSentiment(null)
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
              onClick={() => {
                setCategory(cat)
                setUnit('') // カテゴリ変更時に単位をリセット
              }}
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

      {/* 商品名 */}
      <div>
        <label htmlFor="item-name" className="block text-sm font-medium text-gray-700 mb-2">
          商品名（任意）
        </label>
        <input
          id="item-name"
          type="text"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          placeholder="例：大根、キャベツ、鶏もも"
          className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-sm"
        />
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

      {/* 量と単位 */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
            量（任意）
          </label>
          <input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="例：1"
            className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-sm"
            min="0"
          />
        </div>
        <div>
          <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-2">
            単位（任意）
          </label>
          {category ? (
            <select
              id="unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-sm"
            >
              <option value="">選択しない</option>
              {availableUnits.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          ) : (
            <input
              id="unit"
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="例：g、個"
              className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-sm"
              disabled
            />
          )}
        </div>
      </div>

      {/* 感情 */}
      <div>
        <label htmlFor="sentiment" className="block text-sm font-medium text-gray-700 mb-2">
          感情（任意）
        </label>
        <select
          id="sentiment"
          value={sentiment || ''}
          onChange={(e) => setSentiment(e.target.value ? parseInt(e.target.value) : null)}
          className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-sm"
        >
          <option value="">選択しない</option>
          <option value="1">1: 高過ぎ</option>
          <option value="2">2: ちょい高い</option>
          <option value="3">3: 普通</option>
          <option value="4">4: 安い</option>
          <option value="5">5: 神コスパ</option>
        </select>
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
        {isSubmitting ? '保存中...' : '記録する'}
      </button>

      {submitSuccess && (
        <div className="p-3 bg-emerald-50 border-2 border-emerald-200 rounded-xl text-emerald-700 text-center">
          <p className="font-bold text-sm">メモ完了！✨</p>
        </div>
      )}

      {/* 記録内容表示モーダル */}
      <RecordSummaryModal
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        data={savedData}
      />
    </form>
  )
}
