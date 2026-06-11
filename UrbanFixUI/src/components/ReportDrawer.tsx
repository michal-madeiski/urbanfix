import { useEffect, useMemo, useState } from 'react'
import { Check, X } from 'lucide-react'
import { completeAssignment, getAssignment } from '../api/assignmentsApi'
import { getNotifications } from '../api/notificationsApi'
import { getReportPhotoUrl } from '../api/reportsApi'
import { getTimeline } from '../api/timelinesApi'
import {
  acceptVerification,
  rejectVerification,
} from '../api/verificationsApi'
import { PhotoPreview } from './PhotoPreview'
import { ReadOnlyMap } from './ReadOnlyMap'
import { StatusBadge } from './StatusBadge'
import { useToast } from './toastContext'
import { isConflictError, isUnauthorizedError } from '../lib/apiErrors'
import { formatDateTime, formatFileSize } from '../lib/format'
import { timelineStatusLabels } from '../lib/reportLabels'
import type {
  Assignment,
  Notification,
  Report,
  TimelineEntry,
} from '../types/report'

const adminAuthMessage =
  'Zaloguj się jako administrator, aby zobaczyć te dane.'

export function ReportDrawer({
  onClose,
  onRefresh,
  report,
}: {
  onClose: () => void
  onRefresh: () => void | Promise<void>
  report: Report
}) {
  const { showToast } = useToast()
  const [currentReport, setCurrentReport] = useState(report)
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [timeline, setTimeline] = useState<TimelineEntry[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [comment, setComment] = useState('')
  const [isLoadingRelated, setIsLoadingRelated] = useState(true)
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false)
  const [relatedAuthMessage, setRelatedAuthMessage] = useState<string | null>(
    null,
  )
  const [photoFailed, setPhotoFailed] = useState(false)

  const reloadRelated = async () => {
    setIsLoadingRelated(true)
    setRelatedAuthMessage(null)

    const [assignmentResult, timelineResult, notificationsResult] =
      await Promise.allSettled([
        getAssignment(currentReport.id),
        getTimeline(currentReport.id),
        getNotifications(currentReport.id),
      ])

    const hasUnauthorized = [
      assignmentResult,
      timelineResult,
      notificationsResult,
    ].some(
      (result) =>
        result.status === 'rejected' && isUnauthorizedError(result.reason),
    )

    setAssignment(
      assignmentResult.status === 'fulfilled' ? assignmentResult.value : null,
    )
    setTimeline(
      timelineResult.status === 'fulfilled' ? timelineResult.value : [],
    )
    setNotifications(
      notificationsResult.status === 'fulfilled'
        ? notificationsResult.value
        : [],
    )

    if (hasUnauthorized) {
      setRelatedAuthMessage(adminAuthMessage)
    }

    setIsLoadingRelated(false)
  }

  useEffect(() => {
    void (async () => {
      await Promise.resolve()
      await reloadRelated()
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentReport.id])

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const accept = async () => {
    if (isSubmittingDecision) {
      return
    }

    setIsSubmittingDecision(true)

    try {
      const ok = await acceptVerification(currentReport.id, {
        comment: comment.trim() || null,
      })

      if (ok) {
        setCurrentReport({ ...currentReport, status: 'Verified' })
        showToast('Zgłoszenie zostało zatwierdzone.', 'success')
        await onRefresh()
        await reloadRelated()
      }
    } catch (error) {
      showToast(
        isUnauthorizedError(error)
          ? adminAuthMessage
          : isConflictError(error)
            ? 'To zgłoszenie zostało już zweryfikowane.'
          : 'Nie udało się zatwierdzić zgłoszenia.',
        'error',
      )
      await onRefresh()
      await reloadRelated()
    } finally {
      setIsSubmittingDecision(false)
    }
  }

  const reject = async () => {
    if (isSubmittingDecision) {
      return
    }

    setIsSubmittingDecision(true)

    try {
      const ok = await rejectVerification(currentReport.id, {
        comment: comment.trim() || null,
      })

      if (ok) {
        setCurrentReport({ ...currentReport, status: 'Rejected' })
        showToast('Zgłoszenie zostało odrzucone.', 'success')
        await onRefresh()
        await reloadRelated()
      }
    } catch (error) {
      showToast(
        isUnauthorizedError(error)
          ? adminAuthMessage
          : isConflictError(error)
            ? 'To zgłoszenie zostało już zweryfikowane.'
          : 'Nie udało się odrzucić zgłoszenia.',
        'error',
      )
      await onRefresh()
      await reloadRelated()
    } finally {
      setIsSubmittingDecision(false)
    }
  }

  const complete = async () => {
    if (!assignment || isSubmittingDecision) {
      return
    }

    setIsSubmittingDecision(true)

    try {
      const ok = await completeAssignment(assignment.assignmentId)

      if (ok) {
        setCurrentReport({ ...currentReport, status: 'Completed' })
        setAssignment({ ...assignment, status: 'Completed' })
        showToast('Zgłoszenie oznaczono jako zakończone.', 'success')
        await onRefresh()
        await reloadRelated()
      }
    } catch (error) {
      showToast(
        isUnauthorizedError(error)
          ? adminAuthMessage
          : 'Nie udało się zakończyć zgłoszenia.',
        'error',
      )
    } finally {
      setIsSubmittingDecision(false)
    }
  }

  const historyItems = useMemo(
    () =>
      [
        ...timeline.map((item) => ({
          id: item.id,
          date: item.occurredAt,
          label: timelineStatusLabels[item.newStatus],
          description: item.description ?? 'Zmieniono status zadania.',
        })),
        ...notifications.map((item) => ({
          id: item.id,
          date: item.sentAt,
          label: 'Wysłano e-mail',
          description: item.messageBody,
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [notifications, timeline],
  )

  const photoUrl = getReportPhotoUrl(currentReport.id)

  return (
    <div
      className="fixed inset-0 z-[1200] bg-slate-950/30"
      onClick={onClose}
    >
      <aside
        className="ml-auto flex h-full w-full max-w-3xl flex-col overflow-hidden bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <p className="font-mono text-xs text-slate-500">
              {currentReport.id}
            </p>
            <div className="mt-1 flex items-center gap-3">
              <h2 className="text-lg font-semibold">Szczegóły zgłoszenia</h2>
              <StatusBadge status={currentReport.status} />
            </div>
          </div>
          <button
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
            onClick={onClose}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-auto p-5">
          {isLoadingRelated && (
            <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-500">
              Ładowanie szczegółów...
            </p>
          )}

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
              fileName={currentReport.fileName}
            />
          )}

          <section className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-medium uppercase text-slate-500">Opis usterki</span>
              <p className="text-base leading-relaxed text-slate-700 whitespace-pre-wrap">
                {currentReport.description}
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <Info label="E-mail" value={currentReport.submitterEmail ?? 'Brak'} />
              <Info
                label="Data"
                value={formatDateTime(currentReport.uploadedAt)}
              />
              <Info
                label="Rozmiar pliku"
                value={formatFileSize(currentReport.fileSize)}
              />
              <Info
                label="Koordynaty"
                value={`${currentReport.latitude.toFixed(4)}, ${currentReport.longitude.toFixed(4)}`}
              />
            </dl>
            <ReadOnlyMap
              className="h-60"
              latitude={currentReport.latitude}
              longitude={currentReport.longitude}
            />
          </section>

          {relatedAuthMessage && (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {relatedAuthMessage}
            </p>
          )}

          {currentReport.status === 'New' && (
            <section className="rounded-lg border border-slate-200 p-4">
              <h3 className="text-sm font-semibold">Decyzja urzędnika</h3>
              <textarea
                className="mt-3 min-h-24 w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                onChange={(event) => setComment(event.target.value)}
                placeholder="Opcjonalny komentarz"
                value={comment}
              />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-emerald-700 text-sm font-semibold text-white hover:bg-emerald-800"
                  onClick={accept}
                  type="button"
                >
                  <Check size={16} />
                  Zatwierdź
                </button>
                <button
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-red-600 text-sm font-semibold text-white hover:bg-red-700"
                  onClick={reject}
                  type="button"
                >
                  <X size={16} />
                  Odrzuć
                </button>
              </div>
            </section>
          )}

          {currentReport.status === 'Assigned' && (
            <section className="rounded-lg border border-slate-200 p-4">
              <h3 className="text-sm font-semibold">Przypisany zespół</h3>
              <p className="mt-2 text-sm text-slate-600">
                {assignment?.teamName ?? 'Brak danych zespołu'}
              </p>
              <button
                className="mt-3 h-10 w-full rounded-md bg-emerald-700 text-sm font-semibold text-white hover:bg-emerald-800 disabled:bg-slate-300"
                disabled={!assignment}
                onClick={complete}
                type="button"
              >
                Oznacz jako zakończone
              </button>
            </section>
          )}

          <section>
            <h3 className="text-sm font-semibold">Historia</h3>
            <div className="mt-3 space-y-2">
              {!isLoadingRelated && historyItems.length === 0 && (
                <p className="text-sm text-slate-500">Brak historii.</p>
              )}
              {historyItems.map((item) => (
                <div className="rounded-md bg-slate-50 p-3" key={item.id}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-slate-500">
                      {formatDateTime(item.date)}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </aside>
    </div>
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
