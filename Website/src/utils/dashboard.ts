import type { Complaint } from '@/types/complaint'

export interface DashboardBucket {
  label: string
  count: number
  meta?: string
}

export interface TrendPoint {
  label: string
  total: number
  resolved: number
  pending: number
  assigned: number
  inProgress: number
}

export interface DistributionPoint {
  name: string
  value: number
  fill: string
}

export interface DepartmentPerformancePoint {
  name: string
  total: number
  resolved: number
  open: number
  resolvedRate: number
}

const DISTRIBUTION_COLORS = ['#7c3aed', '#0ea5e9', '#14b8a6', '#f59e0b', '#f43f5e', '#8b5cf6', '#22c55e']
const STATUS_ORDER = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'] as const
const STATUS_LABELS: Record<(typeof STATUS_ORDER)[number], string> = {
  PENDING: 'Pending',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In progress',
  RESOLVED: 'Resolved',
  REJECTED: 'Rejected',
}
const STATUS_COLORS: Record<(typeof STATUS_ORDER)[number], string> = {
  PENDING: '#eab308',
  ASSIGNED: '#0ea5e9',
  IN_PROGRESS: '#8b5cf6',
  RESOLVED: '#16a34a',
  REJECTED: '#94a3b8',
}
const SEVERITY_ORDER = ['HIGH', 'MEDIUM', 'LOW'] as const
const SEVERITY_LABELS: Record<(typeof SEVERITY_ORDER)[number], string> = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
}
const SEVERITY_COLORS: Record<(typeof SEVERITY_ORDER)[number], string> = {
  HIGH: '#dc2626',
  MEDIUM: '#f59e0b',
  LOW: '#16a34a',
}

const DAY_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
})

function normalizeLabel(value: string | null | undefined, fallback = 'Unassigned'): string {
  const safeValue = value?.trim()
  return safeValue ? safeValue : fallback
}

function normalizeStatus(value: string | null | undefined): string {
  return normalizeLabel(value, 'Unknown').toUpperCase()
}

function complaintDateKey(value: string): string {
  return new Date(value).toLocaleDateString('en-CA')
}

function bucketDistribution(
  complaints: Complaint[],
  getter: (complaint: Complaint) => string | null | undefined,
  fallback = 'Unassigned',
  palette = DISTRIBUTION_COLORS
): DistributionPoint[] {
  return groupComplaintsBy(complaints, getter, fallback)
    .filter((bucket) => bucket.count > 0)
    .map((bucket, index) => ({
      name: bucket.label,
      value: bucket.count,
      fill: palette[index % palette.length],
    }))
}

export function groupComplaintsBy(
  complaints: Complaint[],
  getter: (complaint: Complaint) => string | null | undefined,
  fallback = 'Unassigned'
): DashboardBucket[] {
  const buckets = new Map<string, number>()

  complaints.forEach((complaint) => {
    const label = normalizeLabel(getter(complaint), fallback)
    buckets.set(label, (buckets.get(label) || 0) + 1)
  })

  return [...buckets.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label))
}

export function buildDailyTrend(complaints: Complaint[], days = 30): TrendPoint[] {
  const counts = new Map<string, number>()
  const resolvedByDate = new Map<string, number>()
  const pendingByDate = new Map<string, number>()
  const assignedByDate = new Map<string, number>()
  const inProgressByDate = new Map<string, number>()

  complaints.forEach((complaint) => {
    const key = complaintDateKey(complaint.timestamp)
    counts.set(key, (counts.get(key) || 0) + 1)

    switch (complaint.status?.trim().toUpperCase()) {
      case 'RESOLVED':
        resolvedByDate.set(key, (resolvedByDate.get(key) || 0) + 1)
        break
      case 'ASSIGNED':
        assignedByDate.set(key, (assignedByDate.get(key) || 0) + 1)
        break
      case 'IN_PROGRESS':
        inProgressByDate.set(key, (inProgressByDate.get(key) || 0) + 1)
        break
      default:
        pendingByDate.set(key, (pendingByDate.get(key) || 0) + 1)
        break
    }
  })

  const today = new Date()

  return Array.from({ length: days }).map((_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (days - 1 - index))
    const key = date.toLocaleDateString('en-CA')

    return {
      label: DAY_FORMATTER.format(date),
      total: counts.get(key) || 0,
      resolved: resolvedByDate.get(key) || 0,
      pending: pendingByDate.get(key) || 0,
      assigned: assignedByDate.get(key) || 0,
      inProgress: inProgressByDate.get(key) || 0,
    }
  })
}

export function buildStatusDistribution(complaints: Complaint[]): DistributionPoint[] {
  return STATUS_ORDER.map((status) => ({
    name: STATUS_LABELS[status],
    value: complaints.filter((complaint) => complaint.status?.trim().toUpperCase() === status).length,
    fill: STATUS_COLORS[status],
  })).filter((bucket) => bucket.value > 0)
}

export function buildSeverityDistribution(complaints: Complaint[]): DistributionPoint[] {
  return SEVERITY_ORDER.map((severity) => ({
    name: SEVERITY_LABELS[severity],
    value: complaints.filter((complaint) => complaint.severity?.trim().toUpperCase() === severity).length,
    fill: SEVERITY_COLORS[severity],
  })).filter((bucket) => bucket.value > 0)
}

export function buildLabelDistribution(complaints: Complaint[]): DistributionPoint[] {
  return bucketDistribution(complaints, (complaint) => complaint.aiLabel || 'Unclassified', 'Unclassified')
}

export function buildRoadTypeDistribution(complaints: Complaint[]): DistributionPoint[] {
  return bucketDistribution(complaints, (complaint) => complaint.roadType || 'Unspecified', 'Unspecified')
}

export function buildDepartmentPerformanceData(complaints: Complaint[]): DepartmentPerformancePoint[] {
  return groupComplaintsBy(complaints, (complaint) => complaint.department || 'Unassigned', 'Unassigned')
    .filter((bucket) => bucket.count > 0)
    .map((bucket) => {
      const resolved = complaints.filter(
        (complaint) => (complaint.department || 'Unassigned').trim() === bucket.label && complaint.status?.toUpperCase() === 'RESOLVED'
      ).length
      const open = bucket.count - resolved

      return {
        name: bucket.label,
        total: bucket.count,
        resolved,
        open,
        resolvedRate: bucket.count ? resolved / bucket.count : 0,
      }
    })
    .sort((left, right) => right.total - left.total || left.name.localeCompare(right.name))
}

export function countGeoTaggedComplaints(complaints: Complaint[]): number {
  return complaints.filter((complaint) => complaint.lat != null && complaint.lng != null).length
}

export function countUniqueLabels(
  complaints: Complaint[],
  getter: (complaint: Complaint) => string | null | undefined,
  fallback = 'Unassigned'
): number {
  return new Set(complaints.map((complaint) => normalizeLabel(getter(complaint), fallback))).size
}

export function countByStatus(complaints: Complaint[]): DashboardBucket[] {
  const order = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED']
  const grouped = groupComplaintsBy(complaints, (complaint) => normalizeStatus(complaint.status), 'Unknown')

  return grouped.sort((left, right) => {
    const leftIndex = order.indexOf(left.label)
    const rightIndex = order.indexOf(right.label)

    if (leftIndex !== -1 || rightIndex !== -1) {
      return (leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex) - (rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex)
    }

    return right.count - left.count || left.label.localeCompare(right.label)
  })
}

export function getLatestHighSeverityComplaints(complaints: Complaint[], limit = 5): Complaint[] {
  return complaints
    .filter((complaint) => complaint.severity?.toUpperCase() === 'HIGH')
    .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime())
    .slice(0, limit)
}

export function hasComplaintData(complaints: Complaint[]): boolean {
  return complaints.length > 0
}

export function formatComplaintLocation(complaint: Complaint): string {
  if (complaint.lat == null || complaint.lng == null) return 'Location not captured'
  return `${complaint.lat!.toFixed(4)}, ${complaint.lng!.toFixed(4)}`
}