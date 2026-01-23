'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getItemStats, ItemStats } from '../actions_new'
import { RegionSelector, RegionData } from '../components/RegionSelector'
import { DEFAULT_REGION } from '../data/regions'
import { DEFAULT_ITEMS } from '../data/defaultItems'
import { AreaSelector } from '../components/AreaSelector'
import Image from 'next/image'
import { Star, Search } from 'lucide-react'

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
  const defaultItemStats = DEFAULT_ITEMS.map(defaultItem => {
    // 食材名が一致する最初の統計を取得（単位は問わない）
    return itemStats.find(
      stat => stat.item_name === defaultItem.name
    )
  }).filter(Boolean) as ItemStats[]

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
        {defaultItemStats.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">主要食材</h2>
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
        )}

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
}: {
  stat: ItemStats
  emoji?: string
  onToggleFavorite: () => void
  isFavorite: boolean
}) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {emoji && <span className="text-2xl">{emoji}</span>}
          <h3 className="font-bold text-gray-900">{stat.item_name}</h3>
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
        <span>更新：{formatDate(stat.latest_date)}</span>
        <span>（投稿 {stat.count}件）</span>
      </div>
    </div>
  )
}
