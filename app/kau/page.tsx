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

    const result = await savePostNew({
      item_name: itemName,
      price: parseInt(price),
      category,
      quantity: quantity ? parseInt(quantity) : undefined,
      unit: unit || undefined,
      region_big: selectedRegion.big,
      region_pref: selectedRegion.prefecture,
      region_city: selectedRegion.city,
      user_uuid: userUuid,
    })

    setIsSubmitting(false)

    if (result.success) {
      setSubmitSuccess(true)
      // フォームリセット
      setItemName('')
      setPrice('')
      setCategory(null)
      setQuantity('')
      setUnit('')
      // 投稿履歴を更新
      setRefreshKey(prev => prev + 1)
      
      setTimeout(() => {
        setSubmitSuccess(false)
        // スクロール位置をリセットしてから遷移
        window.scrollTo(0, 0)
        router.push('/shiru')
      }, 1500)
    } else {
      alert('保存に失敗しました。もう一度お試しください。' + result.error)
    }
  }

  return (
    <main className="min-h-screen p-4 pb-8 bg-gray-50">
      <div className="max-w-md mx-auto">
        {/* ヘッダー */}
        <div className="mb-6 pt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                かう
                <span className="inline-flex items-center" style={{ height: '1em', lineHeight: '1' }}>
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
            <AreaSelector region={selectedRegion} />
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
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
          {/* カテゴリ選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              カテゴリ <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-5 gap-3">
              {(['肉', '魚', '野菜', '冷凍食品', 'その他'] as Category[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategory(cat)
                    setUnit('') // カテゴリ変更時に単位をリセット
                  }}
                  className={`p-4 rounded-xl border-2 transition-all ${
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
              className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-base"
              required
            />
          </div>

          {/* 価格 */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
              価格（円） <span className="text-red-500">*</span>
            </label>
            <input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-2xl font-bold"
              min="1"
              required
            />
          </div>

          {/* 量と単位 */}
          <div className="grid grid-cols-2 gap-4">
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
                className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none"
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
                  className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none"
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
                  className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none"
                  disabled
                />
              )}
            </div>
          </div>

          {/* 送信ボタン */}
          <button
            type="submit"
            disabled={isSubmitting || !userUuid || !itemName || !price || !category || !selectedRegion.big}
            className={`w-full py-4 font-bold text-lg rounded-xl shadow-lg transition-all ${
              userUuid && itemName && price && category && selectedRegion.big
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? '保存中...' : '記録する'}
          </button>

          {submitSuccess && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl text-emerald-700 text-center">
              <p className="font-bold">記録完了！✨</p>
              <p className="text-sm mt-1">しるページに移動します...</p>
            </div>
          )}
        </form>

        {/* 買って記録した一覧 */}
        <MyPostsNew userUuid={userUuid} refreshKey={refreshKey} />

        {/* ナビゲーション */}
        <div className="mt-6 flex gap-4">
          <Link
            href="/shiru"
            className="flex-1 py-3 bg-white border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all text-center"
          >
            しるページへ →
          </Link>
        </div>
      </div>
    </main>
  )
}
