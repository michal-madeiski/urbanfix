import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent, MouseEvent } from 'react'
import { ChevronDown, Pencil, Plus, Trash2, X } from 'lucide-react'
import {
  createTeam,
  deleteTeam,
  getAssignments,
  getTeams,
  updateTeam,
} from '../api/assignmentsApi'
import { getReportsByDateDesc } from '../api/reportsApi'
import { useToast } from '../components/toastContext'
import { isUnauthorizedError } from '../lib/apiErrors'
import { shortId } from '../lib/format'
import type { Assignment, Report, TechnicalTeam } from '../types/report'

const adminAuthMessage =
  'Zaloguj się jako administrator, aby zobaczyć te dane.'

export function AdminTeamsPage() {
  const { showToast } = useToast()
  const [teams, setTeams] = useState<TechnicalTeam[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null)
  const [editingTeam, setEditingTeam] = useState<TechnicalTeam | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const [teams, assignments, reports] = await Promise.all([
        getTeams('all'),
        getAssignments(1, 100),
        getReportsByDateDesc({ pageNumber: 1, pageSize: 100 }),
      ])
      setTeams(teams)
      setAssignments(assignments.items)
      setReports(reports.items)
    } catch (error) {
      setTeams([])
      setAssignments([])
      setReports([])
      showToast(
        isUnauthorizedError(error)
          ? adminAuthMessage
          : 'Nie udało się pobrać zespołów.',
        'error',
      )
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    void (async () => {
      await Promise.resolve()
      await load()
    })()
  }, [load])

  const reportsById = useMemo(
    () => new Map(reports.map((report) => [report.id, report])),
    [reports],
  )

  const openCreate = () => {
    setEditingTeam(null)
    setIsModalOpen(true)
  }

  const openEdit = (event: MouseEvent, team: TechnicalTeam) => {
    event.stopPropagation()
    setEditingTeam(team)
    setIsModalOpen(true)
  }

  const removeTeam = async (event: MouseEvent, team: TechnicalTeam) => {
    event.stopPropagation()

    if (!window.confirm('Czy na pewno chcesz usunąć ten zespół?')) {
      return
    }

    const ok = await deleteTeam(team.id)

    if (ok) {
      showToast('Zespół został usunięty.', 'success')
      await load()
    }
  }

  return (
    <main className="min-w-0 p-4 lg:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Zespoły Techniczne</h1>
          <p className="mt-1 text-sm text-slate-500">
            Zarządzanie nazwami ekip i podgląd przypisanych zadań.
          </p>
        </div>
        <button
          className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
          onClick={openCreate}
          type="button"
        >
          <Plus size={17} />
          Dodaj zespół
        </button>
      </div>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Nazwa zespołu</th>
              <th className="px-4 py-3 text-slate-400">Dostępność</th>
              <th className="w-32 px-4 py-3 text-right">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={3}>
                  Ładowanie zespołów...
                </td>
              </tr>
            )}
            {!isLoading && teams.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={3}>
                  Brak zespołów technicznych.
                </td>
              </tr>
            )}
            {!isLoading &&
              teams.map((team) => {
                const teamAssignments = assignments.filter(
                  (assignment) => assignment.assignedTeamId === team.id,
                )
                const isExpanded = expandedTeamId === team.id

                return (
                  <Fragment key={team.id}>
                    <tr
                      className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                      onClick={() =>
                        setExpandedTeamId(isExpanded ? null : team.id)
                      }
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ChevronDown
                            className={
                              isExpanded ? 'rotate-180 text-slate-700' : ''
                            }
                            size={16}
                          />
                          <span className="font-medium">{team.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {team.isAvailable ? 'Dostępny' : 'Zajęty'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
                            onClick={(event) => openEdit(event, team)}
                            type="button"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="rounded-md p-2 text-red-600 hover:bg-red-50"
                            onClick={(event) => void removeTeam(event, team)}
                            type="button"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <td className="px-10 py-3 text-sm" colSpan={3}>
                          {teamAssignments.length === 0 ? (
                            <p className="text-slate-500">
                              Brak przypisanych zgłoszeń.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {teamAssignments.map((assignment) => {
                                const report = reportsById.get(
                                  assignment.reportId,
                                )

                                return (
                                  <div
                                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-600"
                                    key={assignment.assignmentId}
                                  >
                                    <span className="font-mono text-xs">
                                      {shortId(assignment.reportId)}
                                    </span>
                                    <span className="ml-3">
                                      {report?.description ?? 'Brak opisu'}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
          </tbody>
        </table>
      </section>

      {isModalOpen && (
        <TeamModal
          onClose={() => setIsModalOpen(false)}
          onSaved={async (mode) => {
            setIsModalOpen(false)
            showToast(
              mode === 'create'
                ? 'Zespół został dodany.'
                : 'Zespół został zaktualizowany.',
              'success',
            )
            await load()
          }}
          team={editingTeam}
        />
      )}
    </main>
  )
}

function TeamModal({
  onClose,
  onSaved,
  team,
}: {
  onClose: () => void
  onSaved: (mode: 'create' | 'update') => void | Promise<void>
  team: TechnicalTeam | null
}) {
  const [name, setName] = useState(team?.name ?? '')

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const submit = async (event: FormEvent) => {
    event.preventDefault()

    if (!name.trim()) {
      return
    }

    if (team) {
      await updateTeam(team.id, { name })
      await onSaved('update')
      return
    }

    await createTeam({ name, isAvailable: true })
    await onSaved('create')
  }

  return (
    <div
      className="fixed inset-0 z-[1300] flex items-center justify-center bg-slate-950/30 px-4"
      onClick={onClose}
    >
      <form
        className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
        onSubmit={submit}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {team ? 'Edytuj zespół' : 'Dodaj zespół'}
          </h2>
          <button
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>
        <label className="mt-4 block">
          <span className="text-sm font-medium">Nazwa</span>
          <input
            className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            onChange={(event) => setName(event.target.value)}
            value={name}
          />
        </label>
        <button
          className="mt-5 h-10 w-full rounded-md bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800"
          type="submit"
        >
          Zapisz
        </button>
      </form>
    </div>
  )
}
