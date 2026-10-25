<script setup lang="ts">
  definePageMeta({
    middleware: 'auth'
  })

  const { user } = useAuth()
  const { formatCurrency } = useCurrency()

  const {
    summary,
    recentTransactions,
    monthlyOverview,
    expenseBreakdown,
    loading,
    overviewLoading,
    error,
    fetchDashboard,
    fetchOverview
  } = useDashboard()

  const greeting = computed(() => {
    const hour = new Date().getHours()

    if (hour < 12) {
      return 'Good morning'
    }

    if (hour < 18) {
      return 'Good afternoon'
    }

    return 'Good evening'
  })

  const now = new Date()

  const selectedMonth = ref(now.getMonth() + 1)
  const selectedYear = ref(now.getFullYear())
  const appliedMonth = computed(() => summary.value?.month ?? now.getMonth() + 1)
  const appliedYear = computed(() => summary.value?.year ?? now.getFullYear())

  const months = [
    { label: 'January', value: 1 },
    { label: 'February', value: 2 },
    { label: 'March', value: 3 },
    { label: 'April', value: 4 },
    { label: 'May', value: 5 },
    { label: 'June', value: 6 },
    { label: 'July', value: 7 },
    { label: 'August', value: 8 },
    { label: 'September', value: 9 },
    { label: 'October', value: 10 },
    { label: 'November', value: 11 },
    { label: 'December', value: 12 }
  ]

  const currentYear = now.getFullYear()

  const years = Array.from(
    { length: 5 },
    (_, index) => currentYear - index
  )

  const periodLabel = computed(() =>
    `${months[appliedMonth.value - 1]?.label ?? ''} ${appliedYear.value}`
  )

  const applyFilter = async () => {
    await fetchOverview(selectedMonth.value, selectedYear.value)
  }

  onMounted(() => {
    fetchDashboard(selectedMonth.value, selectedYear.value)
  })
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Page content -->
    <main class="p-4 sm:p-6 lg:p-8">
      <LoadingModal :show="loading" />

      <Toast
        v-if="error"
        :message="error"
        type="error"
        @close="error = null"
      />

      <!-- Welcome -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">
          {{ greeting }}, {{ user?.name ?? 'User' }} 👋
        </h1>

        <p class="mt-1 text-sm text-gray-500">
          Here's an overview of your finances.
        </p>
      </div>

      <!-- Summary cards -->
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">

    <!-- Total Balance -->
    <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <p class="text-sm font-medium text-gray-500">
        Total Balance
      </p>

      <div v-if="loading || overviewLoading" class="mt-3 h-8 animate-pulse rounded bg-gray-200" />

      <h3 v-else class="mt-2 text-2xl font-bold text-gray-900">
        {{ formatCurrency(summary?.totalBalance ?? 0) }}
      </h3>

      <p class="mt-2 text-xs text-gray-400">
        Current account balance
      </p>
    </div>

    <!-- Monthly Income -->
    <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <p class="text-sm font-medium text-gray-500">
        Monthly Income
      </p>

      <div v-if="loading || overviewLoading" class="mt-3 h-8 animate-pulse rounded bg-gray-200" />

      <h3 v-else class="mt-2 text-2xl font-bold text-green-600">
        {{ formatCurrency(summary?.monthlyIncome ?? 0) }}
      </h3>

      <p class="mt-2 text-xs text-gray-400">
        {{ periodLabel }}
      </p>
    </div>

    <!-- Monthly Expenses -->
    <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <p class="text-sm font-medium text-gray-500">
        Monthly Expenses
      </p>

      <div v-if="loading || overviewLoading" class="mt-3 h-8 animate-pulse rounded bg-gray-200" />

      <h3 v-else class="mt-2 text-2xl font-bold text-red-600">
        {{ formatCurrency(summary?.monthlyExpenses ?? 0) }}
      </h3>

      <p class="mt-2 text-xs text-gray-400">
        {{ periodLabel }}
      </p>
    </div>

    <!-- Net Savings -->
    <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <p class="text-sm font-medium text-gray-500">
        Net Savings
      </p>

      <div v-if="loading || overviewLoading" class="mt-3 h-8 animate-pulse rounded bg-gray-200" />

      <h3
        v-else
        class="mt-2 text-2xl font-bold"
        :class="(summary?.netSavings ?? 0) >= 0
          ? 'text-blue-600'
          : 'text-red-600'"
      >
        {{ formatCurrency(summary?.netSavings ?? 0) }}
      </h3>

      <p class="mt-2 text-xs text-gray-400">
        Income minus expenses for {{ periodLabel }}
      </p>
    </div>

  </div>

      <div class="mt-6">
        <h2 class="text-lg font-semibold text-gray-900">
          Financial Overview
        </h2>

        <p class="text-sm text-gray-500">
          View your income and expenses by period.
        </p>
      </div>

      <div class="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">

        <!-- Monthly Overview -->
        <div
          class="
            rounded-xl
            border border-gray-200
            bg-white
            p-6
            shadow-sm
            xl:col-span-2
          "
        >
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900">
              Monthly Overview
            </h2>

            <p class="text-sm text-gray-500">
              Income vs expenses for {{ appliedYear }}
            </p>
          </div>

          <div
            v-if="loading || overviewLoading"
            class="flex h-80 items-center justify-center"
          >
            <p class="text-sm text-gray-500">
              Loading chart...
            </p>
          </div>

          <DashboardMonthlyOverviewChart
            v-else
            :data="monthlyOverview"
          />
        </div>


        <!-- Expense Breakdown -->
        <div
          class="
            rounded-xl
            border border-gray-200
            bg-white
            p-6
            shadow-sm
          "
        >
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900">
              Expense Breakdown
            </h2>

            <p class="text-sm text-gray-500">
              Expenses by category in {{ months[appliedMonth - 1]?.label }} {{ appliedYear }}
            </p>
          </div>

          <form
            class="mb-6 grid grid-cols-2 gap-3 border-b border-gray-100 pb-5"
            @submit.prevent="applyFilter"
          >
            <div class="flex min-w-0 flex-col gap-1">
              <label for="overview-month" class="text-xs font-medium text-gray-600">
                Month
              </label>
              <select
                id="overview-month"
                v-model.number="selectedMonth"
                :disabled="loading || overviewLoading"
                class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
              >
                <option
                  v-for="month in months"
                  :key="month.value"
                  :value="month.value"
                >
                  {{ month.label }}
                </option>
              </select>
            </div>

            <div class="flex min-w-0 flex-col gap-1">
              <label for="overview-year" class="text-xs font-medium text-gray-600">
                Year
              </label>
              <select
                id="overview-year"
                v-model.number="selectedYear"
                :disabled="loading || overviewLoading"
                class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
              >
                <option
                  v-for="year in years"
                  :key="year"
                  :value="year"
                >
                  {{ year }}
                </option>
              </select>
            </div>

            <UButton
              type="submit"
              class="col-span-2 h-10 justify-center"
              :loading="overviewLoading"
              :disabled="loading || overviewLoading"
            >
              Apply Filter
            </UButton>

            <p class="col-span-2 text-xs text-gray-500">
              The selected period updates the summary cards and charts.
            </p>
          </form>

          <div
            v-if="loading || overviewLoading"
            class="flex h-80 items-center justify-center"
          >
            <p class="text-sm text-gray-500">
              Loading chart...
            </p>
          </div>

          <DashboardExpenseBreakdownChart
            v-else-if="expenseBreakdown.length"
            :data="expenseBreakdown"
          />

          <div
            v-else
            class="flex h-80 items-center justify-center"
          >
            <p class="text-sm text-gray-500">
              No expenses recorded for this period.
            </p>
          </div>
        </div>

      </div>


      <!-- Content grid -->
      <div class="mt-6 grid gap-6 xl:grid-cols-3">

        <!-- Recent transactions -->
        <div class="xl:col-span-2">

          <div class="rounded-xl border border-gray-200 bg-white shadow-sm">

            <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4">

              <div>
                <h2 class="font-semibold text-gray-900">
                  Recent Transactions
                </h2>

                <p class="mt-1 text-xs text-gray-500">
                  Your latest financial activity
                </p>
              </div>

              <NuxtLink
                to="/transactions"
                class="text-sm font-medium text-gray-900 hover:underline"
              >
                View all
              </NuxtLink>

            </div>

            <div class="divide-y divide-gray-100">

              <!-- Transaction -->
              <div 
                v-for="transaction in recentTransactions"
                :key="transaction.id"
                class="flex items-center justify-between px-6 py-4"
              >

                <div class="flex items-center gap-4">

                  <div
                    class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100"
                  >
                    {{ transaction.type === 'INCOME' ? '💰' : '💸' }}
                  </div>

                  <div>
                    <p class="text-sm font-medium text-gray-900">
                      {{ transaction.description || transaction.category.name }}
                    </p>

                    <p class="text-xs text-gray-500">
                      {{ transaction.category.name }}
                      .
                      {{ transaction.account.name  }}
                    </p>
                  </div>

                </div>

                <div class="text-right">
                  <p class="text-sm font-semibold"
                      :class="
                        transaction.type === 'INCOME'
                          ? 'text-green-600'
                          : 'text-red-600'
                      "
                  >
                    {{ transaction.type === 'INCOME' ? '+' : '-' }}
                    {{ formatCurrency(transaction.amount) }}
                  </p>

                  <p class="text-xs text-gray-500">
                    {{ new Date(transaction.transactionDate).toLocaleDateString('en-PH') }}
                  </p>
                </div>

              </div>

            
              <div
                v-if="!loading && recentTransactions.length === 0"
                class="py-10 text-center"
              >
                <p class="text-gray-500">
                  No transactions yet.
                </p>

                <UButton
                  to="/transactions/create"
                  class="mt-4"
                >
                  Add your first transaction
                </UButton>
              </div>

              
            </div>
        </div>
        </div>

        <!-- Quick actions -->
        <div>

          <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

            <h2 class="font-semibold text-gray-900">
              Quick Actions
            </h2>

            <p class="mt-1 text-sm text-gray-500">
              Manage your finances
            </p>

            <div class="mt-6 space-y-3">

              <NuxtLink
                to="/transactions/create"
                class="flex items-center gap-3 rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                <span>＋</span>
                Add Transaction
              </NuxtLink>

              <NuxtLink
                to="/accounts"
                class="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <span>💳</span>
                Manage Accounts
              </NuxtLink>

              <NuxtLink
                to="/categories"
                class="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <span>🏷️</span>
                Manage Categories
              </NuxtLink>

            </div>

          </div>

        </div>

      </div>

    </main>
    
  </div>
</template>
