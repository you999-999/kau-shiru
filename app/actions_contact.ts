'use server'

import { createServerClient } from '@/utils/supabase/server'

export interface ContactData {
  name?: string
  email?: string
  message: string
}

const CONTACT_EMAIL = 'ichigoichie.contact.0015@gmail.com'

export async function saveContact(data: ContactData) {
  try {
    const supabase = createServerClient()
    
    // 1. Supabaseに保存
    const { data: savedData, error: dbError } = await supabase
      .from('contacts')
      .insert({
        name: data.name || null,
        email: data.email || null,
        message: data.message,
      })
      .select()
      .single()

    if (dbError) {
      // テーブルが存在しない場合はエラーを返す
      if (dbError.code === 'PGRST205' || dbError.message?.includes('Could not find the table')) {
        console.error('Contacts table not found. Please run the migration script.')
        return { success: false, error: 'お問い合わせテーブルが見つかりません。マイグレーションを実行してください。' }
      }
      // RLSポリシーエラーの場合
      if (dbError.code === '42501') {
        console.error('RLS policy error:', dbError.message)
        return { 
          success: false, 
          error: 'データベースの設定エラーです。RLSポリシーのマイグレーションを実行してください。' 
        }
      }
      throw dbError
    }

    // 2. メール送信（Resend APIを使用 - 無料プラン：月3000通まで）
    try {
      const emailSubject = `【かうしる】お問い合わせ: ${data.name || '（名前未入力）'}`
      const emailBody = `
新しいお問い合わせが届きました。

【お名前】
${data.name || '（未入力）'}

【メールアドレス】
${data.email || '（未入力）'}

【お問い合わせ内容】
${data.message}

---
送信日時: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
${savedData?.id ? `問い合わせID: ${savedData.id}` : ''}
      `.trim()

      const resendApiKey = process.env.RESEND_API_KEY
      
      if (resendApiKey) {
        try {
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: 'かうしる <noreply@kau-shiru.vercel.app>', // 送信元メールアドレス（Resendで設定）
              to: CONTACT_EMAIL,
              replyTo: data.email || CONTACT_EMAIL,
              subject: emailSubject,
              text: emailBody,
            }),
          })

          const responseData = await response.json()

          if (!response.ok) {
            // 月3000通を超えた場合のエラーハンドリング
            if (response.status === 429 || responseData.message?.includes('rate limit') || responseData.message?.includes('quota')) {
              console.warn('⚠️ Resendの月間送信上限（3000通）に達しました。メールは送信されませんが、お問い合わせはDBに保存されました。')
              console.log('お問い合わせ内容:', {
                to: CONTACT_EMAIL,
                subject: emailSubject,
                body: emailBody,
              })
            } else {
              console.error('Resend API error:', responseData)
              console.warn('メール送信に失敗しましたが、お問い合わせはDBに保存されました。')
            }
          } else {
            console.log('✅ メール送信成功（Resend）')
          }
        } catch (fetchError: any) {
          console.error('Resend API リクエストエラー:', fetchError.message)
          console.warn('メール送信に失敗しましたが、お問い合わせはDBに保存されました。')
        }
      } else {
        // Resend APIキーが設定されていない場合は、ログに出力
        console.warn('RESEND_API_KEYが設定されていません。')
        console.warn('メール送信をスキップしますが、お問い合わせはDBに保存されました。')
        console.log('お問い合わせ内容（メール送信なし）:', {
          to: CONTACT_EMAIL,
          subject: emailSubject,
          body: emailBody,
        })
        console.log('')
        console.log('📧 メール送信を有効にするには:')
        console.log('1. Resendアカウントを作成（無料プラン：月3000通まで）')
        console.log('2. APIキーを取得')
        console.log('3. .env.local に RESEND_API_KEY を設定')
        console.log('4. または、Supabaseダッシュボードで contacts テーブルを確認')
      }
    } catch (emailError) {
      // メール送信エラーはログに記録するが、DB保存は成功しているので処理を続行
      console.error('メール送信エラー:', emailError)
      console.warn('メール送信に失敗しましたが、お問い合わせは保存されました。')
    }

    return { success: true }
  } catch (error) {
    console.error('Error saving contact:', error)
    return { success: false, error: String(error) }
  }
}
