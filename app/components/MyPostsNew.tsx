'use client'

import { useEffect, useState } from 'react'
import { getMyPostsNew, deletePostNew, type PostNew } from '../actions_new'
import { Trash2, Calendar, MapPin } from 'lucide-react'
import { formatRegionDisplay } from '../utils/regionDisplay'

interface MyPostsNewProps {
  userUuid: string | null
  refreshKey?: number
}

export function MyPostsNew({ userUuid, refreshKey = 0 }: MyPostsNewProps) {
  const [posts, setPosts] = useState<PostNew[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadData = async () => {
    if (!userUuid) {
      setPosts([])
      setLoading(false)
      return
    }

    setLoading(true)
    const result = await getMyPostsNew(userUuid)
    
    if (result.success && result.data) {
      setPosts(result.data)
    }
    
    setLoading(false)
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userUuid])

  useEffect(() => {
    if (refreshKey > 0 && userUuid) {
      loadData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, userUuid])

  const handleDelete = async (postId: string) => {
    if (!userUuid) return
    
    if (!confirm('この記録を削除しますか？')) {
      return
    }

    setDeletingId(postId)
    const result = await deletePostNew(postId, userUuid)
    setDeletingId(null)

    if (result.success) {
      loadData()
    } else {
      alert('削除に失敗しました。もう一度お試しください。')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  if (!userUuid) {
    return null
  }

  if (loading) {
    return (
      <div className="mb-6 p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-gray-800 mb-4">買って記録した一覧</h2>
        <p className="text-gray-600 text-sm">読み込み中...</p>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="mb-6 p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-gray-800 mb-4">買って記録した一覧</h2>
        <p className="text-gray-600 text-sm">まだ記録がありません</p>
      </div>
    )
  }

  return (
    <div className="mb-6 p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
      <h2 className="text-lg font-bold text-gray-800 mb-4">買って記録した一覧</h2>
      <div className="space-y-3">
        {posts.map((post) => (
          <div
            key={post.id}
            className="p-4 bg-gray-50 rounded-xl border border-gray-200"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-gray-900">{post.item_name}</span>
                  <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                    {post.category_new}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <span className="text-lg font-bold text-gray-900">{post.price.toLocaleString()}円</span>
                  {post.quantity && post.unit && (
                    <span className="text-xs">
                      {post.quantity}{post.unit}
                    </span>
                  )}
                  {!post.quantity && post.unit && (
                    <span className="text-xs">
                      {post.unit}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                  {(post.region_big || post.region_pref || post.region_city) && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{formatRegionDisplay({
                        region_big: post.region_big || undefined,
                        region_pref: post.region_pref || undefined,
                        region_city: post.region_city || undefined,
                      })}</span>
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
          </div>
        ))}
      </div>
    </div>
  )
}
