import { Check, X, CheckCircle2 } from 'lucide-react'
import {
  ACTION_TO_STATUS,
  ACTION_LABEL,
  actionDisabledReason,
  canPerformAction,
  type ComplaintAction,
} from '@/utils/complaintActions'
import type { Complaint, ComplaintUpdatePayload } from '@/types/complaint'

interface ComplaintActionPanelProps {
  complaint: Complaint
  department?: string
  adminNotes?: string
  saving: boolean
  onPatch: (payload: ComplaintUpdatePayload) => void | Promise<unknown>
}

const STYLES: Record<
  ComplaintAction,
  { idle: string; active: string; icon: typeof Check; arrowLabel: string }
> = {
  accept: {
    icon: Check,
    arrowLabel: '→ Accepted',
    idle: 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100',
    active: 'border border-slate-200 bg-white text-slate-400',
  },
  reject: {
    icon: X,
    arrowLabel: '→ Rejected',
    idle: 'border border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300 hover:bg-rose-100',
    active: 'border border-slate-200 bg-white text-slate-400',
  },
  resolve: {
    icon: CheckCircle2,
    arrowLabel: '→ Resolved',
    idle: 'border border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300 hover:bg-blue-100',
    active: 'border border-slate-200 bg-white text-slate-400',
  },
}

const ACTIONS: ComplaintAction[] = ['accept', 'reject', 'resolve']

export function ComplaintActionPanel({
  complaint,
  department,
  adminNotes,
  saving,
  onPatch,
}: ComplaintActionPanelProps) {
  const handleClick = (action: ComplaintAction) => {
    const targetStatus = ACTION_TO_STATUS[action]
    onPatch({
      status: targetStatus,
      ...(department !== undefined ? { department } : {}),
      ...(adminNotes !== undefined ? { adminNotes } : {}),
    })
  }

  return (
    <div className="space-y-3">
      {ACTIONS.map((action) => {
        const allowed = canPerformAction(action, complaint.status)
        const reason = actionDisabledReason(action, complaint.status)
        const style = STYLES[action]
        const Icon = style.icon
        return (
          <button
            key={action}
            type="button"
            disabled={!allowed || saving}
            title={allowed ? undefined : reason ?? undefined}
            aria-disabled={!allowed || saving}
            onClick={() => handleClick(action)}
            className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
              allowed ? style.idle : style.active
            }`}
          >
            <span className="flex items-center gap-2">
              <Icon size={16} aria-hidden />
              {ACTION_LABEL[action]}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-70">
              {style.arrowLabel}
            </span>
          </button>
        )
      })}

      <p className="px-1 pt-1 text-[11px] text-slate-500">
        After accepting, use the Forward panel to route to the correct department.
      </p>
    </div>
  )
}
