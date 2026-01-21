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
  adClient, 
  style,
  className = '',
  format = 'auto'
}: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null)
  
  // 環境変数から取得（Next.jsではNEXT_PUBLIC_*はビルド時にクライアントバンドルに埋め込まれる）
  const effectiveAdClient = adClient || process.env.NEXT_PUBLIC_ADSENSE_CLIENT

  useEffect(() => {
    if (!adSlot || !effectiveAdClient || effectiveAdClient === 'ca-pub-XXXXXXXXXX' || typeof window === 'undefined') return

    try {
      // Google AdSense スクリプトを読み込む
      if (!(window as any).adsbygoogle) {
        const script = document.createElement('script')
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + effectiveAdClient
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
  }, [adSlot, effectiveAdClient])

  // 環境変数が設定されていない場合は完全に非表示（スペースも取らない）
  if (!adSlot || !effectiveAdClient || effectiveAdClient === 'ca-pub-XXXXXXXXXX') {
    return null
  }

  return (
    <div className={`ad-container ${className}`} style={style}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={effectiveAdClient}
        data-ad-slot={adSlot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
