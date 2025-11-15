"use client";

import { usePathname } from "next/navigation";
import { DocsNav } from "./docs-nav";

const navigationItems = [
  { title: "Overview", href: "/" },
  { title: "Local Setup", href: "/setup" },
  { title: "Add Public Tools", href: "/add-tools" },
  { title: "Add Authentication", href: "/add-auth" },
  { title: "Add Portfolio Tools", href: "/add-authenticated-tools" },
  { title: "Async Auth", href: "/async-auth" },
  { title: "Setup MCP Handlers", href: "/setup-mcp" },
  { title: "Bonus: Native AI Tools", href: "/native-ai-tools" },
  // { title: "⚡ MCP Integration", href: "/mcp" },
];

export function DocsNavigation() {
  const pathname = usePathname();

  const navItemsWithActive = navigationItems.map((item) => ({
    ...item,
    isActive: pathname === item.href,
  }));

  return <DocsNav items={navItemsWithActive} />;
}
