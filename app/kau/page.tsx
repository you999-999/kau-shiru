'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUserUuid } from '@/hooks/useUserUuid'
import { savePostNew } from '../actions_new'
import { RegionSelector, RegionData } from '../components/RegionSelector'
import { DEFAULT_REGION } from '../data/regions'
import { getUnitsForCategory } from '../data/units'
import { AreaSelector } from '../components/AreaSelector'
import { ShoppingMemo } from '../components/ShoppingMemo'
import { MyPostsNew } from '../components/MyPostsNew'
import Image from 'next/image'

type Category = '肉' | '魚' | '野菜' | '冷凍食品' | 'その他'

export default function KauPage() {
  const router = useRouter()
  
  // ページ読み込み時にスクロール位置をリセット
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  const userUuid = useUserUuid()
  const [itemName, setItemName] = useState<string>('')
  const [price, setPrice] = useState<string>('')
  const [category, setCategory] = useState<Category | null>(null)
  const [isTaxIncluded, setIsTaxIncluded] = useState<boolean>(true) // デフォルトは税込み
  const [comment, setComment] = useState<string>('') // 一言
  const [quantity, setQuantity] = useState<string>('')
  const [unit, setUnit] = useState<string>('')
  const [selectedRegion, setSelectedRegion] = useState<RegionData>(DEFAULT_REGION)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // カテゴリに応じた単位リスト
  const availableUnits = category ? getUnitsForCategory(category) : []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userUuid || !itemName || !price || !category || !selectedRegion.big) {
      alert('食材名、価格、カテゴリ、地域を入力してください')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await savePostNew({
        item_name: itemName,
        price: parseInt(price),
        category,
        is_tax_included: isTaxIncluded,
        quantity: quantity ? parseInt(quantity) : undefined,
        unit: unit || undefined,
        comment: comment.trim() || undefined,
        region_big: selectedRegion.big,
        region_pref: selectedRegion.prefecture,
        region_city: selectedRegion.city,
        user_uuid: userUuid,
      })

      if (result.success) {
        setSubmitSuccess(true)
        // フォームリセット
        setItemName('')
        setPrice('')
        setCategory(null)
        setIsTaxIncluded(true) // デフォルトに戻す
        setComment('') // 一言もリセット
        setQuantity('')
        setUnit('')
        // 投稿履歴を更新
        setRefreshKey(prev => prev + 1)
        
        // 成功メッセージを3秒後に消す（ページ遷移はしない）
        setTimeout(() => {
          setSubmitSuccess(false)
        }, 3000)
      } else {
        console.error('保存エラー:', result.error)
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
    <main className="min-h-screen p-4 pb-8 bg-gray-50">
      <div className="max-w-md mx-auto">
        {/* ヘッダー */}
        <div className="mb-6 pt-8">
            <div className="flex items-center justify-between mb-4 gap-2">
              <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-shrink">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                  かう
                  <span className="inline-flex items-center flex-shrink-0" style={{ height: '1em', lineHeight: '1' }}>
                    <Image
                      src="/gazou/kausiru.png"
                      alt="かうしる"
                      width={24}
                      height={24}
                      className="object-contain"
                      style={{ height: '1em', width: 'auto' }}
                    />
                  </span>
                </h1>
              </div>
              <div className="flex-shrink-0">
                <AreaSelector region={selectedRegion} />
              </div>
            </div>
          <p className="text-sm text-gray-600">価格を記録して、みんなの相場に貢献</p>
        </div>

        {/* これから買うメモ */}
        <ShoppingMemo />

        {/* 地域選択 */}
        <div className="mb-6 p-4 bg-white rounded-2xl shadow-sm border border-gray-200">
          <RegionSelector value={selectedRegion} onChange={setSelectedRegion} />
        </div>

        {/* 入力フォーム */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* カテゴリ選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              カテゴリ <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
              {(['肉', '魚', '野菜', '冷凍食品', 'その他'] as Category[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategory(cat)
                    setUnit('') // カテゴリ変更時に単位をリセット
                  }}
                  className={`p-3 sm:p-4 rounded-xl border-2 transition-all text-sm sm:text-base ${
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

          {/* 食材名 */}
          <div>
            <label htmlFor="item-name" className="block text-sm font-medium text-gray-700 mb-2">
              食材名 <span className="text-red-500">*</span>
            </label>
            <input
              id="item-name"
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="例：キャベツ、鶏もも"
              className="w-full p-3 sm:p-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-sm sm:text-base"
              required
            />
          </div>

          {/* 価格 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                価格（円） <span className="text-red-500">*</span>
              </label>
              {/* 税込み/税別切り替え */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsTaxIncluded(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isTaxIncluded
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  税込み
                </button>
                <button
                  type="button"
                  onClick={() => setIsTaxIncluded(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    !isTaxIncluded
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  税別
                </button>
              </div>
            </div>
            <input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              className="w-full p-3 sm:p-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-xl sm:text-2xl font-bold"
              min="1"
              required
            />
            {!isTaxIncluded && price && (
              <p className="text-xs text-gray-500 mt-1">
                税込み価格: {Math.round(parseInt(price) * 1.08).toLocaleString()}円
              </p>
            )}
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
                className="w-full p-3 sm:p-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-sm sm:text-base"
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
                  className="w-full p-3 sm:p-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-sm sm:text-base"
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
                  className="w-full p-3 sm:p-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-sm sm:text-base"
                  disabled
                />
              )}
            </div>
          </div>

          {/* 一言（任意） */}
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              ひとこと（任意・最大20文字）
            </label>
            <input
              id="comment"
              type="text"
              value={comment}
              onChange={(e) => {
                const value = e.target.value
                if (value.length <= 20) {
                  setComment(value)
                }
              }}
              placeholder="例：お買い得だった！"
              className="w-full p-3 sm:p-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-sm sm:text-base"
              maxLength={20}
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/20文字
            </p>
          </div>

          {/* 送信ボタン */}
          <button
            type="submit"
            disabled={isSubmitting || !userUuid || !itemName || !price || !category || !selectedRegion.big}
            className={`w-full py-3 sm:py-4 font-bold text-base sm:text-lg rounded-xl shadow-lg transition-all ${
              userUuid && itemName && price && category && selectedRegion.big
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? '保存中...' : '記録する'}
          </button>

          {submitSuccess && (
            <div className="p-3 sm:p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl text-emerald-700 text-center">
              <p className="font-bold text-sm sm:text-base">記録完了！✨</p>
              <p className="text-xs sm:text-sm mt-1">続けて記録できます</p>
            </div>
          )}
        </form>

        {/* 買って記録した一覧 */}
        <MyPostsNew userUuid={userUuid} refreshKey={refreshKey} />

        {/* ナビゲーション */}
        <div className="mt-6 flex gap-2 sm:gap-4">
          <Link
            href="/shiru"
            className="flex-1 py-2.5 sm:py-3 bg-white border-2 border-gray-200 rounded-xl font-medium text-sm sm:text-base text-gray-700 hover:bg-gray-50 transition-all text-center"
          >
            しるページへ →
          </Link>
        </div>
      </div>
    </main>
  )
}
