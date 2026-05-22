import { useCallback } from 'react'
import { fetchComplaint, updateComplaint } from '@/api/complaints'
import type { Complaint, ComplaintUpdatePayload } from '@/types/complaint'
import { useAsync } from './useAsync'

export function useComplaint(id: number | undefined) {
  const state = useAsync<Complaint>(() => {
    if (id == null || Number.isNaN(id)) {
      return Promise.reject(new Error('Invalid complaint id'))
    }
    return fetchComplaint(id)
  }, [id])

  const update = useCallback(
    async (payload: ComplaintUpdatePayload) => {
      if (id == null || Number.isNaN(id)) {
        throw new Error('Invalid complaint id')
      }
      const result = await updateComplaint(id, payload)
      state.reload()
      return result
    },
    [id, state.reload]
  )

  return { ...state, update }
}
