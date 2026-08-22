<script setup lang="ts">
  const {
    summary,
    recentTransactions,
    loading,
    error,
    fetchDashboard
  } = useDashboard()

  onMounted(() => {
    fetchDashboard()
  })
</script>

<template>
  <div class="min-h-screen bg-gray-100">

    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 hidden w-64 border-r border-gray-200 bg-white lg:block"
    >
      <div class="flex h-full flex-col">

        <!-- Logo -->
        <div class="flex h-16 items-center border-b border-gray-200 px-6">
          <h1 class="text-xl font-bold text-gray-900">
            Finance Tracker
          </h1>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 space-y-1 px-4 py-6">

          <NuxtLink
            to="/dashboard"
            class="flex items-center gap-3 rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white"
          >
            <span>📊</span>
            Dashboard
          </NuxtLink>

          <NuxtLink
            to="/accounts"
            class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
          >
            <span>💳</span>
            Accounts
          </NuxtLink>

          <NuxtLink
            to="/categories"
            class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
          >
            <span>🏷️</span>
            Categories
          </NuxtLink>

          <NuxtLink
            to="/transactions"
            class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
          >
            <span>💸</span>
            Transactions
          </NuxtLink>

        </nav>

        <!-- Bottom navigation -->
        <div class="border-t border-gray-200 p-4">

          <button
            class="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
          >
            <span>⚙️</span>
            Settings
          </button>

          <button
            class="mt-1 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <span>🚪</span>
            Logout
          </button>

        </div>

      </div>
    </aside>

    <!-- Main content -->
    <div class="lg:pl-64">

      <!-- Header -->
      <header class="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div class="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

          <div>
            <h2 class="text-lg font-semibold text-gray-900">
              Dashboard
            </h2>
          </div>

          <div class="flex items-center gap-3">

            <button
              class="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
            >
              🔔
            </button>

            <div class="flex items-center gap-3">
              <div
                class="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white"
              >
                K
              </div>

              <div class="hidden sm:block">
                <p class="text-sm font-medium text-gray-900">
                  Kenneth
                </p>

                <p class="text-xs text-gray-500">
                  Personal Account
                </p>
              </div>
            </div>

          </div>

        </div>
      </header>

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
            Good afternoon, Kenneth 👋
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
                  ₱{{ summary?.totalBalance?.toLocaleString('en-PH', {
                    minimumFractionDigits: 2
                  }) ?? '0.00' }}
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
                  ₱{{ summary?.totalIncome?.toLocaleString('en-PH', {
                    minimumFractionDigits: 2
                  }) ?? '0.00' }}
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
                  ₱{{ summary?.totalExpenses?.toLocaleString('en-PH', {
                    minimumFractionDigits: 2
                  }) ?? '0.00' }}
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
                  ₱{{ summary?.monthlyExpenses?.toLocaleString('en-PH', {
                    minimumFractionDigits : 2
                  }) ?? '0.00' }}
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
                      {{ transaction.type === 'INCOME' ? '+' : '-' }}₱{{ 
                        Number(transaction.amount).toLocaleString('en-PH', {
                          minimumFractionDigits : 2
                        })
                      }}
                    </p>

                    <p class="text-xs text-gray-500">
                      {{ new Date(transaction.transactionDate).toLocaleDateString('en-PH') }}
                    </p>
                  </div>

                </div>

              
                <div 
                  v-if = "recentTransactions.length === 0 && !loading"
                  class = "px-6 py-10 text-center text-sm text-gray-500"
                >
                  No Transactions yet.
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

  </div>
</template>