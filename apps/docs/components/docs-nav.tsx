"use client"

import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"
import { DocsHeader } from "./docs-header"

interface NavItem {
  title: string
  href: string
  isActive?: boolean
}

interface DocsNavProps {
  items: NavItem[]
  className?: string
}

export function DocsNav({ items, className }: DocsNavProps) {
  return (
    <nav className={cn("fixed left-0 h-[calc(100vh)] w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-y-auto", className)}>
      <DocsHeader title="Auth0 Workshop" />
      
      <div className="p-4">
        <div className="space-y-1">
          {items.map((item) => {
            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  item.isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                {item.title}
              </a>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
