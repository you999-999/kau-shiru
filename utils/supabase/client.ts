import { createClient } from '@supabase/supabase-js'

export const createBrowserClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // client側もimport時に落とさない（画面全体が壊れるのを防ぐ）
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables (client):', {
      hasUrl: Boolean(supabaseUrl),
      hasAnonKey: Boolean(supabaseAnonKey),
    })
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

// 後方互換（既存importがあれば動く）
export const supabase = (() => {
  try {
    return createBrowserClient()
  } catch {
    // ここでthrowするとimport時に落ちるので、ダミーを返す（実使用時にエラーになる）
    return createClient('http://localhost', 'invalid-anon-key')
  }
})()
