'use client'

import { useState, useEffect } from 'react'
import { X, ShoppingCart, Eye, TrendingUp } from 'lucide-react'

const ONBOARDING_STORAGE_KEY = 'kau_shiru_onboarding_seen'

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // オンボーディングを見たかどうかを確認
    const hasSeenOnboarding = localStorage.getItem(ONBOARDING_STORAGE_KEY)
    
    if (!hasSeenOnboarding) {
      // 少し遅延させて表示（ページ読み込み直後は避ける）
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true')
    }
  }

  if (!isOpen) return null

  const steps = [
    {
      icon: ShoppingCart,
      title: '1. 価格を記録',
      description: '買い物した食材の価格を記録すると、あなたの買い物履歴として残ります',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      icon: Eye,
      title: '2. 相場を確認',
      description: 'みんなの投稿から、地域の相場を確認できます。買い時がわかります',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      icon: TrendingUp,
      title: '3. お得に買い物',
      description: '相場を知ることで、適切なタイミングでお得に買い物ができます',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-300">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">かうしるへようこそ！</h2>
          <p className="text-gray-600 text-sm">
            買い物にお得感と楽しさを。地域の知恵が集まる物価メモです
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200"
              >
                <div className={`p-3 ${step.iconBg} rounded-lg flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${step.iconColor}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        <button
          onClick={handleClose}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors"
        >
          始める
        </button>
      </div>
    </div>
  )
}
