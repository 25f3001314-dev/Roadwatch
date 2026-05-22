import { useCallback, useEffect, useState } from 'react'
import { fetchComplaints, type ComplaintFilters } from '@/api/complaints'
import { PAGE_SIZE } from '@/constants/config'
import type { Complaint } from '@/types/complaint'

export interface ComplaintListFilters {
  status: string
  severity: string
  department: string
  roadType: string
}

const emptyFilters: ComplaintListFilters = {
  status: '',
  severity: '',
  department: '',
  roadType: '',
}

export function useComplaints(initialPage = 0, pageSize = PAGE_SIZE) {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(initialPage)
  const [filters, setFilters] = useState<ComplaintListFilters>(emptyFilters)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const params: ComplaintFilters = {
      page,
      size: pageSize,
      status: filters.status || undefined,
      severity: filters.severity || undefined,
      department: filters.department || undefined,
      roadType: filters.roadType || undefined,
    }
    try {
      const data = await fetchComplaints(params)
      setComplaints(data.content)
      setTotalPages(data.totalPages)
    } catch {
      setError('Failed to load complaints')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, filters])

  useEffect(() => {
    load()
  }, [load])

  const updateFilter = (key: keyof ComplaintListFilters, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }))
    setPage(0)
  }

  const clearFilters = () => {
    setFilters(emptyFilters)
    setPage(0)
  }

  return {
    complaints,
    totalPages,
    page,
    setPage,
    filters,
    updateFilter,
    clearFilters,
    loading,
    error,
    reload: load,
  }
}
