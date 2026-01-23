'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ShoppingCart, Eye } from 'lucide-react'

export default function Home() {
  const router = useRouter()

  return (
    <main className="min-h-screen p-4 pb-8 bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto w-full">
        {/* ヘッダー */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-5xl font-bold text-gray-900 flex items-center gap-2">
              かうしる
              <span className="inline-flex items-center" style={{ height: '1em', lineHeight: '1' }}>
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
          <p className="text-gray-600 text-lg">買い物にお得感と楽しさを！</p>
          <p className="text-gray-500 text-sm mt-1">地域の知恵が集まる物価メモ</p>
        </div>

        {/* ページ選択カード */}
        <div className="space-y-4">
          {/* かうページ */}
          <button
            onClick={() => router.push('/kau')}
            className="w-full p-8 bg-white rounded-2xl shadow-lg border-2 border-gray-200 hover:border-emerald-500 hover:shadow-xl transition-all text-left group"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="p-4 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-colors">
                <ShoppingCart className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">かう</h2>
                <p className="text-sm text-gray-500">価格を記録する</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              食材の価格を記録して、みんなの相場に貢献しましょう
            </p>
          </button>

          {/* しるページ */}
          <button
            onClick={() => router.push('/shiru')}
            className="w-full p-8 bg-white rounded-2xl shadow-lg border-2 border-gray-200 hover:border-emerald-500 hover:shadow-xl transition-all text-left group"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="p-4 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                <Eye className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">しる</h2>
                <p className="text-sm text-gray-500">相場を知る</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              みんなの投稿から、地域の相場を確認できます
            </p>
          </button>
        </div>
      </div>
    </main>
  )
}
