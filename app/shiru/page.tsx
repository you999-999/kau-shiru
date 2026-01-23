'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getItemStats, ItemStats } from '../actions_new'
import { RegionSelector, RegionData } from '../components/RegionSelector'
import { DEFAULT_REGION } from '../data/regions'
import { DEFAULT_ITEMS } from '../data/defaultItems'
import { REFERENCE_PRICES } from '../data/referencePrices'
import { AreaSelector } from '../components/AreaSelector'
import Image from 'next/image'
import { Star, Search, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

const FAVORITES_STORAGE_KEY = 'kau_shiru_favorites'

interface Favorite {
  item_name: string
  unit: string | null
}

export default function ShiruPage() {
  const router = useRouter()
  const [selectedRegion, setSelectedRegion] = useState<RegionData>(DEFAULT_REGION)
  const [itemStats, setItemStats] = useState<ItemStats[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')

  // お気に入りを読み込み
  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY)
    if (stored) {
      try {
        setFavorites(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse favorites:', e)
      }
    }
  }, [])

  // お気に入りを保存
  const saveFavorites = (newFavorites: Favorite[]) => {
    setFavorites(newFavorites)
    if (typeof window !== 'undefined') {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites))
    }
  }

  // お気に入りに追加
  const addFavorite = (itemName: string, unit: string | null) => {
    const newFavorite: Favorite = { item_name: itemName, unit }
    if (!favorites.some(f => f.item_name === itemName && f.unit === unit)) {
      saveFavorites([...favorites, newFavorite])
    }
  }

  // お気に入りから削除
  const removeFavorite = (itemName: string, unit: string | null) => {
    saveFavorites(favorites.filter(f => !(f.item_name === itemName && f.unit === unit)))
  }

  // データ取得
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const result = await getItemStats(selectedRegion)
      if (result.success) {
        setItemStats(result.data)
      }
      setLoading(false)
    }
    loadData()
  }, [selectedRegion])

  // 日付フォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  // 食材名で検索フィルタリング
  const filteredStats = itemStats.filter(stat =>
    stat.item_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // お気に入りの統計を取得
  const favoriteStats = favorites.map(fav => {
    return itemStats.find(
      stat => stat.item_name === fav.item_name && stat.unit === fav.unit
    )
  }).filter(Boolean) as ItemStats[]

  // 主要食材の統計を取得（単位は問わない）
  // データがない場合は参考相場を表示
  const defaultItemStats = DEFAULT_ITEMS.map(defaultItem => {
    // 食材名が一致する最初の統計を取得（単位は問わない）
    const stat = itemStats.find(
      s => s.item_name === defaultItem.name
    )
    
    // データがない場合は参考相場を使用
    if (!stat) {
      const refPrice = REFERENCE_PRICES.find(r => r.item_name === defaultItem.name)
      if (refPrice) {
        return {
          item_name: refPrice.item_name,
          unit: refPrice.unit,
          min_price: refPrice.min_price,
          max_price: refPrice.max_price,
          count: 0,
          latest_date: new Date().toISOString(),
          isReference: true, // 参考データであることを示すフラグ
        } as any
      }
    }
    
    return stat
  }).filter(Boolean) as (ItemStats & { isReference?: boolean })[]

  return (
    <main className="min-h-screen p-4 pb-8 bg-gray-50">
      <div className="max-w-md mx-auto">
        {/* ヘッダー */}
        <div className="mb-6 pt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                しる
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
          <p className="text-sm text-gray-600">みんなの投稿から相場を知る</p>
        </div>

        {/* 地域選択 */}
        <div className="mb-6 p-4 bg-white rounded-2xl shadow-sm border border-gray-200">
          <RegionSelector value={selectedRegion} onChange={setSelectedRegion} />
        </div>

        {/* 検索 */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="食材名で検索..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* お気に入り */}
        {favorites.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              いつもの食材
            </h2>
            <div className="space-y-3">
              {favoriteStats.map((stat) => (
                <ItemCard
                  key={`${stat.item_name}-${stat.unit}`}
                  stat={stat}
                  onToggleFavorite={() => removeFavorite(stat.item_name, stat.unit)}
                  isFavorite={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* 主要食材 */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">主要食材</h2>
          
          {/* データがない場合のメッセージ */}
          {itemStats.length === 0 && (
            <div className="mb-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-900 mb-1">
                    まだ相場情報がありません
                  </p>
                  <p className="text-xs text-amber-700 mb-3">
                    最初の投稿者になりましょう！あなたの投稿が、みんなの買い物に役立ちます。
                  </p>
                  <button
                    onClick={() => router.push('/kau')}
                    className="text-xs bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    最初の投稿をする →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 参考相場の注意書き */}
          {itemStats.length === 0 && defaultItemStats.length > 0 && (
            <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-600">
                ※ 以下は全国平均の参考価格です。実際の相場は地域によって異なります。
              </p>
            </div>
          )}

          <div className="space-y-3">
            {defaultItemStats.map((stat) => {
              const defaultItem = DEFAULT_ITEMS.find(item => item.name === stat.item_name)
              const isFavorite = favorites.some(
                f => f.item_name === stat.item_name && f.unit === stat.unit
              )
              return (
                <ItemCard
                  key={`${stat.item_name}-${stat.unit}`}
                  stat={stat}
                  emoji={defaultItem?.emoji}
                  isReference={stat.isReference}
                  onToggleFavorite={() => {
                    if (isFavorite) {
                      removeFavorite(stat.item_name, stat.unit)
                    } else {
                      addFavorite(stat.item_name, stat.unit)
                    }
                  }}
                  isFavorite={isFavorite}
                />
              )
            })}
          </div>
        </div>

        {/* 検索結果 */}
        {searchQuery && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">検索結果</h2>
            {loading ? (
              <p className="text-gray-500">読み込み中...</p>
            ) : filteredStats.length > 0 ? (
              <div className="space-y-3">
                {filteredStats.map((stat) => {
                  const isFavorite = favorites.some(
                    f => f.item_name === stat.item_name && f.unit === stat.unit
                  )
                  return (
                    <ItemCard
                      key={`${stat.item_name}-${stat.unit}`}
                      stat={stat}
                      onToggleFavorite={() => {
                        if (isFavorite) {
                          removeFavorite(stat.item_name, stat.unit)
                        } else {
                          addFavorite(stat.item_name, stat.unit)
                        }
                      }}
                      isFavorite={isFavorite}
                    />
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500">該当する食材が見つかりませんでした</p>
            )}
          </div>
        )}

        {/* 全食材（検索なしの場合） */}
        {!searchQuery && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">みんなの投稿</h2>
            {loading ? (
              <p className="text-gray-500">読み込み中...</p>
            ) : filteredStats.length > 0 ? (
              <div className="space-y-3">
                {filteredStats.map((stat) => {
                  const isFavorite = favorites.some(
                    f => f.item_name === stat.item_name && f.unit === stat.unit
                  )
                  return (
                    <ItemCard
                      key={`${stat.item_name}-${stat.unit}`}
                      stat={stat}
                      onToggleFavorite={() => {
                        if (isFavorite) {
                          removeFavorite(stat.item_name, stat.unit)
                        } else {
                          addFavorite(stat.item_name, stat.unit)
                        }
                      }}
                      isFavorite={isFavorite}
                    />
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500">まだ投稿がありません</p>
            )}
          </div>
        )}

        {/* ナビゲーション */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => router.push('/kau')}
            className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-all"
          >
            ← かうページへ
          </button>
        </div>
      </div>
    </main>
  )
}

// 食材カードコンポーネント
function ItemCard({
  stat,
  emoji,
  onToggleFavorite,
  isFavorite,
  isReference,
}: {
  stat: ItemStats
  emoji?: string
  onToggleFavorite: () => void
  isFavorite: boolean
  isReference?: boolean
}) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  return (
    <div className={`bg-white rounded-xl p-4 border shadow-sm ${
      isReference ? 'border-amber-200 bg-amber-50/30' : 'border-gray-200'
    }`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {emoji && <span className="text-2xl">{emoji}</span>}
          <div>
            <h3 className="font-bold text-gray-900">{stat.item_name}</h3>
            {isReference && (
              <span className="text-xs text-amber-600 font-medium">（参考相場）</span>
            )}
          </div>
        </div>
        <button
          onClick={onToggleFavorite}
          className={`p-1 rounded-lg transition-all ${
            isFavorite ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'
          }`}
        >
          <Star className={`w-5 h-5 ${isFavorite ? 'fill-yellow-500' : ''}`} />
        </button>
      </div>
      
      {stat.unit ? (
        <div className="mb-2">
          <span className="text-sm text-gray-600">{stat.unit}</span>
        </div>
      ) : (
        <div className="mb-2">
          <span className="text-sm text-gray-500 italic">だいたい</span>
        </div>
      )}

      <div className="mb-2">
        <span className="text-lg font-bold text-gray-900">
          {stat.min_price}〜{stat.max_price}円
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        {isReference ? (
          <span className="text-amber-600">全国平均（参考）</span>
        ) : (
          <>
            <span>更新：{formatDate(stat.latest_date)}</span>
            <span>（投稿 {stat.count}件）</span>
          </>
        )}
      </div>
    </div>
  )
}
