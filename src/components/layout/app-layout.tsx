import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { Menu, Moon, Sun, X } from 'lucide-react'
import { MobileNav, Sidebar, SidebarContent } from './sidebar'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { isDark, toggleTheme } = useTheme()
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={`flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] text-ink-soft transition-colors hover:bg-surface-sunken hover:text-ink ${className}`}
    >
      {isDark ? (
        <Sun className="h-4.5 w-4.5" aria-hidden="true" />
      ) : (
        <Moon className="h-4.5 w-4.5" aria-hidden="true" />
      )}
    </button>
  )
}

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useAuth()

  return (
    <div className="flex min-h-screen bg-surface-sunken">
      <Sidebar />

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/45"
            role="presentation"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 border-r border-line bg-surface">
            <div className="flex justify-end p-2">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
                className="rounded p-1.5 text-ink-faint hover:bg-surface-sunken hover:text-ink"
              >
                <X className="h-4.5 w-4.5" aria-hidden="true" />
              </button>
            </div>
            <div className="h-[calc(100%-3rem)]">
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-surface/90 px-4 backdrop-blur">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] text-ink-soft hover:bg-surface-sunken hover:text-ink lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>

          <Link to="/app" className="flex items-center gap-2 lg:hidden">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-coral text-[11px] font-bold text-white"
              aria-hidden="true"
            >
              PF
            </span>
            <span className="text-sm font-semibold text-ink">PrepForge</span>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/app/settings"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-dusty text-xs font-semibold text-white"
              aria-label="Profile and settings"
            >
              {(user?.name ?? 'U').slice(0, 2).toUpperCase()}
            </Link>
          </div>
        </header>

        <main className="flex-1 px-4 pt-5 pb-24 lg:px-8 lg:pb-10">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  )
}
