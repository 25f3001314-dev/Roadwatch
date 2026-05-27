export interface Road {
  id: number
  roadCode?: string
  name: string
  roadType?: 'NH' | 'SH' | 'MDR' | string
  contractorName?: string | null
  lastRelayingDate?: string | null
  budgetSanctioned?: number | null
  budgetSpent?: number | null
  lengthKm?: number | null
  status?: string | null
}
