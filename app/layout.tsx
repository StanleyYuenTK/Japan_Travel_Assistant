import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import "./globals.css"
import { ThemeProvider } from "@/contexts/theme-context"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TravelSafe - 智能旅行規劃助手",
  description: "TravelSafe",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-HK">
      <body className={`font-sans antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster position="top-center" />
        <Analytics />
      </body>
    </html>
  )
}
