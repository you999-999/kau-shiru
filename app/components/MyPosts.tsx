'use client'

import { useEffect, useState } from 'react'
import { getMyPosts, deletePost, CategoryStats } from '../actions'
import { Egg, Milk, Beef, Carrot, Snowflake, Package, Trash2, User } from 'lucide-react'

interface Post {
  id: string
  item_category: string
  price: number
  is_tax_included: boolean
  size_status: string
  sentiment_level: number
  created_at: string
  comment?: string
}

const categoryIcons = {
  卵: Egg,
  牛乳: Milk,
  肉: Beef,
  野菜: Carrot,
  冷凍食品: Snowflake,
  その他: Package,
}

const sizeLabels = {
  normal: 'いつも通り',
  less: '少し減った',
  tiny: 'だいぶ減った',
}

const sentimentEmojis = ['😊', '🙂', '😐', '😕', '😞']

interface MyPostsProps {
  userUuid: string | null
  refreshKey?: number
  areaStats: CategoryStats[]
}

export function MyPosts({ userUuid, refreshKey = 0, areaStats }: MyPostsProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // 価格比較ロジック（ポジティブな情報のみ）
  const getPriceComparison = (post: Post): { label: string; color: string; bgColor: string; badge?: string } | null => {
    const stat = areaStats.find(s => s.item_category === post.item_category)
    if (!stat) return null

    const displayPrice = post.is_tax_included
      ? post.price
      : Math.round(post.price * 1.08)
    
    const diff = displayPrice - stat.avg_price
    
    // 地域最安値より安い場合
    if (displayPrice <= stat.min_price) {
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

  const handleDelete = async (postId: string) => {
    if (!userUuid) return
    
    if (!confirm('この記録を削除しますか？')) {
      return
    }

    setDeletingId(postId)
    const result = await deletePost(postId, userUuid)
    setDeletingId(null)

    if (result.success) {
      // 削除成功後、リストを更新
      if (!userUuid) {
        setPosts([])
        setLoading(false)
        return
      }

      setLoading(true)
      const refreshResult = await getMyPosts(userUuid)
      if (refreshResult.success && refreshResult.data) {
        setPosts(refreshResult.data as Post[])
      }
      setLoading(false)
    } else {
      alert('削除に失敗しました。もう一度お試しください。')
    }
  }

  const loadData = async () => {
    if (!userUuid) {
      setPosts([])
      setLoading(false)
      return
    }

    setLoading(true)
    const result = await getMyPosts(userUuid)
    
    if (result.success && result.data) {
      setPosts(result.data as Post[])
    }
    
    setLoading(false)
  }

  // 初回ロード時のみ取得
  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userUuid]) // userUuidが変わった時のみ

  // 投稿成功時（refreshKeyが変更された時）のみ更新
  useEffect(() => {
    if (refreshKey > 0 && userUuid) {
      loadData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, userUuid])

  if (!userUuid) {
    return null
  }

  if (loading) {
    return (
      <div className="mt-6 p-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <User className="w-5 h-5 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">じぶんの最近の記録</h2>
        </div>
        <p className="text-gray-600">読み込み中...</p>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="mt-6 p-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <User className="w-5 h-5 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">じぶんの最近の記録</h2>
        </div>
        <p className="text-gray-600">まだ記録がありません</p>
      </div>
    )
  }

  return (
    <div className="mt-6 p-8 bg-white rounded-2xl shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-emerald-200 rounded-lg">
          <User className="w-5 h-5 text-emerald-700" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">じぶんの最近の記録</h2>
      </div>
      <div className="space-y-3">
        {posts.map((post) => {
          const Icon = categoryIcons[post.item_category as keyof typeof categoryIcons] || Package
          const displayPrice = post.is_tax_included
            ? post.price
            : Math.round(post.price * 1.08)
          const comparison = getPriceComparison(post)
          
          return (
            <div
              key={post.id}
              className="p-5 bg-white rounded-xl border border-emerald-200 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-800">{post.item_category}</span>
                      <span className="text-2xl">{sentimentEmojis[post.sentiment_level - 1]}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="text-lg font-bold text-gray-900">{displayPrice.toLocaleString()}円</span>
                      {!post.is_tax_included && <span className="text-xs text-gray-500 ml-1">(税込)</span>}
                      <span className="mx-2 text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{sizeLabels[post.size_status as keyof typeof sizeLabels]}</span>
                    </div>
                    {post.comment && (
                      <div className="mt-2 relative">
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-xs text-gray-700">
                          <div className="absolute -top-1 left-4 w-2 h-2 bg-emerald-50 border-l border-b border-emerald-200 transform rotate-45"></div>
                          {post.comment}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(post.id)}
                  disabled={deletingId === post.id}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title="削除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {comparison && (
                <div className={`mt-3 p-3 rounded-xl border-2 ${comparison.bgColor} ${comparison.color}`}>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {comparison.badge && (
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                        comparison.badge.includes('最安') 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-coral-500 text-white'
                      }`}>
                        {comparison.badge}
                      </span>
                    )}
                    <p className="text-xs font-semibold">{comparison.label}</p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
