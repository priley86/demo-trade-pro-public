"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  BarChart3,
  Home,
  TrendingUp,
  FileText,
  User,
  LogOut,
  Settings,
} from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();
  const { user, isLoading } = useUser();

  const navItems = [{ href: "/", label: "Dashboard", icon: Home }];
  if (user) {
    navItems.push({ href: "/trade", label: "Trade", icon: TrendingUp });
    navItems.push({ href: "/orders", label: "Orders", icon: FileText });
  }

  const developerItems = [
    { href: "/developer", label: "Developer", icon: Settings },
  ];

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6" />
              <span className="font-bold text-xl">DemoTradePro</span>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Button
                    key={item.href}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    asChild
                  >
                    <Link
                      href={item.href}
                      className="flex items-center space-x-2"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </Button>
                );
              })}

              {/* Developer tools - only show when authenticated */}
              {user &&
                developerItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Button
                      key={item.href}
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      asChild
                    >
                      <Link
                        href={item.href}
                        className="flex items-center space-x-2"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </Button>
                  );
                })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="hidden sm:flex">
              Market Open
            </Badge>
            {!isLoading &&
              (user ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground hidden sm:block">
                    {user.name || user.email}
                  </span>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/auth/logout">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href="/auth/login">
                      <User className="h-4 w-4 mr-2" />
                      Login
                    </a>
                  </Button>
                  <Button size="sm" asChild>
                    <a href="/auth/login?screen_hint=signup">Sign Up</a>
                  </Button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
