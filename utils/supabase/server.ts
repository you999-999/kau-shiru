import { createClient } from '@supabase/supabase-js'

// Server Actions用のクライアント
export const createServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // import時に落とすと全ページが500になり得るので、生成時にチェックする
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables (server):', {
      hasUrl: Boolean(supabaseUrl),
      hasAnonKey: Boolean(supabaseAnonKey),
    })
    throw new Error('Missing Supabase environment variables')
  }
  return createClient(supabaseUrl, supabaseAnonKey)
}
