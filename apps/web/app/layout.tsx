import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@workspace/ui/globals.css"
import Navigation from "@/components/navigation"
import { Auth0Provider } from '@auth0/nextjs-auth0'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DemoTradePro - Stock Trading Platform",
  description: "Professional stock trading platform",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Auth0Provider>
          <div className="min-h-screen bg-background">
            <Navigation />
            <main className="container mx-auto px-4 py-6">{children}</main>
          </div>
        </Auth0Provider>
      </body>
    </html>
  )
}
