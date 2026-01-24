'use server'

import { createServerClient } from '@/utils/supabase/server'

export interface PostData {
  item_category: '卵' | '牛乳' | '肉' | '野菜' | '冷凍食品' | 'その他'
  price: number
  is_tax_included: boolean
  size_status: 'normal' | 'less' | 'tiny'
  sentiment_level: number
  user_uuid: string
  comment?: string
  region_big: string
  region_pref?: string
  region_city?: string
}

export async function savePost(data: PostData) {
  try {
    const supabase = createServerClient()
    
    // カラムが存在しない場合でも動作するように、地域情報を条件付きで追加
    const insertData: any = {
      item_category: data.item_category,
      price: data.price,
      is_tax_included: data.is_tax_included,
      size_status: data.size_status,
      sentiment_level: data.sentiment_level,
      user_uuid: data.user_uuid,
      area_group: data.region_city || data.region_pref || data.region_big || '愛知西部',
    }
    
    if (data.comment) {
      insertData.comment = data.comment
    }

    // 地域カラムを追加（エラーが発生した場合は無視）
    if (data.region_big) insertData.region_big = data.region_big
    if (data.region_pref) insertData.region_pref = data.region_pref
    if (data.region_city) insertData.region_city = data.region_city

    const { error } = await supabase
      .from('posts')
      .insert(insertData)

    if (error) {
      // カラムが存在しないエラー（42703）の場合は地域情報を除外して再試行
      if (error.code === '42703') {
        delete insertData.region_big
        delete insertData.region_pref
        delete insertData.region_city
        const { error: retryError } = await supabase
          .from('posts')
          .insert(insertData)
        if (retryError) throw retryError
      } else {
        throw error
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error saving post:', error)
    return { success: false, error: String(error) }
  }
}

export async function getRecentPosts(region?: { big?: string; prefecture?: string; city?: string }) {
  try {
    const supabase = createServerClient()
    let query = supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3)

    // 地域フィルタリング（優先順位：市町村 → 都道府県 → 地域）
    // カラムが存在しない場合はarea_groupでフィルタリング（後方互換性）
    try {
      if (region?.city) {
        query = query.eq('region_city', region.city)
      } else if (region?.prefecture) {
        query = query.eq('region_pref', region.prefecture)
      } else if (region?.big) {
        query = query.eq('region_big', region.big)
      } else {
        // デフォルト：中部（カラムが存在しない場合はarea_groupでフィルタ）
        query = query.eq('area_group', '愛知西部')
      }
    } catch (e) {
      // カラムが存在しない場合はarea_groupでフィルタリング
      query = query.eq('area_group', '愛知西部')
    }

    const { data, error } = await query

    if (error) {
      // カラムが存在しないエラーの場合はarea_groupで再試行
      if (error.code === '42703') {
        const fallbackQuery = supabase
          .from('posts')
          .select('*')
          .eq('area_group', '愛知西部')
          .order('created_at', { ascending: false })
          .limit(3)
        const { data: fallbackData, error: fallbackError } = await fallbackQuery
        if (fallbackError) throw fallbackError
        return { success: true, data: fallbackData || [] }
      }
      throw error
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching posts:', error)
    return { success: false, data: [], error: String(error) }
  }
}

export async function getMyPosts(userUuid: string) {
  try {
    if (!userUuid) {
      return { success: true, data: [] }
    }

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_uuid', userUuid)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching my posts:', error)
    return { success: false, data: [], error: String(error) }
  }
}

export async function deletePost(postId: string, userUuid: string) {
  try {
    if (!userUuid) {
      return { success: false, error: 'User UUID is required' }
    }

    const supabase = createServerClient()
    
    // まず、投稿がこのユーザーのものか確認
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('user_uuid')
      .eq('id', postId)
      .single()

    if (fetchError) throw fetchError

    if (post.user_uuid !== userUuid) {
      return { success: false, error: 'Unauthorized' }
    }

    // 削除実行
    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('user_uuid', userUuid)

    if (deleteError) throw deleteError

    return { success: true }
  } catch (error) {
    console.error('Error deleting post:', error)
    return { success: false, error: String(error) }
  }
}

export interface CategoryStats {
  item_category: string
  avg_price: number
  min_price: number
  max_price: number
  count: number
}

export interface PriceTrend {
  date: string
  avg_price: number
}

export async function getAreaStats(region?: { big?: string; prefecture?: string; city?: string }) {
  try {
    const supabase = createServerClient()
    
    // 直近7日間のデータを取得
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    let query = supabase
      .from('posts')
      .select('item_category, price, is_tax_included')
      .gte('created_at', sevenDaysAgo.toISOString())

    // 地域フィルタリング（優先順位：市町村 → 都道府県 → 地域）
    // カラムが存在しない場合はarea_groupでフィルタリング（後方互換性）
    try {
      if (region?.city) {
        query = query.eq('region_city', region.city)
      } else if (region?.prefecture) {
        query = query.eq('region_pref', region.prefecture)
      } else if (region?.big) {
        query = query.eq('region_big', region.big)
      } else {
        // デフォルト：中部（カラムが存在しない場合はarea_groupでフィルタ）
        query = query.eq('area_group', '愛知西部')
      }
    } catch (e) {
      // カラムが存在しない場合はarea_groupでフィルタリング
      query = query.eq('area_group', '愛知西部')
    }

    let result = await query
    let data = result.data

    if (result.error) {
      // カラムが存在しないエラー（42703）の場合はarea_groupで再試行
      if (result.error.code === '42703') {
        const fallbackQuery = supabase
          .from('posts')
          .select('item_category, price, is_tax_included')
          .eq('area_group', '愛知西部')
          .gte('created_at', sevenDaysAgo.toISOString())
        const fallbackResult = await fallbackQuery
        if (fallbackResult.error) throw fallbackResult.error
        data = fallbackResult.data
      } else {
        throw result.error
      }
    }

    // カテゴリごとに統計を計算
    const statsMap: Record<string, { prices: number[]; count: number }> = {}
    
    if (data) {
      data.forEach((post) => {
        // すべて税込価格に統一
        const taxIncludedPrice = post.is_tax_included
          ? post.price
          : Math.round(post.price * 1.08)
        
        if (!statsMap[post.item_category]) {
          statsMap[post.item_category] = { prices: [], count: 0 }
        }
        
        statsMap[post.item_category].prices.push(taxIncludedPrice)
        statsMap[post.item_category].count++
      })
    }

    // 各カテゴリの平均、最小、最大を計算
    const stats: CategoryStats[] = Object.entries(statsMap).map(([category, data]) => {
      const prices = data.prices
      const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
      const minPrice = Math.min(...prices)
      const maxPrice = Math.max(...prices)
      
      return {
        item_category: category,
        avg_price: avgPrice,
        min_price: minPrice,
        max_price: maxPrice,
        count: data.count,
      }
    })

    return { success: true, data: stats }
  } catch (error) {
    console.error('Error fetching area stats:', error)
    return { success: false, data: [], error: String(error) }
  }
}

// カテゴリごとの直近7日間の価格推移を取得
export async function getPriceTrends(region?: { big?: string; prefecture?: string; city?: string }) {
  try {
    const supabase = createServerClient()
    
    // 直近7日間のデータを取得
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    let query = supabase
      .from('posts')
      .select('item_category, price, is_tax_included, created_at')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: true })

    // 地域フィルタリング（優先順位：市町村 → 都道府県 → 地域）
    // カラムが存在しない場合はarea_groupでフィルタリング（後方互換性）
    if (region?.city) {
      query = query.eq('region_city', region.city)
    } else if (region?.prefecture) {
      query = query.eq('region_pref', region.prefecture)
    } else if (region?.big) {
      query = query.eq('region_big', region.big)
    } else {
      // デフォルト：中部（カラムが存在しない場合はarea_groupでフィルタ）
      query = query.eq('area_group', '愛知西部')
    }

    let result = await query
    let data = result.data

    if (result.error) {
      // カラムが存在しないエラー（42703）の場合はarea_groupで再試行
      if (result.error.code === '42703') {
        const fallbackQuery = supabase
          .from('posts')
          .select('item_category, price, is_tax_included, created_at')
          .eq('area_group', '愛知西部')
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: true })
        const fallbackResult = await fallbackQuery
        if (fallbackResult.error) throw fallbackResult.error
        data = fallbackResult.data
      } else {
        throw result.error
      }
    }

    // カテゴリごと、日付ごとにグループ化
    const trendsMap: Record<string, Record<string, number[]>> = {}
    
    if (data) {
      data.forEach((post) => {
      const taxIncludedPrice = post.is_tax_included
        ? post.price
        : Math.round(post.price * 1.08)
      
      const date = new Date(post.created_at).toISOString().split('T')[0]
      
      if (!trendsMap[post.item_category]) {
        trendsMap[post.item_category] = {}
      }
      
      if (!trendsMap[post.item_category][date]) {
        trendsMap[post.item_category][date] = []
      }
      
      trendsMap[post.item_category][date].push(taxIncludedPrice)
      })
    }

    // 各カテゴリの日別平均価格を計算
    const trends: Record<string, PriceTrend[]> = {}
    
    Object.entries(trendsMap).forEach(([category, dates]) => {
      trends[category] = Object.entries(dates).map(([date, prices]) => ({
        date,
        avg_price: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      })).sort((a, b) => a.date.localeCompare(b.date))
    })

    return { success: true, data: trends }
  } catch (error) {
    console.error('Error fetching price trends:', error)
    return { success: false, data: {}, error: String(error) }
  }
}

// リアクション（いいね）の追加
export async function addReaction(postId: string, userUuid: string) {
  try {
    if (!userUuid) {
      return { success: false, error: 'User UUID is required' }
    }

    const supabase = createServerClient()
    const { error } = await supabase
      .from('reactions')
      .insert({
        post_id: postId,
        user_uuid: userUuid,
      })

    if (error) {
      // 既にリアクションがある場合は無視
      if (error.code === '23505') {
        return { success: true }
      }
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error('Error adding reaction:', error)
    return { success: false, error: String(error) }
  }
}

// リアクションの削除
export async function removeReaction(postId: string, userUuid: string) {
  try {
    if (!userUuid) {
      return { success: false, error: 'User UUID is required' }
    }

    const supabase = createServerClient()
    const { error } = await supabase
      .from('reactions')
      .delete()
      .eq('post_id', postId)
      .eq('user_uuid', userUuid)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error removing reaction:', error)
    return { success: false, error: String(error) }
  }
}

// 投稿ごとのリアクション数を取得
export async function getReactionCounts(postIds: string[]) {
  try {
    if (postIds.length === 0) {
      return { success: true, data: {} }
    }

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('reactions')
      .select('post_id')
      .in('post_id', postIds)

    if (error) throw error

    // 投稿IDごとにカウント
    const counts: Record<string, number> = {}
    if (data) {
      data.forEach((reaction) => {
        counts[reaction.post_id] = (counts[reaction.post_id] || 0) + 1
      })
    }

    return { success: true, data: counts }
  } catch (error) {
    console.error('Error fetching reaction counts:', error)
    return { success: false, data: {}, error: String(error) }
  }
}

// ユーザーがリアクションした投稿IDのリストを取得
export async function getUserReactions(userUuid: string, postIds: string[]) {
  try {
    if (!userUuid || postIds.length === 0) {
      return { success: true, data: [] }
    }

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('reactions')
      .select('post_id')
      .eq('user_uuid', userUuid)
      .in('post_id', postIds)

    if (error) throw error

    return { success: true, data: (data || []).map(r => r.post_id) }
  } catch (error) {
    console.error('Error fetching user reactions:', error)
    return { success: false, data: [], error: String(error) }
  }
}

// 今日のひとことを取得
export interface DailyQuote {
  id: string
  content: string
  item_name?: string | null
  price?: number | null
  quantity?: number | null
  unit?: string | null
  created_at: string
}

export async function getTodayQuote(region?: { big?: string; prefecture?: string; city?: string }): Promise<{ success: boolean; data: DailyQuote | null; error?: string }> {
  try {
    // JST（日本標準時）で今日の00:00と明日の00:00を計算
    const now = new Date()
    const jstOffset = 9 * 60 * 60 * 1000 // JSTはUTC+9
    const jstNow = new Date(now.getTime() + jstOffset)
    
    // 今日の00:00（JST）
    const todayStart = new Date(jstNow)
    todayStart.setUTCHours(0, 0, 0, 0)
    const todayStartUTC = new Date(todayStart.getTime() - jstOffset)
    
    // 明日の00:00（JST）
    const tomorrowStart = new Date(todayStart)
    tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1)
    const tomorrowStartUTC = new Date(tomorrowStart.getTime() - jstOffset)

    const supabase = createServerClient()
    
    // まず、地域カラムを含むSELECTを試行
    let query: any = supabase
      .from('daily_quotes')
      .select('id, content, item_name, price, quantity, unit, created_at, region_big, region_pref, region_city')
      .gte('created_at', todayStartUTC.toISOString())
      .lt('created_at', tomorrowStartUTC.toISOString())
    
    // 地域フィルタリング（優先順位：市町村 → 都道府県 → 地域）
    if (region?.city) {
      query = query.eq('region_city', region.city)
    } else if (region?.prefecture) {
      query = query.eq('region_pref', region.prefecture)
    } else if (region?.big) {
      query = query.eq('region_big', region.big)
    }
    
    let { data, error } = await query

    // カラムが存在しないエラー（PGRST204）の場合は、地域カラムなしで再試行
    if (error && (error.code === 'PGRST204' || error.code === '42703' || error.message?.includes('column') || error.message?.includes('Could not find'))) {
      // 地域カラムなしで再試行
      const retryQuery = supabase
        .from('daily_quotes')
        .select('id, content, item_name, price, quantity, unit, created_at')
        .gte('created_at', todayStartUTC.toISOString())
        .lt('created_at', tomorrowStartUTC.toISOString())
      
      const retryResult = await retryQuery
      if (retryResult.error) {
        // テーブルが存在しない場合（PGRST205エラー）は静かに処理
        if (retryResult.error.code === 'PGRST205' || retryResult.error.message?.includes('Could not find the table')) {
          return { success: true, data: null }
        }
        throw retryResult.error
      }
      data = retryResult.data
      error = null
    } else if (error) {
      // テーブルが存在しない場合（PGRST205エラー）は静かに処理
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        return { success: true, data: null }
      }
      throw error
    }

    // データがある場合はランダムで1件選択
    if (data && data.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.length)
      return { success: true, data: data[randomIndex] as DailyQuote }
    }

    return { success: true, data: null }
  } catch (error) {
    // その他のエラーも静かに処理（テーブル未作成時など）
    return { success: true, data: null }
  }
}
