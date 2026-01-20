'use client'

import { Share2, Twitter, MessageCircle, Facebook } from 'lucide-react'
import { useState } from 'react'

interface SocialShareProps {
  title?: string
  url?: string
  description?: string
}

export function SocialShare({ 
  title = 'かうしる - 愛知西部の物価予報',
  url,
  description = '物価・サイズ・感情を記録し、エリア全体の物価予報を作る。地域の知恵が集まる物価メモ'
}: SocialShareProps) {
  const [copied, setCopied] = useState(false)
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedTitle = encodeURIComponent(title)
  const encodedDescription = encodeURIComponent(description)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        })
      } catch (err) {
        // ユーザーがキャンセルした場合などはエラーを無視
      }
    } else {
      // フォールバック: クリップボードにコピー
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    line: `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-colors text-xs font-normal"
        title="シェア"
      >
        <Share2 className="w-3.5 h-3.5" />
        {copied ? 'コピーしました' : 'シェア'}
      </button>

      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-colors text-xs font-normal"
        title="Twitterでシェア"
      >
        <Twitter className="w-3.5 h-3.5" />
      </a>

      <a
        href={shareLinks.line}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-colors text-xs font-normal"
        title="LINEでシェア"
      >
        <MessageCircle className="w-3.5 h-3.5" />
      </a>

      <a
        href={shareLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-colors text-xs font-normal"
        title="Facebookでシェア"
      >
        <Facebook className="w-3.5 h-3.5" />
      </a>
    </div>
  )
}
