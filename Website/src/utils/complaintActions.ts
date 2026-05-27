/**
 * Civic workflow complaint actions.
 *
 * Status flow:
 *   PENDING → ACCEPTED → FORWARDED → IN_PROGRESS → RESOLVED
 *          ↘ REJECTED
 *
 * Admin actions:
 *   accept   → ACCEPTED  (admin verifies complaint is legitimate)
 *   reject   → REJECTED  (admin rejects invalid/duplicate complaint)
 *   forward  → FORWARDED (admin forwards to department — handled separately)
 *   resolve  → RESOLVED  (admin confirms resolution after department response)
 */

export type ComplaintAction = 'accept' | 'reject' | 'resolve'

export const ACTION_TO_STATUS: Record<ComplaintAction, string> = {
  accept: 'ACCEPTED',
  reject: 'REJECTED',
  resolve: 'RESOLVED',
}

export const ACTION_LABEL: Record<ComplaintAction, string> = {
  accept: 'Accept Complaint',
  reject: 'Reject Complaint',
  resolve: 'Mark Resolved',
}

/** Returns true if the action is a legal transition from the given status. */
export function canPerformAction(
  action: ComplaintAction,
  status: string | null | undefined
): boolean {
  const s = (status ?? '').toUpperCase()
  switch (action) {
    case 'accept':
      return s === 'PENDING'
    case 'reject':
      return s === 'PENDING' || s === 'ACCEPTED'
    case 'resolve':
      return s === 'FORWARDED' || s === 'IN_PROGRESS' || s === 'ACCEPTED'
    default:
      return false
  }
}

/** Can the admin forward this complaint to a department? */
export function canForward(status: string | null | undefined): boolean {
  const s = (status ?? '').toUpperCase()
  return s === 'ACCEPTED'
}

/**
 * Returns a short explanation for why an action is disabled.
 * Returns null when the action is permitted.
 */
export function actionDisabledReason(
  action: ComplaintAction,
  status: string | null | undefined
): string | null {
  if (canPerformAction(action, status)) return null
  const s = (status ?? 'unknown').toUpperCase()
  switch (action) {
    case 'accept':
      if (s === 'ACCEPTED') return 'Already accepted'
      if (s === 'REJECTED') return 'Complaint was rejected'
      if (s === 'RESOLVED') return 'Already resolved'
      return `Cannot accept in ${s} state`
    case 'reject':
      if (s === 'REJECTED') return 'Already rejected'
      if (s === 'RESOLVED') return 'Cannot reject a resolved complaint'
      if (s === 'FORWARDED' || s === 'IN_PROGRESS') return 'Already forwarded to department'
      return `Cannot reject in ${s} state`
    case 'resolve':
      if (s === 'PENDING') return 'Accept and forward first'
      if (s === 'RESOLVED') return 'Already resolved'
      if (s === 'REJECTED') return 'Cannot resolve a rejected complaint'
      return `Cannot resolve in ${s} state`
  }
}

/** Convenience: returns true if the complaint is in a terminal state. */
export function isTerminalStatus(status: string | null | undefined): boolean {
  const s = (status ?? '').toUpperCase()
  return s === 'RESOLVED' || s === 'REJECTED'
}
