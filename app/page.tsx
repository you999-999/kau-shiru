'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Eye, BookOpen, TrendingUp } from 'lucide-react'
import { OnboardingModal } from './components/OnboardingModal'
import { DailyQuote } from './components/DailyQuote'

export default function Home() {
  // ページ読み込み時にスクロール位置をリセット
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <main className="min-h-screen p-4 pb-8 bg-gray-50 flex items-center justify-center">
      <OnboardingModal />
      <div className="max-w-md mx-auto w-full">
        {/* ヘッダー */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 flex items-center gap-1 sm:gap-2 whitespace-nowrap">
              かうしる
              <span className="inline-flex items-center flex-shrink-0" style={{ height: '1em', lineHeight: '1' }}>
                <Image
                  src="/gazou/kausiru.png"
                  alt="かうしる"
                  width={48}
                  height={48}
                  className="object-contain"
                  style={{ height: '1em', width: 'auto' }}
                />
              </span>
            </h1>
          </div>
          <p className="text-gray-600 text-lg font-medium">買い物にお得感と楽しさを！</p>
          <p className="text-gray-500 text-sm mt-1">地域の知恵が集まる物価メモ</p>
        </div>

        {/* 今日のひとこと */}
        <DailyQuote />

        {/* 具体的なベネフィット */}
        <div className="mb-8 p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            かうしるを使うと
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg flex-shrink-0">
                <BookOpen className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">自分の買い物履歴が残る</p>
                <p className="text-xs text-gray-600 mt-0.5">投稿すると、あなたの買い物記録として保存されます</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <Eye className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">みんなの相場で買い時がわかる</p>
                <p className="text-xs text-gray-600 mt-0.5">地域の相場を確認して、お得に買い物できます</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg flex-shrink-0">
                <ShoppingCart className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">地域の知恵を共有できる</p>
                <p className="text-xs text-gray-600 mt-0.5">あなたの投稿が、みんなの買い物に役立ちます</p>
              </div>
            </div>
          </div>
        </div>

        {/* ページ選択カード */}
        <div className="space-y-4">
          {/* かうページ */}
          <Link
            href="/kau"
            className="block w-full p-6 sm:p-8 bg-white rounded-2xl shadow-lg border-2 border-gray-200 hover:border-emerald-500 hover:shadow-xl transition-all text-left group"
          >
            <div className="flex items-center gap-3 sm:gap-4 mb-3">
              <div className="p-3 sm:p-4 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-colors flex-shrink-0">
                <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">かう</h2>
                <p className="text-xs sm:text-sm text-gray-500">価格を記録する</p>
              </div>
            </div>
            <p className="text-gray-600 text-xs sm:text-sm">
              食材の価格を記録して、みんなの相場に貢献しましょう
            </p>
          </Link>

          {/* しるページ */}
          <Link
            href="/shiru"
            className="block w-full p-6 sm:p-8 bg-white rounded-2xl shadow-lg border-2 border-gray-200 hover:border-emerald-500 hover:shadow-xl transition-all text-left group"
          >
            <div className="flex items-center gap-3 sm:gap-4 mb-3">
              <div className="p-3 sm:p-4 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors flex-shrink-0">
                <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">しる</h2>
                <p className="text-xs sm:text-sm text-gray-500">相場を知る</p>
              </div>
            </div>
            <p className="text-gray-600 text-xs sm:text-sm">
              みんなの投稿から、地域の相場を確認できます
            </p>
          </Link>
        </div>
      </div>
    </main>
  )
}
