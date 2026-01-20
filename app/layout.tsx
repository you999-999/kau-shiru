import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Footer } from './components/Footer'
import { GoogleAnalytics } from './components/GoogleAnalytics'

export const metadata: Metadata = {
  title: 'かうしる - 愛知西部の物価予報',
  description: '物価・サイズ・感情を記録し、エリア全体の物価予報を作る。地域の知恵が集まる物価メモで、買い物にお得感と楽しさを！',
  keywords: ['物価', '価格', '愛知西部', '買い物', 'お得', 'スーパー', '物価予報', '価格比較'],
  authors: [{ name: 'かうしる' }],
  creator: 'かうしる',
  publisher: 'かうしる',
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://kau-shiru.vercel.app', // 本番URLに変更してください
    siteName: 'かうしる',
    title: 'かうしる - 愛知西部の物価予報',
    description: '物価・サイズ・感情を記録し、エリア全体の物価予報を作る。地域の知恵が集まる物価メモ',
    images: [
      {
        url: '/og-image.png', // OGP画像を作成してください
        width: 1200,
        height: 630,
        alt: 'かうしる - 愛知西部の物価予報',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'かうしる - 愛知西部の物価予報',
    description: '物価・サイズ・感情を記録し、エリア全体の物価予報を作る。地域の知恵が集まる物価メモ',
    images: ['/og-image.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'かうしる',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#F9F8F6',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#F9F8F6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        {children}
        <Footer />
      </body>
    </html>
  )
}
