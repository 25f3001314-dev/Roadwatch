import { useEffect } from 'react'
import { fetchStats } from '@/api/complaints'
import { POLL_INTERVAL_MS } from '@/constants/config'
import type { ComplaintStats } from '@/types/complaint'
import { useAsync } from './useAsync'

export function useStats(poll = false) {
  const state = useAsync<ComplaintStats>(() => fetchStats(), [])

  useEffect(() => {
    if (!poll) return
    const id = setInterval(state.reload, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [poll, state.reload])

  return state
}
