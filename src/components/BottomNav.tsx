'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChefHat, ShoppingBasket, History, Settings } from 'lucide-react'

const NAV_LINKS = [
  { href: '/', icon: ChefHat, label: 'Cook' },
  { href: '/pantry', icon: ShoppingBasket, label: 'Pantry' },
  { href: '/history', icon: History, label: 'History' },
  { href: '/settings', icon: Settings, label: 'Settings' },
] as const

export function BottomNav() {
  const pathname = usePathname()

  // Hide nav during cooking mode (exact path segment check, not substring)
  if (pathname === '/cook' || pathname.startsWith('/cook/')) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-md mx-auto flex">
        {NAV_LINKS.map(({ href, icon: Icon, label }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors ${
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
