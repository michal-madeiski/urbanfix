import { useMemo, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Building2, LogIn } from 'lucide-react'
import {
  beginAdminLogin,
  getAuthMessage,
  isAdminAuthenticated,
  isCognitoConfigured,
} from '../lib/auth'

export function AdminLoginPage() {
  const [error, setError] = useState<string | null>(() => getAuthMessage())
  const [isLoading, setIsLoading] = useState(false)
  const location = useLocation()
  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname ?? '/admin/reports'
  const isConfigured = useMemo(() => isCognitoConfigured(), [])

  if (isAdminAuthenticated()) {
    return <Navigate replace to="/admin/reports" />
  }

  const login = async () => {
    setError(null)
    setIsLoading(true)

    try {
      await beginAdminLogin(from)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Nie udało się rozpocząć logowania.',
      )
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-950">
      <section className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-700 text-white">
            <Building2 size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-700">UrbanFix</p>
            <h1 className="text-xl font-semibold">Panel administratora</h1>
          </div>
        </div>

        <p className="mt-6 text-sm text-slate-600">
          Logowanie odbywa się przez AWS Cognito. Po zalogowaniu konto musi
          należeć do grupy Admin.
        </p>

        {error && (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}

        {!isConfigured && (
          <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Brakuje konfiguracji Cognito w pliku .env frontendu.
          </p>
        )}

        <button
          className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800 disabled:bg-slate-300"
          disabled={isLoading || !isConfigured}
          onClick={login}
          type="button"
        >
          <LogIn size={17} />
          {isLoading ? 'Przekierowuję...' : 'Zaloguj przez Cognito'}
        </button>
      </section>
    </main>
  )
}
