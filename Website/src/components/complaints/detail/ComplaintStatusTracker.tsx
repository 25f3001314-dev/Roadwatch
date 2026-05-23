import { CheckCircle2, Circle, Clock3 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { STATUSES } from '@/types/complaint'

interface ComplaintStatusTrackerProps {
  status: string
}

const STATUS_COPY: Record<string, { title: string; description: string }> = {
  PENDING: { title: 'Queued', description: 'Awaiting assignment and first action.' },
  ASSIGNED: { title: 'Assigned', description: 'Routing selected and ownership confirmed.' },
  IN_PROGRESS: { title: 'In progress', description: 'Field or office teams are actively handling it.' },
  RESOLVED: { title: 'Resolved', description: 'Case closed in the current live snapshot.' },
}

export function ComplaintStatusTracker({ status }: ComplaintStatusTrackerProps) {
  const currentIndex = STATUSES.indexOf(status as (typeof STATUSES)[number])

  return (
    <div className="space-y-3">
      {STATUSES.map((step, index) => {
        const isCurrent = step === status
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
              {index < STATUSES.length - 1 && <div className="mt-2 h-full w-px flex-1 bg-slate-200" />}
            </div>

            <div className="min-w-0 flex-1 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className={`text-sm font-semibold ${isCurrent ? 'text-slate-950' : 'text-slate-700'}`}>{copy.title}</p>
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