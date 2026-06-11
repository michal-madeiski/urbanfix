import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react'
import { ToastContext } from './toastContext'
import type { ToastTone } from './toastContext'

type Toast = {
  id: string
  message: string
  tone: ToastTone
}

const toneStyles: Record<ToastTone, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-red-200 bg-red-50 text-red-900',
  info: 'border-slate-200 bg-white text-slate-900',
}

const toneIcons: Record<ToastTone, ReactNode> = {
  success: <CheckCircle2 size={18} />,
  error: <TriangleAlert size={18} />,
  info: <Info size={18} />,
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, tone: ToastTone = 'info') => {
      const id = crypto.randomUUID()
      setToasts((current) => [...current, { id, message, tone }])
      window.setTimeout(() => removeToast(id), 3600)
    },
    [removeToast],
  )

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[1600] w-[min(360px,calc(100vw-32px))] space-y-2">
        {toasts.map((toast) => (
          <div
            className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg ${toneStyles[toast.tone]}`}
            key={toast.id}
          >
            <div className="mt-0.5">{toneIcons[toast.tone]}</div>
            <p className="flex-1">{toast.message}</p>
            <button
              className="rounded p-1 opacity-70 hover:bg-black/5 hover:opacity-100"
              onClick={() => removeToast(toast.id)}
              type="button"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
