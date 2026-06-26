import { useEffect, useState } from 'react'
import BudgetKPIs from './BudgetKPIs'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'

interface BudgetData {
  totalBudget: number
  totalSpent: number
  activeVendors: number
  pendingQueries: number
}

export default function RoadsBudget() {
  const [data] = useState<BudgetData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // TODO: replace with actual API call, e.g. getRoadsBudgetSummary() from '@/api/roads'
    async function load() {
      try {
        setLoading(true)
        // const result = await getRoadsBudgetSummary()
        // setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load budget data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <LoadingState message="Loading budget data…" />
  if (error) return <ErrorState message={error} />
  if (!data) return <LoadingState message="No data yet — connect API" />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Roads Budget</h1>
      <BudgetKPIs
        totalBudget={data.totalBudget}
        totalSpent={data.totalSpent}
        activeVendors={data.activeVendors}
        pendingQueries={data.pendingQueries}
      />
    </div>
  )
}
