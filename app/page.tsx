'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Egg, Milk, Beef, Carrot, Snowflake, Package } from 'lucide-react'
import { useUserUuid } from '@/hooks/useUserUuid'
import { savePost, getAreaStats, getPriceTrends, CategoryStats, PriceTrend } from './actions'
import { RecentForecast } from './components/RecentForecast'
import { MyPosts } from './components/MyPosts'
import { AreaStats } from './components/AreaStats'
import { ShoppingList } from './components/ShoppingList'
import { AreaSelector } from './components/AreaSelector'
import { SocialShare } from './components/SocialShare'
import { StructuredData } from './components/StructuredData'
import { AdBanner } from './components/AdBanner'
import { DailyQuote } from './components/DailyQuote'

type Category = '卵' | '牛乳' | '肉' | '野菜' | '冷凍食品' | 'その他'
type SizeStatus = 'normal' | 'less' | 'tiny'

const categories: { value: Category; icon: typeof Egg; label: string }[] = [
  { value: '卵', icon: Egg, label: '卵' },
  { value: '牛乳', icon: Milk, label: '牛乳' },
  { value: '肉', icon: Beef, label: '肉' },
  { value: '野菜', icon: Carrot, label: '野菜' },
  { value: '冷凍食品', icon: Snowflake, label: '冷凍食品' },
  { value: 'その他', icon: Package, label: 'その他' },
]

const sizeOptions: { value: SizeStatus; label: string }[] = [
  { value: 'normal', label: 'いつも通り' },
  { value: 'less', label: '少し減った' },
  { value: 'tiny', label: 'だいぶ減った' },
]

const sentimentOptions = [
  { level: 1, emoji: '😊', label: 'うれしい！' },
  { level: 2, emoji: '🙂', label: '納得！' },
  { level: 3, emoji: '😐', label: 'ふつう' },
  { level: 4, emoji: '😐', label: 'ふつう' },
  { level: 5, emoji: '😐', label: 'ふつう' },
]

export default function Home() {
  const userUuid = useUserUuid()
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [price, setPrice] = useState<string>('')
  const [isTaxIncluded, setIsTaxIncluded] = useState(true)
  const [sizeStatus, setSizeStatus] = useState<SizeStatus | null>(null)
  const [sentimentLevel, setSentimentLevel] = useState<number | null>(null)
  const [comment, setComment] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [areaStats, setAreaStats] = useState<CategoryStats[]>([])
  const [priceTrends, setPriceTrends] = useState<Record<string, PriceTrend[]>>({})

  const calculateTaxIncluded = (priceValue: number): number => {
    return Math.round(priceValue * 1.08)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userUuid || !selectedCategory || !price || !sizeStatus || sentimentLevel === null) {
      alert('すべての項目を入力してください')
      return
    }

    setIsSubmitting(true)
    
    const result = await savePost({
      item_category: selectedCategory,
      price: parseInt(price),
      is_tax_included: isTaxIncluded,
      size_status: sizeStatus,
      sentiment_level: sentimentLevel,
      user_uuid: userUuid,
      comment: comment.trim() || undefined,
    })

    setIsSubmitting(false)

    if (result.success) {
      setSubmitSuccess(true)
      setShowConfetti(true)
      
      // フォームリセット
      setSelectedCategory(null)
      setPrice('')
      setIsTaxIncluded(true)
      setSizeStatus(null)
      setSentimentLevel(null)
      setComment('')
      
      // 紙吹雪を2秒後に消す
      setTimeout(() => setShowConfetti(false), 2000)
      
      // 3秒後に成功メッセージを消す
      setTimeout(() => setSubmitSuccess(false), 3000)
      
      // 予報を更新
      setRefreshKey(prev => prev + 1)
    } else {
      alert('保存に失敗しました。もう一度お試しください。')
    }
  }

  const priceValue = parseInt(price) || 0
  const taxIncludedPrice = isTaxIncluded ? priceValue : calculateTaxIncluded(priceValue)

  // 統計データを取得（初回ロード時のみ）
  useEffect(() => {
    const loadStats = async () => {
      const [statsResult, trendsResult] = await Promise.all([
        getAreaStats(),
        getPriceTrends(),
      ])
      
      if (statsResult.success && statsResult.data) {
        setAreaStats(statsResult.data)
      }
      
      if (trendsResult.success && trendsResult.data) {
        setPriceTrends(trendsResult.data)
      }
    }
    loadStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // 初回ロード時のみ実行

  // 投稿成功時のみ統計データを再取得
  useEffect(() => {
    if (refreshKey > 0) {
      const loadStats = async () => {
        const [statsResult, trendsResult] = await Promise.all([
          getAreaStats(),
          getPriceTrends(),
        ])
        
        if (statsResult.success && statsResult.data) {
          setAreaStats(statsResult.data)
        }
        
        if (trendsResult.success && trendsResult.data) {
          setPriceTrends(trendsResult.data)
        }
      }
      loadStats()
    }
  }, [refreshKey])

  // 価格比較ロジック（ポジティブな情報のみ）
  const getPriceComparison = (): { label: string; color: string; bgColor: string; badge?: string } | null => {
    if (!selectedCategory || !priceValue) return null
    
    const stat = areaStats.find(s => s.item_category === selectedCategory)
    if (!stat) return null

    const diff = taxIncludedPrice - stat.avg_price
    
    // 地域最安値より安い場合は「これ、買いです！✨」
    if (taxIncludedPrice <= stat.min_price) {
      return {
        label: 'これ、買いです！✨',
        color: 'text-emerald-700',
        bgColor: 'bg-emerald-50 border-emerald-200',
        badge: '地域最安値 ✨',
      }
    } else if (diff <= -5) {
      return {
        label: 'お買い得！✨',
        color: 'text-emerald-700',
        bgColor: 'bg-emerald-50 border-emerald-200',
        badge: '地域最安水準 ✨',
      }
    }
    
    return null
  }

  const priceComparison = getPriceComparison()

  return (
    <main className="min-h-screen p-4 pb-8">
      <StructuredData type="WebApplication" />
      <div className="max-w-md mx-auto">
        {/* ヘッダー */}
        <div className="mb-6 pt-8">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-2">
              かうしる
              <span className="inline-flex items-center" style={{ height: '1em', lineHeight: '1' }}>
                <Image
                  src="/gazou/kausiru.png"
                  alt="かうしる"
                  width={36}
                  height={36}
                  className="object-contain"
                  style={{ height: '1em', width: 'auto' }}
                />
              </span>
            </h1>
          </div>
          <div className="flex items-center justify-end mb-4">
            <AreaSelector />
          </div>
          <div className="mb-2 text-center">
            <p className="text-gray-600 text-sm">買い物にお得感と楽しさを！</p>
            <p className="text-gray-600 text-sm">地域の知恵が集まる物価メモ</p>
          </div>
          
          {/* 今日のひとこと */}
          <DailyQuote />
        </div>

        {/* 紙吹雪アニメーション */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-emerald-400 rounded-full animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-10px',
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${2 + Math.random() * 1}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* 広告バナー（ヘッダー下） - 環境変数が設定されている場合のみ表示 */}
        {process.env.NEXT_PUBLIC_ADSENSE_SLOT_HEADER && (
          <div className="mb-6">
            <AdBanner 
              adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HEADER}
              className="w-full"
              format="horizontal"
            />
          </div>
        )}

        {/* 買い物リスト */}
        <ShoppingList areaStats={areaStats} />

        {/* 地域統計 */}
        <AreaStats areaStats={areaStats} priceTrends={priceTrends} />

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8 space-y-8 mb-6">
        {/* カテゴリ選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            カテゴリ
          </label>
          <div className="grid grid-cols-3 gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon
              const isSelected = selectedCategory === cat.value
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50 shadow-md scale-105'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-1 ${
                    isSelected ? 'text-emerald-600' : 'text-gray-400'
                  }`} />
                  <span className={`text-xs ${
                    isSelected ? 'text-emerald-700 font-medium' : 'text-gray-600'
                  }`}>
                    {cat.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 価格入力 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            価格
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              className="flex-1 text-3xl font-bold p-5 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all"
              min="1"
              required
            />
            <div className="text-sm text-gray-500 min-w-[120px]">
              {price && (
                <div>
                  {isTaxIncluded ? (
                    <span className="font-medium text-gray-700">税込 {priceValue.toLocaleString()}円</span>
                  ) : (
                    <span className="text-gray-700">
                      税別 {priceValue.toLocaleString()}円
                      <br />
                      <span className="text-xs text-gray-500">(税込 約{taxIncludedPrice.toLocaleString()}円)</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setIsTaxIncluded(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isTaxIncluded
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              税込
            </button>
            <button
              type="button"
              onClick={() => setIsTaxIncluded(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                !isTaxIncluded
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              税別
            </button>
          </div>
          {priceComparison && (
            <div className={`mt-3 p-4 rounded-xl border-2 ${priceComparison.bgColor} ${priceComparison.color}`}>
              <div className="flex items-center justify-center gap-2">
                {priceComparison.badge && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white">
                    {priceComparison.badge}
                  </span>
                )}
                <p className="text-sm font-semibold">{priceComparison.label}</p>
              </div>
            </div>
          )}
        </div>

        {/* サイズ選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            サイズ
          </label>
          <div className="grid grid-cols-3 gap-3">
            {sizeOptions.map((option) => {
              const isSelected = sizeStatus === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSizeStatus(option.value)}
                  className={`p-4 rounded-xl border-2 transition-all text-sm font-medium ${
                    isSelected
                      ? 'border-coral-500 bg-coral-50 text-coral-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* 感情選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            独り言
          </label>
          <div className="grid grid-cols-5 gap-2">
            {sentimentOptions.map((option) => {
              const isSelected = sentimentLevel === option.level
              return (
                <button
                  key={option.level}
                  type="button"
                  onClick={() => setSentimentLevel(option.level)}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center min-h-[88px] min-w-[44px] ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50 scale-105 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-3xl block mb-2">{option.emoji}</span>
                  <span className={`text-xs font-medium leading-tight text-center ${
                    isSelected ? 'text-emerald-700' : 'text-gray-600'
                  }`}>
                    {option.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ひとこと */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            ひとこと（任意・20文字まで）
          </label>
          <input
            type="text"
            value={comment}
            onChange={(e) => {
              if (e.target.value.length <= 20) {
                setComment(e.target.value)
              }
            }}
            placeholder="例：今日は特売日だった！"
            maxLength={20}
            className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all"
          />
          <p className="text-xs text-gray-500 mt-1 text-right">
            {comment.length}/20文字
          </p>
        </div>

        {/* 送信ボタン */}
        <button
          type="submit"
          disabled={isSubmitting || !userUuid}
          className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl shadow-lg transition-all"
        >
          {isSubmitting ? '保存中...' : '記録する'}
        </button>

        {submitSuccess && (
          <div className="p-6 bg-emerald-50 border-2 border-emerald-200 rounded-xl text-emerald-700 text-center animate-bounce">
            <p className="text-lg font-bold mb-1">記録完了！✨</p>
            <p className="text-sm">地域の知恵に貢献しました</p>
          </div>
        )}
        </form>

        {/* じぶんの最近の記録 */}
        <MyPosts userUuid={userUuid} refreshKey={refreshKey} areaStats={areaStats} />

        {/* みんなの最近の予報 */}
        <RecentForecast refreshKey={refreshKey} />

        {/* 広告バナー（コンテンツ間） - 環境変数が設定されている場合のみ表示 */}
        {process.env.NEXT_PUBLIC_ADSENSE_SLOT_CONTENT && (
          <div className="mt-8">
            <AdBanner 
              adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CONTENT}
              className="w-full"
              format="auto"
            />
          </div>
        )}

        {/* ソーシャルシェア - 控えめに配置 */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <SocialShare />
        </div>
      </div>
    </main>
  )
}
