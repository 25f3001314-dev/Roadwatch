import { useCallback, useEffect, useRef, useState } from 'react'

interface UseAsyncState<T> {
  data: T | null
  error: string
  loading: boolean
  reload: () => void
}

export function useAsync<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
): UseAsyncState<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  import { getApiErrorMessage } from '@/api/client'
import { useCallback, useEffect, useRef, useState } from 'react'

interface UseAsyncState<T> {
// ...existing code...
  const reload = useCallback(() => {
    setLoading(true)
    setError('')
    fetcherRef
      .current()
      .then((result) => setData(result))
      .catch((err) => setError(getApiErrorMessage(err, 'Failed to load data')))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
// ...existing code...
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, error, loading, reload }
}
