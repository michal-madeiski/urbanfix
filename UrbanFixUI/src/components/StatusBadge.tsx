import { reportStatusLabels } from '../lib/reportLabels'
import type { ReportStatus } from '../types/report'

const classByStatus: Record<ReportStatus, string> = {
  New: 'bg-red-100 text-red-700',
  Verified: 'bg-amber-100 text-amber-800',
  Rejected: 'bg-slate-100 text-slate-700',
  Assigned: 'bg-blue-100 text-blue-700',
  Completed: 'bg-emerald-100 text-emerald-700',
}

export function StatusBadge({ status }: { status: ReportStatus | string }) {
  const statusClass =
    classByStatus[status as ReportStatus] ?? 'bg-slate-100 text-slate-700'
  const label = reportStatusLabels[status as ReportStatus] ?? 'Nieznany'

  return (
    <span
      className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${statusClass}`}
    >
      {label}
    </span>
  )
}
