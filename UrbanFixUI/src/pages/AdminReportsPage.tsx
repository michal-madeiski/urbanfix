import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { getReport, getReportsByDateDesc } from '../api/reportsApi'
import { StatusBadge } from '../components/StatusBadge'
import { ReportDrawer } from '../components/ReportDrawer'
import { isUnauthorizedError } from '../lib/apiErrors'
import { formatDateTime, shortId } from '../lib/format'
import { reportStatusLabels } from '../lib/reportLabels'
import type { PaginationResponse, Report, ReportStatus } from '../types/report'

const pageSize = 5
const statusOptions: ReportStatus[] = [
  'New',
  'Verified',
  'Rejected',
  'Assigned',
  'Completed',
]
const adminAuthMessage =
  'Zaloguj się jako administrator, aby zobaczyć te dane.'

export function AdminReportsPage() {
  const [pageNumber, setPageNumber] = useState(1)
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | 'all'>(
    'all',
  )
  const [searchId, setSearchId] = useState('')
  const [result, setResult] = useState<PaginationResponse<Report> | null>(null)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [emptyMessage, setEmptyMessage] = useState('Brak zgłoszeń.')

  const loadReports = async () => {
    setIsLoading(true)
    try {
      const trimmedSearch = searchId.trim()

      if (trimmedSearch) {
        const report = await getReport(trimmedSearch)
        setResult({
          items:
            report &&
            (selectedStatus === 'all' || report.status === selectedStatus)
              ? [report]
              : [],
          pageNumber: 1,
          pageSize,
          totalCount: report ? 1 : 0,
          totalPages: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        })
        setEmptyMessage('Nie znaleziono zgłoszenia o podanym ID.')
        return
      }

      const reports = await getReportsByDateDesc({
        pageNumber,
        pageSize,
        status: selectedStatus === 'all' ? undefined : selectedStatus,
      })
      setResult(reports)
      setEmptyMessage('Brak zgłoszeń dla wybranych filtrów.')
    } catch (error) {
      setResult({
        items: [],
        pageNumber: 1,
        pageSize,
        totalCount: 0,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      })
      setEmptyMessage(
        isUnauthorizedError(error)
          ? adminAuthMessage
          : 'Nie udało się pobrać zgłoszeń.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void (async () => {
      await Promise.resolve()
      await loadReports()
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, selectedStatus])

  const submitSearch = (event: FormEvent) => {
    event.preventDefault()
    setPageNumber(1)
    void loadReports()
  }

  return (
    <main className="min-w-0 p-4 lg:p-6">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold">Zgłoszenia</h1>
        <p className="mt-1 text-sm text-slate-500">
          Lista raportów odebranych przez system UrbanFix.
        </p>
      </div>

      <section className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <form className="grid gap-3 lg:grid-cols-[1fr_220px_auto]" onSubmit={submitSearch}>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={17}
            />
            <input
              className="h-10 w-full rounded-md border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              onChange={(event) => setSearchId(event.target.value)}
              placeholder="Szukaj po pełnym ID zgłoszenia"
              value={searchId}
            />
          </div>
          <select
            className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            onChange={(event) => {
              setSelectedStatus(event.target.value as ReportStatus | 'all')
              setPageNumber(1)
            }}
            value={selectedStatus}
          >
            <option value="all">Wszystkie statusy</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {reportStatusLabels[status]}
              </option>
            ))}
          </select>
          <button
            className="h-10 rounded-md bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
            type="submit"
          >
            Szukaj
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Data zgłoszenia</th>
                <th className="px-4 py-3">E-mail zgłaszającego</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-500" colSpan={4}>
                    Ładowanie zgłoszeń...
                  </td>
                </tr>
              )}
              {!isLoading && result?.items.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-500" colSpan={4}>
                    {emptyMessage}
                  </td>
                </tr>
              )}
              {!isLoading &&
                result?.items.map((report) => (
                  <tr
                    className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                  >
                    <td className="px-4 py-3 font-mono">{shortId(report.id)}</td>
                    <td className="px-4 py-3">
                      {formatDateTime(report.uploadedAt)}
                    </td>
                    <td className="px-4 py-3">
                      {report.submitterEmail ?? 'Brak'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={report.status} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm">
          <p className="text-slate-500">
            Strona {result?.pageNumber ?? pageNumber} z {result?.totalPages ?? 1}
          </p>
          <div className="flex gap-2">
            <button
              className="inline-flex h-9 items-center gap-1 rounded-md border border-slate-300 px-3 font-medium disabled:opacity-40"
              disabled={isLoading || !result?.hasPreviousPage}
              onClick={() => setPageNumber((page) => Math.max(1, page - 1))}
              type="button"
            >
              <ChevronLeft size={16} />
              Poprzednia
            </button>
            <button
              className="inline-flex h-9 items-center gap-1 rounded-md border border-slate-300 px-3 font-medium disabled:opacity-40"
              disabled={isLoading || !result?.hasNextPage}
              onClick={() => setPageNumber((page) => page + 1)}
              type="button"
            >
              Następna
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {selectedReport && (
        <ReportDrawer
          key={selectedReport.id}
          onClose={() => setSelectedReport(null)}
          onRefresh={loadReports}
          report={selectedReport}
        />
      )}
    </main>
  )
}
