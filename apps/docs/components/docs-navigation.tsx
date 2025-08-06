"use client"

import { usePathname } from "next/navigation"
import { DocsNav } from "./docs-nav"

const navigationItems = [
  { title: "Overview", href: "/" },
  { title: "Local Setup", href: "/setup" },
  { title: "Add Public Tools", href: "/add-tools" },
  { title: "Add Authentication", href: "/add-auth" },
  { title: "Add Portfolio Tools", href: "/add-authenticated-tools" },
  // For our workshop in berkeley disable the mcp-server part for now
  // { title: "🔒 Token Vault Deep-Dive", href: "/token-vault" },
  // { title: "⚡ MCP Integration", href: "/mcp" },
]

export function DocsNavigation() {
  const pathname = usePathname()
  
  const navItemsWithActive = navigationItems.map(item => ({
    ...item,
    isActive: pathname === item.href
  }))

  return <DocsNav items={navItemsWithActive} />
}
