"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Moon, Sun, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { NeonLogo } from "@/components/neon-logo"
import { ServerStatus } from "@/components/server-status"
import { PlayerCounter } from "@/components/player-counter"

export function Header() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const routes = [
    { href: "/", label: "Home" },
    { href: "/forum", label: "Forum" },
    { href: "/documentation", label: "Documentation" },
    { href: "/map", label: "Server Map" },
    { href: "/community", label: "Community" },
    { href: "/support", label: "Support" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <NeonLogo />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors relative group overflow-hidden",
                  pathname === route.href
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/10",
                )}
              >
                {route.label}
                {pathname === route.href && <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary" />}
                <div className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-10 bg-primary transition-opacity" />
              </Link>
            ))}
          </nav>

          {/* Right side items */}
          <div className="flex items-center gap-2">
            <div className="hidden md:block mr-2">
              <PlayerCounter className="h-8" />
            </div>

            <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Link href="/auth/login">
              <Button variant="outline" size="icon">
                <User className="h-4 w-4" />
              </Button>
            </Link>

            {/* Mobile menu button */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border/30 bg-background/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex flex-col space-y-2">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    pathname === route.href
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/10",
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {route.label}
                </Link>
              ))}
              <Link
                href="/auth/login"
                className="px-3 py-2 text-sm font-medium rounded-md transition-colors text-muted-foreground hover:text-primary hover:bg-primary/10"
                onClick={() => setIsMenuOpen(false)}
              >
                Login / Register
              </Link>
            </nav>

            <div className="mt-4 pt-4 border-t border-border/30">
              <ServerStatus />
            </div>

            <div className="mt-4">
              <PlayerCounter />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
