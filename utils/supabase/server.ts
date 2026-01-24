import { createClient } from '@supabase/supabase-js'

// Server Actions用のクライアント
export const createServerClient = () => {
  // Vercel/Supabaseの設定名ゆれ吸収:
  // - ブラウザ用: NEXT_PUBLIC_*
  // - サーバ用: SUPABASE_*（秘匿したい場合）
  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // import時に落とすと全ページが500になり得るので、生成時にチェックする
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables (server):', {
      hasUrl: Boolean(supabaseUrl),
      hasAnonKey: Boolean(supabaseAnonKey),
      // どの名前で入っている/いないかの手がかり（値自体は出さない）
      has_NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      has_NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      has_SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
      has_SUPABASE_ANON_KEY: Boolean(process.env.SUPABASE_ANON_KEY),
    })
    throw new Error('Missing Supabase environment variables')
  }
  return createClient(supabaseUrl, supabaseAnonKey)
}
