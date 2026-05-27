import { formatDate, formatPercent } from '@/utils/format'
import type { TimelineEvent } from '@/types/complaint'

interface TimelineEntry {
  title: string
  meta: string
  description: string
  tone?: 'brand' | 'emerald' | 'amber' | 'rose' | 'slate'
}

interface ComplaintActivityTimelineProps {
  entries: TimelineEntry[]
  emptyTitle: string
  emptyDescription: string
}

const toneStyles: Record<NonNullable<TimelineEntry['tone']>, string> = {
  brand: 'bg-brand-600',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  slate: 'bg-slate-500',
}

export function ComplaintActivityTimeline({ entries, emptyTitle, emptyDescription }: ComplaintActivityTimelineProps) {
  if (!entries.length) {
    return (
      <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50/80 px-5 py-6 text-sm text-slate-500">
        <p className="font-semibold text-slate-900">{emptyTitle}</p>
        <p className="mt-2 leading-6">{emptyDescription}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {entries.map((entry, index) => (
        <div key={`${entry.title}-${index}`} className="flex gap-3 rounded-[22px] border border-slate-200 bg-slate-50/70 px-4 py-3">
          <div className="flex flex-col items-center pt-0.5">
            <span className={`h-3 w-3 rounded-full ${toneStyles[entry.tone || 'slate']}`} />
            {index < entries.length - 1 && <span className="mt-2 h-full w-px flex-1 bg-slate-200" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-950">{entry.title}</p>
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{entry.meta}</span>
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-500">{entry.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

/** Map an action string to a display-friendly tone */
function actionToTone(action: string): TimelineEntry['tone'] {
  const a = action.toUpperCase()
  if (a.includes('ACCEPTED') || a.includes('RESOLVED')) return 'emerald'
  if (a.includes('FORWARDED') || a.includes('ASSIGNED')) return 'amber'
  if (a.includes('REJECTED')) return 'rose'
  if (a.includes('STATUS_')) return 'brand'
  return 'slate'
}

/** Map an action string to a human-readable title */
function actionToTitle(action: string): string {
  const a = action.toUpperCase()
  if (a === 'FORWARDED') return 'Forwarded to department'
  if (a === 'STATUS_ACCEPTED') return 'Complaint accepted'
  if (a === 'STATUS_REJECTED') return 'Complaint rejected'
  if (a === 'STATUS_FORWARDED') return 'Forwarded to department'
  if (a === 'STATUS_IN_PROGRESS') return 'Work in progress'
  if (a === 'STATUS_RESOLVED') return 'Complaint resolved'
  if (a.startsWith('STATUS_')) return `Status → ${a.replace('STATUS_', '').replace(/_/g, ' ').toLowerCase()}`
  if (a === 'AUTO_ASSIGNED') return 'Auto-assigned by system'
  if (a === 'MANUALLY_REASSIGNED') return 'Manually reassigned'
  if (a === 'ESCALATED') return 'Escalated'
  return action.replace(/_/g, ' ')
}

/** Convert real API timeline events to display entries */
export function buildTimelineFromEvents(events: TimelineEvent[]): TimelineEntry[] {
  return events.map((event) => ({
    title: actionToTitle(event.action),
    meta: formatDate(event.occurredAt),
    description: [
      event.department ? `Dept: ${event.department}` : '',
      event.performedBy ? `By: ${event.performedBy}` : '',
      event.reason || '',
    ].filter(Boolean).join(' · ') || 'No additional details',
    tone: actionToTone(event.action),
  }))
}

export function buildLiveComplaintTimeline(args: {
  timestamp: string
  status: string
  department?: string | null
  aiLabel?: string | null
  aiConfidence?: number | null
  adminNotes?: string | null
}) {
  const entries: TimelineEntry[] = [
    {
      title: 'Complaint submitted',
      meta: formatDate(args.timestamp),
      description: 'Citizen report captured.',
      tone: 'brand',
    },
    {
      title: 'AI analysis',
      meta: args.aiConfidence != null ? formatPercent(args.aiConfidence) : 'Processed',
      description: `Label: ${args.aiLabel || 'Unclassified'}${args.aiConfidence != null ? ` · ${formatPercent(args.aiConfidence)} confidence` : ''}.`,
      tone: 'emerald',
    },
    {
      title: 'Current status',
      meta: args.department || 'Unassigned',
      description: `Status: ${args.status.toLowerCase().replace(/_/g, ' ')}.`,
      tone: 'amber',
    },
  ]

  if (args.adminNotes?.trim()) {
    entries.push({
      title: 'Admin note',
      meta: 'Note',
      description: args.adminNotes.trim(),
      tone: 'rose',
    })
  }

  return entries
}
