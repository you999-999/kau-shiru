'use client'

import { useEffect, useRef } from 'react'

interface AdBannerProps {
  adSlot?: string
  adClient?: string
  style?: React.CSSProperties
  className?: string
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle'
}

export function AdBanner({ 
  adSlot, 
  adClient = 'ca-pub-XXXXXXXXXX', // Google AdSenseのパブリッシャーIDに変更
  style,
  className = '',
  format = 'auto'
}: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!adSlot || !adClient || typeof window === 'undefined') return

    try {
      // Google AdSense スクリプトを読み込む
      if (!(window as any).adsbygoogle) {
        const script = document.createElement('script')
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + adClient
        script.async = true
        script.crossOrigin = 'anonymous'
        document.head.appendChild(script)
      }

      // 広告を初期化
      if (adRef.current && (window as any).adsbygoogle) {
        try {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
        } catch (e) {
          console.error('AdSense error:', e)
        }
      }
    } catch (error) {
      console.error('AdSense initialization error:', error)
    }
  }, [adSlot, adClient])

  if (!adSlot) {
    // 開発環境や広告IDがない場合はプレースホルダーを表示
    return (
      <div 
        className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center ${className}`}
        style={{ minHeight: '100px', ...style }}
      >
        <p className="text-gray-400 text-sm">広告スペース</p>
      </div>
    )
  }

  return (
    <div className={`ad-container ${className}`} style={style}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
