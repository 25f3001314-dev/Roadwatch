import { CheckCircle2, Circle, Clock3, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

interface ComplaintStatusTrackerProps {
  status: string
}

/**
 * Civic workflow lifecycle steps.
 * REJECTED is a branch outcome, not a linear step.
 */
const LIFECYCLE_STEPS = [
  'PENDING',
  'ACCEPTED',
  'FORWARDED',
  'IN_PROGRESS',
  'RESOLVED',
] as const

const STATUS_COPY: Record<string, { title: string; description: string }> = {
  PENDING: {
    title: 'Submitted',
    description: 'Citizen report received; awaiting admin verification.',
  },
  ACCEPTED: {
    title: 'Accepted',
    description: 'Admin verified complaint as legitimate.',
  },
  FORWARDED: {
    title: 'Forwarded',
    description: 'Routed to the responsible government department.',
  },
  IN_PROGRESS: {
    title: 'In progress',
    description: 'Department is actively working on the issue.',
  },
  RESOLVED: {
    title: 'Resolved',
    description: 'Issue fixed and closure confirmed.',
  },
  REJECTED: {
    title: 'Rejected',
    description: 'Complaint was rejected during verification.',
  },
}

export function ComplaintStatusTracker({ status }: ComplaintStatusTrackerProps) {
  const upper = (status || '').toUpperCase()
  const isRejected = upper === 'REJECTED'

  if (isRejected) {
    const copy = STATUS_COPY.REJECTED
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
          <XCircle size={20} className="mt-0.5 text-rose-600" aria-hidden />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-rose-700">{copy.title}</p>
              <Badge variant="status" value="REJECTED" />
            </div>
            <p className="mt-1 text-sm leading-6 text-rose-600/90">{copy.description}</p>
          </div>
        </div>
      </div>
    )
  }

  const currentIndex = LIFECYCLE_STEPS.indexOf(upper as (typeof LIFECYCLE_STEPS)[number])

  return (
    <div className="space-y-3">
      {LIFECYCLE_STEPS.map((step, index) => {
        const isCurrent = step === upper
        const isComplete = currentIndex > index
        const copy = STATUS_COPY[step]

        return (
          <div key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm shadow-sm ${
                  isCurrent
                    ? 'border-brand-200 bg-brand-600 text-white'
                    : isComplete
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                      : 'border-slate-200 bg-white text-slate-400'
                }`}
              >
                {isCurrent ? <Clock3 size={15} /> : isComplete ? <CheckCircle2 size={15} /> : <Circle size={15} />}
              </div>
              {index < LIFECYCLE_STEPS.length - 1 && <div className="mt-2 h-full w-px flex-1 bg-slate-200" />}
            </div>

            <div className="min-w-0 flex-1 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className={`text-sm font-semibold ${isCurrent ? 'text-slate-950' : 'text-slate-700'}`}>
                  {copy.title}
                </p>
                <Badge variant="status" value={step} />
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-500">{copy.description}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
