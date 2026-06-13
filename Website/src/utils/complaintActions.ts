/**
 * Civic workflow complaint actions.
 *
 * Status flow:
 *   PENDING → ACCEPTED → FORWARDED → IN_PROGRESS → PENDING_APPROVAL → RESOLVED
 *          ↘ REJECTED
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

export function canPerformAction(
  action: ComplaintAction,
  status: string | null | undefined
): boolean {
  const s = (status ?? '').toUpperCase()
  switch (action) {
    case 'accept':
      return s === 'PENDING'
    case 'reject':
      return s === 'PENDING'
    case 'resolve':
      return s === 'PENDING_APPROVAL'
    default:
      return false
  }
}

export function canForward(status: string | null | undefined): boolean {
  const s = (status ?? '').toUpperCase()
  return s === 'ACCEPTED'
}

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
      if (s === 'ACCEPTED') return 'Already accepted — cannot reject'
      if (s === 'REJECTED') return 'Already rejected'
      if (s === 'RESOLVED') return 'Cannot reject a resolved complaint'
      if (s === 'FORWARDED' || s === 'IN_PROGRESS') return 'Already forwarded to department'
      return `Cannot reject in ${s} state`
    case 'resolve':
      if (s === 'PENDING') return 'Accept and forward first'
      if (s === 'ACCEPTED') return 'Forward to department first'
      if (s === 'FORWARDED' || s === 'IN_PROGRESS') return 'Waiting for officer resolution proof'
      if (s === 'RESOLVED') return 'Already resolved'
      if (s === 'REJECTED') return 'Cannot resolve a rejected complaint'
      return `Cannot resolve in ${s} state`
  }
}

export function isTerminalStatus(status: string | null | undefined): boolean {
  const s = (status ?? '').toUpperCase()
  return s === 'RESOLVED' || s === 'REJECTED'
}