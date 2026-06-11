import { NavLink, Outlet } from 'react-router-dom'
import { ClipboardList, LogOut, UsersRound } from 'lucide-react'
import type { ReactNode } from 'react'
import { logoutAdmin } from '../lib/auth'

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="border-b border-slate-200 bg-white lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-4 px-5 py-4 lg:block">
          <div>
            <p className="text-sm font-semibold text-emerald-700">UrbanFix</p>
            <h1 className="text-lg font-semibold">Panel urzędnika</h1>
          </div>
          <button
            className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 lg:hidden"
            onClick={() => {
              logoutAdmin()
            }}
            type="button"
          >
            <LogOut size={15} />
            Wyloguj
          </button>
        </div>

        <nav className="flex gap-2 overflow-x-auto px-3 pb-3 lg:block lg:space-y-1 lg:px-3">
          <AdminNavLink icon={<ClipboardList size={18} />} to="/admin/reports">
            Zgłoszenia
          </AdminNavLink>
          <AdminNavLink icon={<UsersRound size={18} />} to="/admin/teams">
            Zespoły Techniczne
          </AdminNavLink>
        </nav>

        <div className="hidden px-3 lg:fixed lg:bottom-4 lg:block lg:w-[260px]">
          <button
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => {
              logoutAdmin()
            }}
            type="button"
          >
            <LogOut size={16} />
            Wyloguj
          </button>
        </div>
      </aside>
      <Outlet />
    </div>
  )
}

function AdminNavLink({
  children,
  icon,
  to,
}: {
  children: string
  icon: ReactNode
  to: string
}) {
  return (
    <NavLink
      className={({ isActive }) =>
        `inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium lg:w-full ${
          isActive
            ? 'bg-slate-900 text-white'
            : 'text-slate-600 hover:bg-slate-100'
        }`
      }
      to={to}
    >
      {icon}
      {children}
    </NavLink>
  )
}
