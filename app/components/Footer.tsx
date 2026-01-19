'use client'

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="mt-12 pt-8 pb-6 border-t border-gray-200">
      <div className="max-w-md mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <Link
            href="/terms"
            className="text-gray-600 hover:text-emerald-600 transition-colors"
          >
            利用規約
          </Link>
          <span className="text-gray-300">|</span>
          <Link
            href="/privacy"
            className="text-gray-600 hover:text-emerald-600 transition-colors"
          >
            プライバシーポリシー
          </Link>
        </div>
        <p className="text-xs text-gray-500 text-center mt-4">
          © 2026 かうしる
        </p>
      </div>
    </footer>
  )
}
