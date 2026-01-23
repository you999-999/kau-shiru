'use server'

import { createServerClient } from '@/utils/supabase/server'

// 新しい仕様のPostData
export interface PostDataNew {
  item_name: string // 食材名（必須）
  price: number // 価格（必須）
  category: '肉' | '魚' | '野菜' | 'その他' // カテゴリ（必須）
  quantity?: number // 量（任意）
  unit?: string // 単位（任意）
  region_big: string // 地域（必須）
  region_pref?: string // 都道府県（任意）
  region_city?: string // 市町村（任意）
  user_uuid: string
}

// 新しい投稿を保存
export async function savePostNew(data: PostDataNew) {
  try {
    const supabase = createServerClient()
    
    const insertData: any = {
      item_name: data.item_name,
      price: data.price,
      category_new: data.category,
      user_uuid: data.user_uuid,
      region_big: data.region_big,
      area_group: data.region_city || data.region_pref || data.region_big || '中部',
    }
    
    // 任意項目
    if (data.quantity !== undefined && data.quantity !== null) {
      insertData.quantity = data.quantity
    }
    if (data.unit) {
      insertData.unit = data.unit
    }
    if (data.region_pref) {
      insertData.region_pref = data.region_pref
    }
    if (data.region_city) {
      insertData.region_city = data.region_city
    }

    const { error } = await supabase
      .from('posts')
      .insert(insertData)

    if (error) {
      // カラムが存在しないエラー（42703）の場合は後方互換性のため旧カラムで再試行
      if (error.code === '42703') {
        // 旧スキーマに合わせて変換
        const fallbackData: any = {
          item_category: data.category === '肉' ? '肉' : data.category === '野菜' ? '野菜' : 'その他',
          price: data.price,
          is_tax_included: true,
          size_status: 'normal',
          sentiment_level: 3,
          user_uuid: data.user_uuid,
          area_group: data.region_city || data.region_pref || data.region_big || '愛知西部',
        }
        const { error: retryError } = await supabase
          .from('posts')
          .insert(fallbackData)
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

// 食材ごとの集計データを取得
export interface ItemStats {
  item_name: string
  unit: string | null
  min_price: number
  max_price: number
  count: number
  latest_date: string
  region_big?: string
  region_pref?: string
  region_city?: string
}

export async function getItemStats(
  region?: { big?: string; prefecture?: string; city?: string }
): Promise<{ success: boolean; data: ItemStats[]; error?: string }> {
  try {
    const supabase = createServerClient()
    
    // 直近30日間のデータを取得
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    let query = supabase
      .from('posts')
      .select('item_name, price, unit, created_at, region_big, region_pref, region_city, category_new')
      .gte('created_at', thirtyDaysAgo.toISOString())

    // 地域フィルタリング（優先順位：市町村 → 都道府県 → 地域）
    try {
      if (region?.city) {
        query = query.eq('region_city', region.city)
      } else if (region?.prefecture) {
        query = query.eq('region_pref', region.prefecture)
      } else if (region?.big) {
        query = query.eq('region_big', region.big)
      } else {
        query = query.eq('region_big', '中部')
      }
    } catch (e) {
      // カラムが存在しない場合はarea_groupでフィルタリング
      query = query.eq('area_group', '愛知西部')
    }

    const { data, error } = await query

    if (error) {
      // カラムが存在しないエラーの場合は空配列を返す
      if (error.code === '42703' || error.code === 'PGRST116') {
        return { success: true, data: [] }
      }
      throw error
    }

    if (!data || data.length === 0) {
      return { success: true, data: [] }
    }

    // 食材名＋単位＋地域階層でグループ化
    const statsMap: Record<string, {
      prices: number[]
      latest_date: string
      region_big?: string
      region_pref?: string
      region_city?: string
    }> = {}

    data.forEach((post: any) => {
      // item_nameがnullの場合はスキップ（旧データ）
      if (!post.item_name) return
      
      // グループ化キー: 食材名 + 単位 + 地域階層
      const unit = post.unit || 'なし'
      const regionKey = post.region_city || post.region_pref || post.region_big || ''
      const key = `${post.item_name}::${unit}::${regionKey}`
      
      if (!statsMap[key]) {
        statsMap[key] = {
          prices: [],
          latest_date: post.created_at,
          region_big: post.region_big,
          region_pref: post.region_pref,
          region_city: post.region_city,
        }
      }
      
      statsMap[key].prices.push(post.price)
      
      // 最新日付を更新
      if (new Date(post.created_at) > new Date(statsMap[key].latest_date)) {
        statsMap[key].latest_date = post.created_at
      }
    })

    // 集計結果を配列に変換
    const stats: ItemStats[] = Object.entries(statsMap).map(([key, data]) => {
      const [item_name, unit, _regionKey] = key.split('::')
      return {
        item_name,
        unit: unit === 'なし' ? null : unit,
        min_price: Math.min(...data.prices),
        max_price: Math.max(...data.prices),
        count: data.prices.length,
        latest_date: data.latest_date,
        region_big: data.region_big,
        region_pref: data.region_pref,
        region_city: data.region_city,
      }
    })

    return { success: true, data: stats }
  } catch (error) {
    console.error('Error fetching item stats:', error)
    return { success: false, data: [], error: String(error) }
  }
}

// 特定の食材の詳細を取得（お気に入り用）
export async function getItemDetail(
  itemName: string,
  unit: string | null,
  region?: { big?: string; prefecture?: string; city?: string }
): Promise<{ success: boolean; data: ItemStats | null; error?: string }> {
  try {
    const result = await getItemStats(region)
    if (!result.success) {
      return result
    }

    const item = result.data.find(
      (stat) => stat.item_name === itemName && stat.unit === unit
    )

    return { success: true, data: item || null }
  } catch (error) {
    console.error('Error fetching item detail:', error)
    return { success: false, data: null, error: String(error) }
  }
}
