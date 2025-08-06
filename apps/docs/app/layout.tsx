import type { Metadata } from "next"
import { DocsNavigation } from "../components/docs-navigation"
import { ThemeProvider } from "../components/theme-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "Auth0 AI Workshop",
  description: "Learn to build AI agents with Auth0",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-background">
            <DocsNavigation />
            <div className="ml-64 flex">
              <main className="flex-1 p-8 max-w-4xl">
                {children}
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
