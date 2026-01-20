'use client'

import { useEffect } from 'react'

interface StructuredDataProps {
  type?: 'WebApplication' | 'Organization' | 'WebSite'
  data?: Record<string, any>
}

export function StructuredData({ type = 'WebApplication', data }: StructuredDataProps) {
  useEffect(() => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://kau-shiru.vercel.app'
    
    const defaultData = {
      '@context': 'https://schema.org',
      '@type': type,
      name: 'かうしる',
      description: '物価・サイズ・感情を記録し、エリア全体の物価予報を作る。地域の知恵が集まる物価メモ',
      url: baseUrl,
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'JPY',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.5',
        ratingCount: '100',
      },
    }

    const structuredData = { ...defaultData, ...data }

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify(structuredData)
    script.id = 'structured-data'
    
    // 既存の構造化データを削除
    const existing = document.getElementById('structured-data')
    if (existing) {
      existing.remove()
    }
    
    document.head.appendChild(script)

    return () => {
      const scriptElement = document.getElementById('structured-data')
      if (scriptElement) {
        scriptElement.remove()
      }
    }
  }, [type, data])

  return null
}
