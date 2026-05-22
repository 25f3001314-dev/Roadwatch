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

  const reload = useCallback(() => {
    setLoading(true)
    setError('')
    fetcherRef
      .current()
      .then((result) => setData(result))
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, error, loading, reload }
}
