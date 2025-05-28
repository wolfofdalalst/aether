"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "./button"
import { useState } from "react"
import { SimpleThemeToggle } from "./theme-toggle"
import { Github } from "lucide-react"

interface NavItem {
  href: string
  label: string
  active?: boolean
}

interface NavbarProps {
  brand?: string
  items?: NavItem[]
  children?: React.ReactNode
  className?: string
}

export function Navbar({ brand = "Aether", items = [], children, className }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <nav className={cn(
      "sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand/Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-brand text-gradient">
              {brand}
            </span>
          </Link>
        </div>

        {/* Navigation Items - Center (Desktop) */}
        <div className="hidden md:flex items-center space-x-8">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground/80 relative py-2",
                item.active 
                  ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 after:rounded-full" 
                  : "text-foreground/60"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="h-8 w-8 p-0"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={isMobileMenuOpen 
                  ? "M6 18L18 6M6 6l12 12" 
                  : "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                }
              />
            </svg>
          </Button>
        </div>

        {/* Right side content (Desktop) */}
        <div className="hidden md:flex items-center space-x-2">
          {/* GitHub Link */}
          <Button variant="ghost" size="sm" className="h-9 w-9 px-0 hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:scale-105" asChild>
            <Link 
              href="https://github.com/wolfofdalalst/aether" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Github className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">GitHub</span>
            </Link>
          </Button>
          
          {/* Theme Toggle */}
          <SimpleThemeToggle />
          
          {/* User Menu */}
          {children}
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur">
          <div className="px-4 py-3 space-y-3">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block py-2 text-sm font-medium transition-colors",
                  item.active ? "text-foreground" : "text-foreground/60"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-border/40">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {/* GitHub Link Mobile */}
                  <Button variant="ghost" size="sm" className="h-9 w-9 px-0 hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:scale-105" asChild>
                    <Link 
                      href="https://github.com/wolfofdalalst/aether" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Github className="h-[1.2rem] w-[1.2rem]" />
                      <span className="sr-only">GitHub</span>
                    </Link>
                  </Button>
                  
                  {/* Theme Toggle Mobile */}
                  <SimpleThemeToggle />
                </div>
              </div>
              {children}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

// User menu dropdown component
export function UserMenu({ 
  username, 
  onSignOut 
}: { 
  username: string
  onSignOut: () => void 
}) {
  return (
    <div className="flex items-center space-x-4">
      <div className="hidden sm:flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full navbar-avatar flex items-center justify-center">
          <span className="text-white text-sm font-semibold">
            {username.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="text-sm font-medium text-foreground">
          {username}
        </span>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onSignOut}
        className="h-9 px-4 font-medium hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors"
      >
        Sign Out
      </Button>
    </div>
  )
}
