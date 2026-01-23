'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { saveContact } from '../actions_contact'

export default function ContactPage() {
  // ページ読み込み時にスクロール位置をリセット
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim()) {
      alert('お問い合わせ内容を入力してください')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    // Supabaseに保存
    const result = await saveContact({
      name: name.trim() || undefined,
      email: email.trim() || undefined,
      message: message.trim(),
    })

    setIsSubmitting(false)

    if (result.success) {
      setSubmitSuccess(true)

      // フォームをリセット
      setName('')
      setEmail('')
      setMessage('')

      // 3秒後に成功メッセージを消す
      setTimeout(() => {
        setSubmitSuccess(false)
      }, 5000)
    } else {
      setSubmitError(result.error || '送信に失敗しました。もう一度お試しください。')
    }
  }

  return (
    <main className="min-h-screen p-4 pb-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 pt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">ホームに戻る</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">お問い合わせ</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
          {/* 説明文 */}
          <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl">
            <p className="text-gray-700 leading-relaxed text-sm">
              かうしるに関するご意見・不具合のご報告・お問い合わせはこちらからお願いします。
              <br />
              内容によっては、ご要望どおりの対応ができない場合がございます。あらかじめご了承ください。
              <br />
              個人開発のため、返信にお時間をいただく場合があります。
            </p>
          </div>

          {/* フォーム */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* お名前 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                お名前（任意）
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例：山田太郎"
                className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all"
              />
            </div>

            {/* メールアドレス */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス（任意）
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="例：example@email.com"
                className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">
                返信が必要な場合は、メールアドレスをご入力ください
              </p>
            </div>

            {/* お問い合わせ内容 */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                お問い合わせ内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="お問い合わせ内容をご記入ください"
                rows={8}
                required
                className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all resize-none"
              />
            </div>

            {/* 注意書き */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <p className="text-xs text-gray-700">
                ※ 個人情報はお問い合わせ対応の目的以外には使用しません。
              </p>
            </div>

            {/* 送信ボタン */}
            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className={`w-full py-4 font-bold text-lg rounded-xl shadow-lg transition-all ${
                isSubmitting || !message.trim()
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              }`}
            >
              {isSubmitting ? '送信中...' : '送信する'}
            </button>

            {/* エラーメッセージ */}
            {submitError && (
              <div className="p-6 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-center">
                <p className="text-lg font-bold mb-1">送信に失敗しました</p>
                <p className="text-sm">{submitError}</p>
              </div>
            )}

            {/* 送信成功メッセージ */}
            {submitSuccess && (
              <div className="p-6 bg-emerald-50 border-2 border-emerald-200 rounded-xl text-emerald-700 text-center">
                <p className="text-lg font-bold mb-1">送信しました</p>
                <p className="text-sm">お問い合わせありがとうございます。内容を確認次第、ご返信いたします。</p>
                <p className="text-xs mt-2 text-emerald-600">
                  ※ 返信が必要な場合は、メールアドレスをご入力ください
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </main>
  )
}
