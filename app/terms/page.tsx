'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  // ページ読み込み時にスクロール位置をリセット
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  return (
    <main className="min-h-screen p-4 pb-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 pt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">ホームに戻る</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">利用規約</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8">
          {/* 理念 */}
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl">
            <p className="text-lg font-semibold text-emerald-800 mb-2">
              この規約の目的
            </p>
            <p className="text-gray-700 leading-relaxed">
              みんなで気持ちよく物価情報を共有するための約束です。地域の知恵を集めて、お互いに納得感のある買い物をサポートし合いましょう。
            </p>
          </div>

          {/* 目的 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. 目的</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              本アプリ「かうしる」は、地域の物価情報の共有と納得感のある買い物の支援を目的としています。
            </p>
            <p className="text-gray-700 leading-relaxed">
              ユーザー同士が価格情報を共有することで、地域全体の物価動向を把握し、より良い買い物の判断をサポートします。
            </p>
          </section>

          {/* 禁止事項 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. 禁止事項</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              以下の行為は禁止されています：
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold mt-1">•</span>
                <span className="leading-relaxed">
                  <strong>虚偽の価格情報の投稿</strong><br />
                  実際の価格と異なる情報を意図的に投稿することは禁止です。正確な情報の共有が、アプリの価値の基盤となります。
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold mt-1">•</span>
                <span className="leading-relaxed">
                  <strong>他人を不快にする不適切な「ひとこと」の投稿</strong><br />
                  「ひとこと」機能は、楽しく情報を共有するためのものです。誹謗中傷、差別的表現、その他他人を不快にする内容の投稿は禁止です。
                </span>
              </li>
            </ul>
          </section>

          {/* 免責事項 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. 免責事項</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              本アプリに投稿された情報の正確性を保証するものではありません。
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              価格情報は地域の平均や傾向を示す参考情報として提供されており、実際の店舗での価格は変動する可能性があります。
            </p>
            <p className="text-gray-700 leading-relaxed">
              最終的な購入判断は、ユーザー自身の責任において行ってください。
            </p>
          </section>

          {/* その他 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. その他</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              本規約は、予告なく変更される場合があります。変更後もアプリを利用される場合、変更後の規約に同意されたものとみなします。
            </p>
            <p className="text-gray-700 leading-relaxed">
              本規約に関するお問い合わせは、アプリ内の適切な方法でお願いいたします。
            </p>
          </section>

          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              最終更新日: 2024年
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
