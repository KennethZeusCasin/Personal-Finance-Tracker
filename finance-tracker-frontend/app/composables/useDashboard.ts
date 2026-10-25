interface DashboardSummary {
  totalBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  netSavings: number
  transactionCount: number
  month: number
  year: number
}

interface DashboardResponse {
  success: boolean
  data: DashboardSummary
}

interface RecentTransaction {
    id : number,
    type : 'INCOME' | 'EXPENSE',
    amount : string | number,
    description : string | null,
    transactionDate : string

    account : {
        id : number,
        name : string,
        type : string
    }

    category : {
        id : number,
        name : string,
        type : string
    }
}

interface RecentTransactionResponse {
    success : boolean,
    data : RecentTransaction[]
}

interface MonthlyOverview {
  month: string
  income: number
  expenses: number
}

interface MonthlyOverviewResponse {
  success: boolean
  data: MonthlyOverview[]
}

interface ExpenseBreakdown {
  categoryId: number
  category: string
  amount: number
}

interface ExpenseBreakdownResponse {
  success: boolean
  data: ExpenseBreakdown[]
}

export const useDashboard = () => {
    const { apiFetch } = useApi()

    const summary = ref<DashboardSummary | null> (null)

    const recentTransactions = ref<RecentTransaction[]>([])

    const monthlyOverview = ref<MonthlyOverview[]>([])

    const expenseBreakdown = ref<ExpenseBreakdown[]>([])

    const loading = ref(false)
    const overviewLoading = ref(false)

    const error = ref<string | null>(null)

    const delay = (ms: number) =>
    new Promise(resolve => setTimeout(resolve, ms))

    const loadOverview = async (month: number, year: number) => {
        const [summaryResponse, monthlyOverviewResponse, expenseBreakdownResponse] = await Promise.all([
            apiFetch<DashboardResponse>(
                `/dashboard/summary?month=${month}&year=${year}`
            ),
            apiFetch<MonthlyOverviewResponse>(
                `/dashboard/monthly-overview?year=${year}`
            ),
            apiFetch<ExpenseBreakdownResponse>(
                `/dashboard/expense-breakdown?month=${month}&year=${year}`
            )
        ])

        summary.value = summaryResponse.data
        monthlyOverview.value = monthlyOverviewResponse.data
        expenseBreakdown.value = expenseBreakdownResponse.data
    }

    const fetchDashboard = async (
        month?: number,
        year?: number
    ) => {
        loading.value = true
        error.value = null

        const startTime = Date.now()

        const now = new Date()

        const selectedMonth = month ?? now.getMonth() + 1
        const selectedYear = year ?? now.getFullYear()

        try {
            const [transactionsResponse] = await Promise.all([
                apiFetch<RecentTransactionResponse>(
                    '/dashboard/recent-transactions'
                ),
                loadOverview(selectedMonth, selectedYear)
            ])

            recentTransactions.value = transactionsResponse.data

        } catch (err) {
            console.error('Dashboard error:', err)

            error.value = 'Unable to load dashboard data.'
        } finally {
            const elapsed = Date.now() - startTime
            const remaining = 1000 - elapsed

            if (remaining > 0) {
                await delay(remaining)
            }
            
            loading.value = false
        }
    }

    const fetchOverview = async (month: number, year: number) => {
        overviewLoading.value = true
        error.value = null

        try {
            await loadOverview(month, year)
            return true
        } catch (err) {
            console.error('Dashboard overview error:', err)
            error.value = 'Unable to load financial overview.'
            return false
        } finally {
            overviewLoading.value = false
        }
    }

    return {
        summary,
        recentTransactions,
        monthlyOverview,
        expenseBreakdown,
        loading,
        overviewLoading,
        error,
        fetchDashboard,
        fetchOverview
    }
}
