"use client"

import * as React from "react"
import { ExternalLink as ExternalLinkIcon } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

interface ExternalLinkProps {
  href: string
  children: React.ReactNode
  title?: string
  className?: string
  showFavicon?: boolean
}

export function ExternalLink({ 
  href, 
  children, 
  title, 
  className,
  showFavicon = true 
}: ExternalLinkProps) {
  // Extract domain for favicon
  const domain = React.useMemo(() => {
    try {
      return new URL(href).hostname
    } catch {
      return null
    }
  }, [href])

  const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=16` : null

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-border/50 bg-muted/30 hover:bg-muted/50 text-primary hover:text-primary/80 no-underline hover:border-border transition-all align-baseline",
        className
      )}
    >
      {showFavicon && faviconUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img 
          src={faviconUrl} 
          alt="" 
          className="w-4 h-4 flex-shrink-0"
          onError={(e) => {
            // Hide favicon if it fails to load
            e.currentTarget.style.display = 'none'
          }}
        />
      )}
      <span>{children}</span>
      <ExternalLinkIcon className="w-3 h-3 flex-shrink-0 opacity-70" />
    </a>
  )
}
