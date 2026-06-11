import { useEffect, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { completeAdminLogin, setAuthMessage } from '../lib/auth'

export function AdminCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const callbackError = useMemo(() => {
    const cognitoError = searchParams.get('error_description')

    if (cognitoError) {
      return cognitoError
    }

    if (!searchParams.get('code') || !searchParams.get('state')) {
      return 'Brakuje danych wymaganych do zakończenia logowania.'
    }

    return null
  }, [searchParams])

  useEffect(() => {
    if (callbackError) {
      return
    }

    const code = searchParams.get('code')
    const state = searchParams.get('state')

    void (async () => {
      try {
        const returnPath = await completeAdminLogin(code!, state!)
        navigate(returnPath, { replace: true })
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Nie udało się zakończyć logowania.'

        setAuthMessage(message)
        navigate('/admin/login', { replace: true })
      }
    })()
  }, [callbackError, navigate, searchParams])

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-950">
      <section className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-emerald-700 text-white">
          <Building2 size={20} />
        </div>
        <h1 className="mt-4 text-xl font-semibold">
          Kończenie logowania
        </h1>
        {callbackError ? (
          <>
            <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {callbackError}
            </p>
            <Link
              className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
              to="/admin/login"
            >
              Wróć do logowania
            </Link>
          </>
        ) : (
          <p className="mt-3 text-sm text-slate-600">
            Za chwilę wrócisz do panelu administratora.
          </p>
        )}
      </section>
    </main>
  )
}
