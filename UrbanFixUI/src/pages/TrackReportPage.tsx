import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { getReport, getReportPhotoUrl } from '../api/reportsApi'
import { getTimeline } from '../api/timelinesApi'
import { PhotoPreview } from '../components/PhotoPreview'
import { ReadOnlyMap } from '../components/ReadOnlyMap'
import { StatusBadge } from '../components/StatusBadge'
import { formatDateTime } from '../lib/format'
import { timelineStatusLabels } from '../lib/reportLabels'
import type { Report, TimelineEntry } from '../types/report'

type TimelineStep = {
  id: string
  label: string
  description: string
  date: string
  tone: 'neutral' | 'danger' | 'success' | 'info'
}

const getTone = (status: string): 'neutral' | 'danger' | 'success' | 'info' => {
  if (status === 'Completed') return 'success'
  if (status === 'Rejected') return 'danger'
  if (status === 'InProgress') return 'info'
  return 'neutral'
}

export function TrackReportPage() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('reportId') ?? '')
  const [report, setReport] = useState<Report | null>(null)
  const [timeline, setTimeline] = useState<TimelineEntry[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [photoFailed, setPhotoFailed] = useState(false)

  const loadReport = async (reportId: string) => {
    if (!reportId.trim()) {
      return
    }

    setIsLoading(true)
    setHasSearched(true)
    const foundReport = await getReport(reportId.trim())
    setReport(foundReport)
    setPhotoFailed(false)
    setTimeline(foundReport ? await getTimeline(foundReport.id) : [])
    setIsLoading(false)
  }

  useEffect(() => {
    const reportId = searchParams.get('reportId')

    if (reportId) {
      void (async () => {
        setIsLoading(true)
        setHasSearched(true)
        const foundReport = await getReport(reportId.trim())
        setReport(foundReport)
        setPhotoFailed(false)
        setTimeline(foundReport ? await getTimeline(foundReport.id) : [])
        setIsLoading(false)
      })()
    }
    // We only want to hydrate once from the URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const steps = useMemo(() => {
    const uniqueTimeline = timeline.filter((entry, index, self) =>
      self.findIndex(
        (t) =>
          t.newStatus === entry.newStatus &&
          t.occurredAt === entry.occurredAt
      ) === index
    )

    const baseSteps: TimelineStep[] = uniqueTimeline.map((entry) => ({
      id: entry.id,
      label: timelineStatusLabels[entry.newStatus] ?? entry.newStatus,
      description: entry.description ?? '',
      date: entry.occurredAt,
      tone: getTone(entry.newStatus),
    }))

    return baseSteps.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )
  }, [timeline])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    void loadReport(query)
  }

  const photoUrl = report ? getReportPhotoUrl(report.id) : null

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/">
            <p className="text-sm font-semibold text-emerald-700">UrbanFix</p>
            <h1 className="text-2xl font-semibold">Śledzenie zgłoszenia</h1>
          </Link>
          <Link className="text-sm font-medium text-slate-600" to="/">
            Nowe zgłoszenie
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <form
          className="mx-auto flex max-w-2xl gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
          onSubmit={submit}
        >
          <input
            className="h-11 flex-1 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Wprowadź numer zgłoszenia"
            value={query}
          />
          <button
            className="inline-flex h-11 items-center gap-2 rounded-md bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
            type="submit"
          >
            <Search size={17} />
            Szukaj
          </button>
        </form>

        {isLoading && (
          <p className="mt-6 text-center text-sm text-slate-500">Szukam...</p>
        )}

        {hasSearched && !isLoading && !report && (
          <p className="mt-6 text-center text-sm text-red-600">
            Nie znaleziono zgłoszenia o podanym numerze.
          </p>
        )}

        {report && (
          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
                {photoUrl && !photoFailed ? (
                  <a className="block" href={photoUrl} rel="noreferrer" target="_blank">
                    <img
                      alt="Zdjęcie zgłoszenia"
                      className="h-64 w-full rounded-md object-cover"
                      onError={() => setPhotoFailed(true)}
                      src={photoUrl}
                    />
                  </a>
                ) : (
                  <PhotoPreview
                    className="h-64 w-full"
                    fileName={report.fileName}
                  />
                )}
                <div className="min-w-0 flex flex-col justify-start gap-4">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <span className="font-mono text-xs text-slate-500">{report.id}</span>
                    <StatusBadge status={report.status} />
                  </div>
                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <Info label="Data" value={formatDateTime(report.uploadedAt)} />
                    <Info
                      label="E-mail"
                      value={report.submitterEmail ?? 'Brak'}
                    />
                    <Info label="Plik" value={report.fileName ?? 'Brak'} />
                    <Info
                      label="Lokalizacja"
                      value={`${report.latitude.toFixed(5)}, ${report.longitude.toFixed(5)}`}
                    />
                  </dl>
                </div>
              </div>
              <div className="mt-5 border-t border-slate-100 pt-4 space-y-1">
                <span className="text-xs font-medium uppercase text-slate-500">Opis usterki</span>
                <p className="text-base leading-relaxed text-slate-700 whitespace-pre-wrap">
                  {report.description}
                </p>
              </div>
              <div className="mt-5">
                <ReadOnlyMap
                  className="h-64"
                  latitude={report.latitude}
                  longitude={report.longitude}
                />
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-base font-semibold">Oś czasu</h2>
              <div className="mt-4 space-y-0">
                {steps.map((step, index) => (
                  <div
                    className="grid grid-cols-[20px_minmax(0,1fr)] gap-3"
                    key={step.id}
                  >
                    <div className="relative flex min-h-16 justify-center">
                      <div
                        className={`relative z-10 mt-0.5 h-4 min-h-4 w-4 min-w-4 shrink-0 rounded-full ${
                          step.tone === 'danger'
                            ? 'bg-red-600'
                            : step.tone === 'success'
                              ? 'bg-emerald-600'
                              : step.tone === 'info'
                                ? 'bg-blue-600'
                                : 'bg-slate-900'
                        }`}
                      />
                      {index < steps.length - 1 && (
                        <div className="absolute bottom-0 top-[22px] w-px bg-slate-200" />
                      )}
                    </div>
                    <div className="pb-5">
                      <p className="text-sm font-semibold">{step.label}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {step.description}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDateTime(step.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm text-slate-800">{value}</dd>
    </div>
  )
}
