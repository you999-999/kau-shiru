'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">プライバシーポリシー</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8">
          {/* 理念 */}
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl">
            <p className="text-lg font-semibold text-emerald-800 mb-2">
              このポリシーの目的
            </p>
            <p className="text-gray-700 leading-relaxed">
              みんなで気持ちよく物価情報を共有するための約束です。あなたのプライバシーを最優先に、匿名性を徹底して情報を保護します。
            </p>
          </div>

          {/* 個人情報の定義 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. 個人情報の定義</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              本アプリ「かうしる」は、名前、住所、メールアドレス、電話番号などの個人を特定する情報は一切収集しません。
            </p>
            <p className="text-gray-700 leading-relaxed">
              あなたの匿名性とプライバシーを最優先に設計されています。
            </p>
          </section>

          {/* 収集するデータ */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. 収集するデータ</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              本アプリでは、以下の情報を収集します：
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold mt-1">•</span>
                <span className="leading-relaxed">
                  <strong>投稿された価格情報</strong><br />
                  商品のカテゴリ、価格、税込/税別の情報
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold mt-1">•</span>
                <span className="leading-relaxed">
                  <strong>エリア情報</strong><br />
                  投稿されたエリアグループ（例：愛知西部）
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold mt-1">•</span>
                <span className="leading-relaxed">
                  <strong>「ひとこと」</strong><br />
                  任意で投稿された20文字以内のコメント
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold mt-1">•</span>
                <span className="leading-relaxed">
                  <strong>匿名ID（UUID）</strong><br />
                  あなたのデバイスのlocalStorageに保存される、個人を特定できないランダムなID。これにより、あなた自身の投稿履歴を表示できます。
                </span>
              </li>
            </ul>
          </section>

          {/* データの利用 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. データの利用</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              収集したデータは、以下の目的でのみ利用されます：
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold mt-1">•</span>
                <span className="leading-relaxed">
                  <strong>エリアごとの平均価格の算出</strong><br />
                  地域の物価動向を把握し、「このあたりでは、¥〇〇くらいがお得感あり」といった情報を提供するため
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold mt-1">•</span>
                <span className="leading-relaxed">
                  <strong>アプリの利便性向上</strong><br />
                  価格トレンドの表示や、あなた自身の投稿履歴の表示など、アプリの機能を提供するため
                </span>
              </li>
            </ul>
          </section>

          {/* データの保護 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. データの保護</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              収集したデータは、適切なセキュリティ対策の下で管理されます。
            </p>
            <p className="text-gray-700 leading-relaxed">
              データは個人を特定できない形で集計・表示され、第三者に個人を特定できる形で提供されることはありません。
            </p>
          </section>

          {/* データの削除 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">5. データの削除</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              あなたは、自分の投稿をいつでも削除することができます。
            </p>
            <p className="text-gray-700 leading-relaxed">
              また、デバイスのlocalStorageをクリアすることで、匿名IDを削除し、新しいIDでアプリを利用することも可能です。
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
