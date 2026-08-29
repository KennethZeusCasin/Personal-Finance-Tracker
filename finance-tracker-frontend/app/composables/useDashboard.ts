interface DashboardSummary {
    totalBalance : number,
    totalIncome : number,
    totalExpenses : number,
    monthlyIncome : number,
    monthlyExpenses : number,
    transactionCount : number
}

interface DashboardResponse {
    success : boolean,
    data : DashboardSummary
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

export const useDashboard = () => {
    const { apiFetch } = useApi()

    const summary = ref<DashboardSummary | null> (null)

    const recentTransactions = ref<RecentTransaction[]>([])

    const loading = ref(false)

    const error = ref<string | null>(null)

    const delay = (ms: number) =>
    new Promise(resolve => setTimeout(resolve, ms))

    const fetchDashboard = async () => {
        loading.value = true
        error.value = null

        const startTime = Date.now()

        try {
            console.log('Fetching dashboard summary...')

            const summaryResponse = await apiFetch<DashboardResponse>(
            '/dashboard/summary'
            )

            console.log('Summary response:', summaryResponse)

            summary.value = summaryResponse.data

            console.log('Fetching recent transactions...')

            const transactionsResponse = await apiFetch<RecentTransactionResponse>(
            '/dashboard/recent-transactions'
            )

            console.log('Recent transactions response:', transactionsResponse)

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

    return {
        summary,
        recentTransactions,
        loading,
        error,
        fetchDashboard
    }
}