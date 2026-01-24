'use server'

import { createServerClient } from '@/utils/supabase/server'

// 新しい仕様のPostData
export interface PostDataNew {
  item_name: string // 食材名（必須）
  price: number // 価格（必須）
  category: '肉' | '魚' | '野菜' | '冷凍食品' | 'その他' // カテゴリ（必須）
  is_tax_included: boolean // 税込みかどうか（必須）
  quantity?: number // 量（任意）
  unit?: string // 単位（任意）
  comment?: string // 一言（任意、最大20文字）
  region_big: string // 地域（必須）
  region_pref?: string // 都道府県（任意）
  region_city?: string // 市町村（任意）
  user_uuid: string
}

// 新しい投稿を保存
export async function savePostNew(data: PostDataNew) {
  try {
    const supabase = createServerClient()
    
    // 新スキーマのカテゴリを旧スキーマのitem_categoryにマッピング
    // 旧スキーマのCHECK制約: ('卵', '牛乳', '肉', '野菜', '冷凍食品', 'その他')
    const mapCategoryToOldSchema = (category: string): string => {
      switch (category) {
        case '肉':
          return '肉'
        case '野菜':
          return '野菜'
        case '冷凍食品':
          return '冷凍食品'
        case '魚':
          return 'その他' // '魚'は旧スキーマにないため'その他'にマッピング
        case 'その他':
          return 'その他'
        default:
          return 'その他'
      }
    }

    const insertData: any = {
      item_name: data.item_name,
      price: data.price,
      category_new: data.category,
      // 後方互換性のためitem_categoryも設定（NOT NULL制約対応）
      // 旧スキーマのCHECK制約に合わせてマッピング
      item_category: mapCategoryToOldSchema(data.category),
      is_tax_included: data.is_tax_included,
      // 後方互換性のためsize_statusとsentiment_levelも設定（NOT NULL制約対応）
      size_status: 'normal', // デフォルト値
      sentiment_level: 3, // デフォルト値（中間）
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
    // commentカラムが存在する場合のみ追加（PGRST204エラーを防ぐ）
    if (data.comment && data.comment.trim()) {
      // 最大20文字に制限
      insertData.comment = data.comment.trim().substring(0, 20)
    }

    const { data: insertedData, error } = await supabase
      .from('posts')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      // commentカラムが存在しないエラー（PGRST204）の場合はcommentを除外して再試行
      if (error.code === 'PGRST204' && error.message?.includes('comment')) {
        console.warn('comment column not found, retrying without comment')
        const retryData = { ...insertData }
        delete retryData.comment
        const { data: retryInsertedData, error: retryError } = await supabase
          .from('posts')
          .insert(retryData)
          .select()
          .single()
        if (retryError) {
          console.error('Retry insert error:', retryError)
          throw retryError
        }
        if (retryInsertedData) {
          console.log('Post saved successfully (without comment):', retryInsertedData)
        }
        // commentが入力されていた場合はdaily_quotesに保存を試みる（商品情報も一緒に）
        if (data.comment && data.comment.trim()) {
          try {
            const commentText = data.comment.trim().substring(0, 20)
            const quoteData: any = {
              content: commentText,
              item_name: data.item_name,
              price: data.price,
              region_big: data.region_big,
            }
            // 量と単位がある場合のみ追加
            if (data.quantity !== undefined && data.quantity !== null) {
              quoteData.quantity = data.quantity
            }
            if (data.unit) {
              quoteData.unit = data.unit
            }
            // 地域情報がある場合のみ追加
            if (data.region_pref) {
              quoteData.region_pref = data.region_pref
            }
            if (data.region_city) {
              quoteData.region_city = data.region_city
            }
            
            const { error: quoteError } = await supabase
              .from('daily_quotes')
              .insert(quoteData)
            
            if (quoteError) {
              // カラムが存在しないエラー（PGRST204）の場合は、地域カラムなしで再試行
              if (quoteError.code === 'PGRST204' || quoteError.code === '42703' || quoteError.message?.includes('column') || quoteError.message?.includes('Could not find')) {
                const retryQuoteData: any = {
                  content: commentText,
                  item_name: data.item_name,
                  price: data.price,
                }
                // 量と単位がある場合のみ追加
                if (data.quantity !== undefined && data.quantity !== null) {
                  retryQuoteData.quantity = data.quantity
                }
                if (data.unit) {
                  retryQuoteData.unit = data.unit
                }
                
                const { error: retryError } = await supabase
                  .from('daily_quotes')
                  .insert(retryQuoteData)
                
                if (retryError) {
                  console.warn('Failed to save daily quote (retry):', retryError)
                } else {
                  console.log('Daily quote saved successfully (without region columns)')
                }
              } else {
                console.warn('Failed to save daily quote:', quoteError)
              }
            } else {
              console.log('Daily quote saved successfully')
            }
          } catch (quoteErr) {
            console.warn('Error saving daily quote:', quoteErr)
          }
        }
        return { success: true }
      }
      // カラムが存在しないエラー（42703）の場合は後方互換性のため旧カラムで再試行
      if (error.code === '42703') {
        console.warn('New schema columns not found, using fallback schema')
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
        if (retryError) {
          console.error('Fallback insert error:', retryError)
          throw retryError
        }
        console.log('Post saved successfully (fallback schema)')
        return { success: true }
      } else {
        console.error('Insert error:', error)
        throw error
      }
    }

    if (insertedData) {
      console.log('Post saved successfully:', insertedData)
      
      // 一言が入力されている場合、daily_quotesテーブルにも保存（商品情報も一緒に）
      if (data.comment && data.comment.trim()) {
        try {
          const commentText = data.comment.trim().substring(0, 20)
          const quoteData: any = {
            content: commentText,
            item_name: data.item_name,
            price: data.price,
            region_big: data.region_big,
          }
          // 量と単位がある場合のみ追加
          if (data.quantity !== undefined && data.quantity !== null) {
            quoteData.quantity = data.quantity
          }
          if (data.unit) {
            quoteData.unit = data.unit
          }
          // 地域情報がある場合のみ追加
          if (data.region_pref) {
            quoteData.region_pref = data.region_pref
          }
          if (data.region_city) {
            quoteData.region_city = data.region_city
          }
          
          const { error: quoteError } = await supabase
            .from('daily_quotes')
            .insert(quoteData)
          
          if (quoteError) {
            // カラムが存在しないエラー（PGRST204）の場合は、地域カラムなしで再試行
            if (quoteError.code === 'PGRST204' || quoteError.code === '42703' || quoteError.message?.includes('column') || quoteError.message?.includes('Could not find')) {
              const retryQuoteData: any = {
                content: commentText,
                item_name: data.item_name,
                price: data.price,
              }
              // 量と単位がある場合のみ追加
              if (data.quantity !== undefined && data.quantity !== null) {
                retryQuoteData.quantity = data.quantity
              }
              if (data.unit) {
                retryQuoteData.unit = data.unit
              }
              
              const { error: retryError } = await supabase
                .from('daily_quotes')
                .insert(retryQuoteData)
              
              if (retryError) {
                // daily_quotesテーブルが存在しない場合などはエラーを無視
                console.warn('Failed to save daily quote (retry):', retryError)
              } else {
                console.log('Daily quote saved successfully (without region columns)')
              }
            } else {
              // その他のエラーも無視（テーブルが存在しない場合など）
              console.warn('Failed to save daily quote:', quoteError)
            }
          } else {
            console.log('Daily quote saved successfully')
          }
        } catch (quoteErr) {
          // エラーを無視（テーブルが存在しない場合など）
          console.warn('Error saving daily quote:', quoteErr)
        }
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
      return { success: false, data: null, error: result.error }
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

// 新スキーマ用の投稿インターフェース
export interface PostNew {
  id: string
  item_name: string
  price: number
  category_new: string
  is_tax_included: boolean
  quantity: number | null
  unit: string | null
  comment: string | null
  region_big: string | null
  region_pref: string | null
  region_city: string | null
  created_at: string
  user_uuid: string
}

// 自分の投稿を取得（新スキーマ用）
export async function getMyPostsNew(userUuid: string): Promise<{ success: boolean; data: PostNew[]; error?: string }> {
  try {
    if (!userUuid) {
      return { success: true, data: [] }
    }

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('posts')
      .select('id, item_name, price, category_new, is_tax_included, quantity, unit, comment, region_big, region_pref, region_city, created_at, user_uuid')
      .eq('user_uuid', userUuid)
      .not('item_name', 'is', null) // 新スキーマのデータのみ
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      // カラムが存在しないエラーの場合は空配列を返す
      if (error.code === '42703' || error.code === 'PGRST116') {
        return { success: true, data: [] }
      }
      throw error
    }

    return { success: true, data: (data || []) as PostNew[] }
  } catch (error) {
    console.error('Error fetching my posts:', error)
    return { success: false, data: [], error: String(error) }
  }
}

// 投稿を削除（新スキーマ用）
export async function deletePostNew(postId: string, userUuid: string): Promise<{ success: boolean; error?: string }> {
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

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return { success: false, error: 'Post not found' }
      }
      throw fetchError
    }

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
