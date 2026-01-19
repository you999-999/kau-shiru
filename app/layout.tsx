import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Footer } from './components/Footer'

export const metadata: Metadata = {
  title: 'かうしる - 愛知西部の物価予報',
  description: '物価・サイズ・感情を記録し、エリア全体の物価予報を作る',
  manifest: '/manifest.json',
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
        {children}
        <Footer />
      </body>
    </html>
  )
}
