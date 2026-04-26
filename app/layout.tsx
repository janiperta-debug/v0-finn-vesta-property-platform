import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'

import './globals.css'
import { CookieConsent } from '@/components/cookie-consent'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  title: 'FinnVesta - Elävä kiinteistöhallinta',
  description: 'Korvaa kalliit konsultit reaaliaikaisella kiinteistöjen kuntoarvio- ja PTS-alustalla.',
}

export const viewport: Viewport = {
  themeColor: '#0f1624',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fi">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        {children}
        <CookieConsent />
      </body>
    </html>
  )
}
