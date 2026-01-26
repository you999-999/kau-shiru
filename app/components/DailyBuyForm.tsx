'use client'

import { useState } from 'react'
import { saveDailyLog, type DailyLogData } from '../actions_buy_logs'

interface DailyBuyFormProps {
  userUuid: string | null
  onSuccess?: () => void
}

export function DailyBuyForm({ userUuid, onSuccess }: DailyBuyFormProps) {
  const [totalPrice, setTotalPrice] = useState<string>('')
  const [daysCovered, setDaysCovered] = useState<string>('')
  const [extraLevel, setExtraLevel] = useState<'yes' | 'maybe' | 'no' | null>(null)
  const [dailyComment, setDailyComment] = useState<string>('')
  const [isPublic, setIsPublic] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userUuid) {
      alert('ユーザー情報が取得できませんでした')
      return
    }

    setIsSubmitting(true)

    try {
      const data: DailyLogData = {
        total_price: totalPrice ? parseInt(totalPrice) : undefined,
        days_covered: daysCovered ? parseInt(daysCovered) : undefined,
        extra_level: extraLevel || undefined,
        daily_comment: dailyComment || undefined,
        is_public: isPublic,
      }

      const result = await saveDailyLog(userUuid, data)

      if (result.success) {
        setSubmitSuccess(true)
        // フォームリセット
        setTotalPrice('')
        setDaysCovered('')
        setExtraLevel(null)
        setDailyComment('')
        setIsPublic(true)
        
        if (onSuccess) onSuccess()
        
        setTimeout(() => {
          setSubmitSuccess(false)
        }, 3000)
      } else {
        alert(`保存に失敗しました: ${result.error || '不明なエラー'}`)
      }
    } catch (error) {
      console.error('保存処理でエラーが発生しました:', error)
      alert(`保存に失敗しました: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 space-y-4">
      {/* 合計金額 */}
      <div>
        <label htmlFor="total-price" className="block text-sm font-medium text-gray-700 mb-2">
          合計金額（任意）
        </label>
        <input
          id="total-price"
          type="number"
          value={totalPrice}
          onChange={(e) => setTotalPrice(e.target.value)}
          placeholder="例：3500"
          className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-sm"
          min="0"
        />
      </div>

      {/* 何日分 */}
      <div>
        <label htmlFor="days-covered" className="block text-sm font-medium text-gray-700 mb-2">
          何日分？（任意）
        </label>
        <input
          id="days-covered"
          type="number"
          value={daysCovered}
          onChange={(e) => setDaysCovered(e.target.value)}
          placeholder="例：3"
          className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-sm"
          min="1"
        />
      </div>

      {/* 余分だったかも */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          全体として余分だったかも？（任意）
        </label>
        <div className="flex gap-2">
          {(['yes', 'maybe', 'no'] as const).map((level) => {
            const labels = { yes: 'Yes', maybe: 'たぶん', no: 'No' }
            return (
              <button
                key={level}
                type="button"
                onClick={() => setExtraLevel(level)}
                className={`flex-1 py-2 rounded-lg border-2 transition-all text-sm ${
                  extraLevel === level
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                {labels[level]}
              </button>
            )
          })}
        </div>
      </div>

      {/* ひとこと */}
      <div>
        <label htmlFor="daily-comment" className="block text-sm font-medium text-gray-700 mb-2">
          ひとこと（任意）
        </label>
        <input
          id="daily-comment"
          type="text"
          value={dailyComment}
          onChange={(e) => setDailyComment(e.target.value)}
          placeholder="例：週末の買い物"
          className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-sm"
        />
      </div>

      {/* 公開設定 */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
          />
          <span className="text-sm text-gray-700">公開する</span>
        </label>
      </div>

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={isSubmitting || !userUuid}
        className={`w-full py-3 font-bold text-base rounded-xl shadow-lg transition-all ${
          userUuid
            ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
            : 'bg-gray-300 text-gray-600 cursor-not-allowed'
        }`}
      >
        {isSubmitting ? '保存中...' : '記録する'}
      </button>

      {submitSuccess && (
        <div className="p-3 bg-emerald-50 border-2 border-emerald-200 rounded-xl text-emerald-700 text-center">
          <p className="font-bold text-sm">記録完了！✨</p>
        </div>
      )}
    </form>
  )
}
