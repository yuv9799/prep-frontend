import {
  LayoutDashboard,
  BookOpen,
  ListChecks,
  RefreshCw,
  FolderGit2,
  FileText,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
  end?: boolean
}

export const primaryNav: NavItem[] = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/subjects', label: 'Subjects', icon: BookOpen },
  { to: '/app/questions', label: 'Practice', icon: ListChecks },
  { to: '/app/revisions', label: 'Revisions', icon: RefreshCw },
  { to: '/app/projects', label: 'Projects', icon: FolderGit2 },
  { to: '/app/resume', label: 'Resume', icon: FileText },
  { to: '/app/analytics', label: 'Analytics', icon: BarChart3 },
]

export const secondaryNav: NavItem[] = [{ to: '/app/settings', label: 'Settings', icon: Settings }]

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth()

  const renderLink = (item: NavItem) => {
    const Icon = item.icon
    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        onClick={onNavigate}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium transition-colors ${
            isActive
              ? 'bg-coral-soft text-rose-muted'
              : 'text-ink-soft hover:bg-surface-sunken hover:text-ink'
          }`
        }
      >
        <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
        {item.label}
      </NavLink>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-3 py-4">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-coral text-sm font-bold text-white"
          aria-hidden="true"
        >
          PF
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">PrepForge</p>
          <p className="truncate text-xs text-ink-faint">Placement prep</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2" aria-label="Main navigation">
        {primaryNav.map(renderLink)}
        <div className="my-3 border-t border-line" />
        {secondaryNav.map(renderLink)}
      </nav>

      <div className="border-t border-line p-3">
        <div className="flex items-center gap-2.5 rounded-[var(--radius-control)] px-1 py-1.5">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-dusty text-xs font-semibold text-white"
            aria-hidden="true"
          >
            {(user?.name ?? 'U').slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{user?.name ?? 'Guest'}</p>
            <p className="truncate text-xs text-ink-faint">{user?.email ?? ''}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          className="mt-2 flex w-full items-center gap-2 rounded-[var(--radius-control)] px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-surface-sunken hover:text-ink"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sign out
        </button>
      </div>
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-line bg-surface lg:block">
      <div className="sticky top-0 h-screen">
        <SidebarContent />
      </div>
    </aside>
  )
}

export function MobileNav({ badge }: { badge?: number }) {
  const items = primaryNav.slice(0, 5)
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-surface lg:hidden"
      aria-label="Mobile navigation"
    >
      {items.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `relative flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors ${
                isActive ? 'text-rose-muted' : 'text-ink-faint'
              }`
            }
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            {item.label}
            {item.to === '/app/revisions' && badge ? (
              <span className="absolute top-1 right-[22%] flex h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[10px] font-semibold text-white">
                {badge > 9 ? '9+' : badge}
              </span>
            ) : null}
          </NavLink>
        )
      })}
    </nav>
  )
}
