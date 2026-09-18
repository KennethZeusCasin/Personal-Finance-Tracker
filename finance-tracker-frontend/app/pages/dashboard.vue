<script setup lang="ts">
  definePageMeta({
    middleware: 'auth'
  })

  const { user } = useAuth()
  const { formatCurrency } = useCurrency()

  const {
    summary,
    recentTransactions,
    loading,
    error,
    fetchDashboard
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

  onMounted(() => {
    fetchDashboard()
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
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <!-- Balance -->
        <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between">

            <div>
              <p class="text-sm font-medium text-gray-500">
                Total Balance
              </p>

              <p class="mt-2 text-2xl font-bold text-gray-900">
                {{ formatCurrency(summary?.totalBalance) }}
              </p>
            </div>

            <div
              class="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 text-xl"
            >
              💰
            </div>

          </div>
        </div>

        <!-- Income -->
        <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between">

            <div>
              <p class="text-sm font-medium text-gray-500">
                Total Income
              </p>

              <p class="mt-2 text-2xl font-bold text-gray-900">
                {{ formatCurrency(summary?.totalIncome) }}
              </p>
            </div>

            <div
              class="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 text-xl"
            >
              📈
            </div>

          </div>
        </div>

        <!-- Expenses -->
        <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between">

            <div>
              <p class="text-sm font-medium text-gray-500">
                Total Expenses
              </p>

              <p class="mt-2 text-2xl font-bold text-gray-900">
                {{ formatCurrency(summary?.totalExpenses) }}
              </p>
            </div>

            <div
              class="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 text-xl"
            >
              📉
            </div>

          </div>
        </div>

        <!-- Monthly expenses -->
        <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between">

            <div>
              <p class="text-sm font-medium text-gray-500">
                This Month
              </p>

              <p class="mt-2 text-2xl font-bold text-gray-900">
                {{ formatCurrency(summary?.monthlyExpenses) }}
              </p>
            </div>

            <div
              class="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 text-xl"
            >
              📅
            </div>

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