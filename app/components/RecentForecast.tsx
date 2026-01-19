'use client'

import { useEffect, useState } from 'react'
import { getRecentPosts, addReaction, removeReaction, getReactionCounts, getUserReactions } from '../actions'
import { Egg, Milk, Beef, Carrot, Package, ThumbsUp } from 'lucide-react'
import { useUserUuid } from '@/hooks/useUserUuid'

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
  その他: Package,
}

const sizeLabels = {
  normal: 'いつも通り',
  less: '少し減った',
  tiny: 'だいぶ減った',
}

const sentimentEmojis = ['😊', '🙂', '😐', '😕', '😞']

interface RecentForecastProps {
  refreshKey?: number
}

export function RecentForecast({ refreshKey = 0 }: RecentForecastProps) {
  const userUuid = useUserUuid()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({})
  const [userReactions, setUserReactions] = useState<string[]>([])
  const [reactingIds, setReactingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      const result = await getRecentPosts()
      if (result.success && result.data) {
        const postsData = result.data as Post[]
        setPosts(postsData)
        
        // リアクション数を取得
        const postIds = postsData.map(p => p.id)
        const [countsResult, reactionsResult] = await Promise.all([
          getReactionCounts(postIds),
          userUuid ? getUserReactions(userUuid, postIds) : Promise.resolve({ success: true, data: [] }),
        ])
        
        if (countsResult.success && countsResult.data) {
          setReactionCounts(countsResult.data)
        }
        
        if (reactionsResult.success && reactionsResult.data) {
          setUserReactions(reactionsResult.data)
        }
      }
      setLoading(false)
    }

    fetchPosts()
  }, [refreshKey, userUuid])

  const handleReaction = async (postId: string) => {
    if (!userUuid || reactingIds.has(postId)) return

    const isReacted = userReactions.includes(postId)
    setReactingIds(prev => new Set(prev).add(postId))

    if (isReacted) {
      // リアクションを削除
      const result = await removeReaction(postId, userUuid)
      if (result.success) {
        setUserReactions(prev => prev.filter(id => id !== postId))
        setReactionCounts(prev => ({
          ...prev,
          [postId]: Math.max(0, (prev[postId] || 1) - 1),
        }))
      }
    } else {
      // リアクションを追加
      const result = await addReaction(postId, userUuid)
      if (result.success) {
        setUserReactions(prev => [...prev, postId])
        setReactionCounts(prev => ({
          ...prev,
          [postId]: (prev[postId] || 0) + 1,
        }))
      }
    }

    setReactingIds(prev => {
      const next = new Set(prev)
      next.delete(postId)
      return next
    })
  }

  if (loading) {
    return (
      <div className="mt-8 p-6 bg-white rounded-2xl shadow-sm">
        <h2 className="text-xl font-bold mb-4 text-gray-800">みんなの最近の予報</h2>
        <p className="text-gray-500">読み込み中...</p>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="mt-8 p-6 bg-white rounded-2xl shadow-sm">
        <h2 className="text-xl font-bold mb-4 text-gray-800">みんなの最近の予報</h2>
        <p className="text-gray-500">まだ投稿がありません</p>
      </div>
    )
  }

  return (
    <div className="mt-8 p-8 bg-white rounded-2xl shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold mb-6 text-gray-800">みんなの最近の予報</h2>
      <div className="space-y-4">
        {posts.map((post) => {
          const Icon = categoryIcons[post.item_category as keyof typeof categoryIcons] || Package
          const displayPrice = post.is_tax_included
            ? post.price
            : Math.round(post.price * 1.08)
          
          return (
            <div
              key={post.id}
              className="p-5 bg-gray-50 rounded-xl border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Icon className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
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
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-xs text-gray-700 flex items-center justify-between gap-2">
                        <div className="flex-1">
                          <div className="absolute -top-1 left-4 w-2 h-2 bg-emerald-50 border-l border-b border-emerald-200 transform rotate-45"></div>
                          {post.comment}
                        </div>
                        <button
                          onClick={() => handleReaction(post.id)}
                          disabled={!userUuid || reactingIds.has(post.id)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                            userReactions.includes(post.id)
                              ? 'bg-emerald-500 text-white'
                              : 'bg-white border border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                          title="納得！"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          {reactionCounts[post.id] > 0 && (
                            <span>{reactionCounts[post.id]}</span>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                  {!post.comment && (
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={() => handleReaction(post.id)}
                        disabled={!userUuid || reactingIds.has(post.id)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                          userReactions.includes(post.id)
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white border border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        title="納得！"
                      >
                        <ThumbsUp className="w-3 h-3" />
                        {reactionCounts[post.id] > 0 && (
                          <span>{reactionCounts[post.id]}</span>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
