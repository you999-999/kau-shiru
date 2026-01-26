'use server'

import { createServerClient } from '@/utils/supabase/server'

// 単品メモ用データ
export interface ItemLogData {
  category?: string
  price?: number
  quantity_note?: string
  extra_flag?: boolean
  comment?: string
  is_public?: boolean
}

// 今日の買い物用データ
export interface DailyLogData {
  total_price?: number
  days_covered?: number
  extra_level?: 'yes' | 'maybe' | 'no'
  daily_comment?: string
  is_public?: boolean
}

// buy_logsの取得結果
export interface BuyLog {
  id: string
  created_at: string
  user_uuid: string
  log_type: 'item' | 'daily'
  is_public: boolean
  // 単品メモ用
  category?: string | null
  price?: number | null
  quantity_note?: string | null
  extra_flag?: boolean | null
  comment?: string | null
  // 今日の買い物用
  total_price?: number | null
  days_covered?: number | null
  extra_level?: 'yes' | 'maybe' | 'no' | null
  daily_comment?: string | null
}

// 単品メモを保存
export async function saveItemLog(userUuid: string, data: ItemLogData): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerClient()
    
    const insertData: any = {
      user_uuid: userUuid,
      log_type: 'item',
      is_public: data.is_public !== undefined ? data.is_public : true,
    }
    
    if (data.category) insertData.category = data.category
    if (data.price !== undefined && data.price !== null) insertData.price = data.price
    if (data.quantity_note) insertData.quantity_note = data.quantity_note
    if (data.extra_flag !== undefined) insertData.extra_flag = data.extra_flag
    if (data.comment) insertData.comment = data.comment
    
    const { error } = await supabase
      .from('buy_logs')
      .insert(insertData)
    
    if (error) {
      console.error('Error saving item log:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true }
  } catch (error: any) {
    console.error('Error saving item log:', error)
    return { success: false, error: error?.message || '保存に失敗しました' }
  }
}

// 今日の買い物を保存
export async function saveDailyLog(userUuid: string, data: DailyLogData): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerClient()
    
    const insertData: any = {
      user_uuid: userUuid,
      log_type: 'daily',
      is_public: data.is_public !== undefined ? data.is_public : true,
    }
    
    if (data.total_price !== undefined && data.total_price !== null) insertData.total_price = data.total_price
    if (data.days_covered !== undefined && data.days_covered !== null) insertData.days_covered = data.days_covered
    if (data.extra_level) insertData.extra_level = data.extra_level
    if (data.daily_comment) insertData.daily_comment = data.daily_comment
    
    const { error } = await supabase
      .from('buy_logs')
      .insert(insertData)
    
    if (error) {
      console.error('Error saving daily log:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true }
  } catch (error: any) {
    console.error('Error saving daily log:', error)
    return { success: false, error: error?.message || '保存に失敗しました' }
  }
}

// 公開ログを取得（最新20件）
export async function getPublicBuyLogs(): Promise<{ success: boolean; data: BuyLog[]; error?: string }> {
  try {
    const supabase = createServerClient()
    
    const { data, error } = await supabase
      .from('buy_logs')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(20)
    
    if (error) {
      // テーブルが存在しない場合は空配列を返す
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        return { success: true, data: [] }
      }
      console.error('Error fetching buy logs:', error)
      return { success: false, data: [], error: error.message }
    }
    
    return { success: true, data: (data || []) as BuyLog[] }
  } catch (error: any) {
    console.error('Error fetching buy logs:', error)
    return { success: true, data: [] } // エラー時は空配列を返す（表示を壊さない）
  }
}
