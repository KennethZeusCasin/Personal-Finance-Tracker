import type { Ref } from 'vue'

interface DashboardSummary {
  totalBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  netSavings: number
  transactionCount: number
  month: number
  year: number
}

interface RecentTransaction {
  id: number
  type: 'INCOME' | 'EXPENSE'
  amount: string | number
  description: string | null
  transactionDate: string
  account: {
    id: number
    name: string
    type: string
  }
  category: {
    id: number
    name: string
    type: string
  }
}

interface MonthlyOverview {
  month: string
  income: number
  expenses: number
}

interface ExpenseBreakdown {
  categoryId: number
  category: string
  amount: number
}

export interface FinancialInsights {
  period: {
    month: number
    year: number
  }
  current: {
    income: number
    expenses: number
    netSavings: number
  }
  previous: {
    income: number
    expenses: number
    netSavings: number
  }
  savingsRate: number | null
  expenseRatio: number | null
  comparison: {
    income: number | null
    expenses: number | null
    netSavings: number | null
  }
}

interface ApiResponse<T> {
  success: boolean
  data: T
}

type DashboardSection =
  | 'summary'
  | 'recentTransactions'
  | 'monthlyOverview'
  | 'expenseBreakdown'
  | 'financialInsights'

interface SectionState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

const createSection = <T>() => shallowRef<SectionState<T>>({
  data: null,
  loading: true,
  error: null
})

const sectionNames: Record<DashboardSection, string> = {
  summary: 'summary',
  recentTransactions: 'recent transactions',
  monthlyOverview: 'monthly overview',
  expenseBreakdown: 'expense breakdown',
  financialInsights: 'financial insights'
}

export const useDashboard = () => {
  const { apiFetch } = useApi()

  const summary = createSection<DashboardSummary>()
  const recentTransactions = createSection<RecentTransaction[]>()
  const monthlyOverview = createSection<MonthlyOverview[]>()
  const expenseBreakdown = createSection<ExpenseBreakdown[]>()
  const financialInsights = createSection<FinancialInsights>()

  // Each dashboard page instance owns its data, so another account cannot inherit it.
  const requestVersions: Record<DashboardSection, number> = {
    summary: 0,
    recentTransactions: 0,
    monthlyOverview: 0,
    expenseBreakdown: 0,
    financialInsights: 0
  }

  const loadSection = async <T>(
    section: DashboardSection,
    state: Ref<SectionState<T>>,
    endpoint: string
  ) => {
    const requestId = ++requestVersions[section]
    state.value = { ...state.value, loading: true, error: null }

    try {
      const response = await apiFetch<ApiResponse<T>>(endpoint)
      if (requestId !== requestVersions[section]) return

      if (!response.success) {
        throw new Error(`Unable to load ${sectionNames[section]}.`)
      }

      state.value = { data: response.data, loading: false, error: null }
    } catch (error) {
      if (requestId !== requestVersions[section]) return

      const apiMessage = (error as { data?: { message?: string } })?.data?.message
      state.value = {
        ...state.value,
        loading: false,
        error: apiMessage
          ? `Unable to load ${sectionNames[section]}: ${apiMessage}`
          : `Unable to load ${sectionNames[section]}. Please try again.`
      }
      console.error(`${section} error:`, error)
    }
  }

  const fetchSummary = (month: number, year: number) =>
    loadSection('summary', summary, `/dashboard/summary?month=${month}&year=${year}`)

  const fetchRecentTransactions = () =>
    loadSection('recentTransactions', recentTransactions, '/dashboard/recent-transactions')

  const fetchMonthlyOverview = (year: number) =>
    loadSection('monthlyOverview', monthlyOverview, `/dashboard/monthly-overview?year=${year}`)

  const fetchExpenseBreakdown = (month: number, year: number) =>
    loadSection('expenseBreakdown', expenseBreakdown, `/dashboard/expense-breakdown?month=${month}&year=${year}`)

  const fetchFinancialInsights = (month: number, year: number) =>
    loadSection('financialInsights', financialInsights, `/dashboard/financial-insights?month=${month}&year=${year}`)

  const fetchFilteredDashboard = async (month: number, year: number) => {
    await Promise.allSettled([
      fetchSummary(month, year),
      fetchMonthlyOverview(year),
      fetchExpenseBreakdown(month, year),
      fetchFinancialInsights(month, year)
    ])
  }

  const fetchDashboard = async (month: number, year: number) => {
    await Promise.allSettled([
      fetchFilteredDashboard(month, year),
      fetchRecentTransactions()
    ])
  }

  return {
    summary,
    recentTransactions,
    monthlyOverview,
    expenseBreakdown,
    financialInsights,
    fetchSummary,
    fetchRecentTransactions,
    fetchMonthlyOverview,
    fetchExpenseBreakdown,
    fetchFinancialInsights,
    fetchFilteredDashboard,
    fetchDashboard
  }
}
