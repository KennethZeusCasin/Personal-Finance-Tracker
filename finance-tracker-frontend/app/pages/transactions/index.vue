<script setup lang="ts">
    definePageMeta({
      middleware: 'auth'
    })
    
    interface Account {
        id: number
        name: string
        type: string
    }

    interface Category {
        id: number
        name: string
        type: 'INCOME' | 'EXPENSE'
    }

    interface Transaction {
        id: number
        type: 'INCOME' | 'EXPENSE'
        amount: string | number
        description: string | null
        transactionDate: string
        account: Account
        category: Category
    }

    interface TransactionsResponse {
        success: boolean
        data: Transaction[]
        pagination: {
            currentPage: number
            itemsPerPage: number
            totalItems: number
            totalPages: number
        }
    }

    const { apiFetch } = useApi()
    const transactions = ref<Transaction[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const accounts = ref<Account[]>([])
    const categories = ref<Category[]>([])
    const deletingTransactionId = ref<number | null>(null)
    const deleting = ref(false)

    const filterType = ref<'ALL' | 'INCOME' | 'EXPENSE'>('ALL')
    const filterCategoryId = ref<number | ''>('')
    const filterAccountId = ref<number | ''>('')
    const filterDateFrom = ref('')
    const filterDateTo = ref('')

    const currentPage = ref(1)
    const itemsPerPage = ref(10)
    const totalTransactions = ref(0)
    const totalPages = ref(1)

    const delay = (ms: number) =>
    new Promise(resolve => setTimeout(resolve, ms))

    const fetchTransactions = async () => {
        loading.value = true
        error.value = null

        const startTime = Date.now()

        try {
            const params = new URLSearchParams()

            if(filterType.value !== 'ALL'){
                params.append('type', filterType.value)
            }

            if(filterCategoryId.value !== ''){
                params.append('categoryId', String(filterCategoryId.value))
            }

            if(filterAccountId.value !== ''){
                params.append('accountId', String(filterAccountId.value))
            }

            if(filterDateFrom.value){
                params.append('dateFrom', filterDateFrom.value)
            }

            if(filterDateTo){
                params.append('dateTo', filterDateTo.value)
            }

            params.append('page', String(currentPage.value))
            params.append('limit', String(itemsPerPage.value))

            const response = await apiFetch<TransactionsResponse>(
                `/transactions?${params.toString()}`
            )
            
            transactions.value = response.data

            if(response.pagination){
                currentPage.value = response.pagination.currentPage
                itemsPerPage.value = response.pagination.itemsPerPage
                totalTransactions.value = response.pagination.totalItems
                totalPages.value = response.pagination.totalPages
            }
        } catch (err: any) {
            console.error('Transactions error: ', err)

            error.value = 
            err?.data?.message ?? 'Unable to load transactions.'
        } finally {
            const elapsed = Date.now() - startTime
            const remaining = 1000 - elapsed

            if (remaining > 0) {
                await delay(remaining)
            }

            loading.value = false
        }
    }

    const deleteTransaction = async () => {
        if (!deletingTransactionId.value) {
            return
        }

        deleting.value = true
        const startTime = Date.now()

        try {
            await apiFetch(
            `/transactions/${deletingTransactionId.value}`,
            {
                method: 'DELETE'
            }
            )

            await fetchTransactions()

            deletingTransactionId.value = null
        } catch (err: any) {
            console.error('Delete transaction error:', err)

            error.value =
            err?.data?.message ?? 'Unable to delete transaction.'
        } finally {
            const elapsed = Date.now() - startTime
            const remaining = 1000 - elapsed

            if (remaining > 0) {
                await delay(remaining)
            }

            deleting.value = false
        }
    }

    const fetchFilterData = async () => {
        try {
            const [accountResponse, categoriesResponse] = await Promise.all([
                apiFetch<{ success: boolean; data: Account[] }>('/accounts'),
                apiFetch<{ success: boolean; data: Category[] }>('/categories')
            ])

            accounts.value = accountResponse.data
            categories.value = categoriesResponse.data
        } catch (err) {
            console.error('Filter data error:', err)
        }
    }

    const applyFilters = async () => {
        currentPage.value = 1
        await fetchTransactions()
    }

    const clearFilters = async () => {
        filterType.value = 'ALL'
        filterCategoryId.value = ''
        filterAccountId.value = ''
        filterDateFrom.value = ''
        filterDateTo.value = ''

        currentPage.value = 1

        await fetchTransactions()
    }

    const goToPage = async (page: number) => {
        if (
            page < 1 ||
            page > totalPages.value ||
            page === currentPage.value
        ) {
            return
        }

        currentPage.value = page
        await fetchTransactions()
    }

    const previousPage = async () => {
        await goToPage(currentPage.value - 1)
    }

    const nextPage = async () => {
        await goToPage(currentPage.value + 1)
    }

    onMounted(async () => {
        await fetchFilterData()
        await fetchTransactions()
    })
</script>

<template>
  <div class="min-h-screen bg-gray-100">
      <!-- Content -->
      <main class="p-4 sm:p-6 lg:p-8">

        <div class="mb-6 flex items-center justify-between">

          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              Transactions
            </h1>

            <p class="mt-1 text-sm text-gray-500">
                View and manage your financial transactions
            </p>
          </div>

            <NuxtLink
                to="/transactions/create"
                class="mt-6 inline-block rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
            >
                + Add Transaction
            </NuxtLink>

        </div>

        <!-- Error -->
        <!-- Error -->
        <Toast
          v-if="error"
          :message="error"
          type="error"
          @close="error = null"
        />

        <!-- Loading -->
        <LoadingModal :show="loading" />

        
            <!-- Filters -->
            <div
            class="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
            <div class="mb-4">
                <h2 class="font-semibold text-gray-900">
                Filter Transactions
                </h2>

                <p class="mt-1 text-sm text-gray-500">
                Narrow down your transactions.
                </p>
            </div>

            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">

                <!-- Type -->
                <div>
                <label
                    for="filter-type"
                    class="mb-2 block text-sm font-medium text-gray-700"
                >
                    Type
                </label>

                <select
                    id="filter-type"
                    v-model="filterType"
                    class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                >
                    <option value="ALL">
                    All Types
                    </option>

                    <option value="INCOME">
                    Income
                    </option>

                    <option value="EXPENSE">
                    Expense
                    </option>
                </select>
                </div>

                <!-- Category -->
                <div>
                <label
                    for="filter-category"
                    class="mb-2 block text-sm font-medium text-gray-700"
                >
                    Category
                </label>

                <select
                    id="filter-category"
                    v-model="filterCategoryId"
                    class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                >
                    <option value="">
                    All Categories
                    </option>

                    <option
                    v-for="category in categories"
                    :key="category.id"
                    :value="category.id"
                    >
                    {{ category.name }}
                    </option>
                </select>
                </div>

                <!-- Account -->
                <div>
                <label
                    for="filter-account"
                    class="mb-2 block text-sm font-medium text-gray-700"
                >
                    Account
                </label>

                <select
                    id="filter-account"
                    v-model="filterAccountId"
                    class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                >
                    <option value="">
                    All Accounts
                    </option>

                    <option
                    v-for="account in accounts"
                    :key="account.id"
                    :value="account.id"
                    >
                    {{ account.name }}
                    </option>
                </select>
                </div>

                <!-- Date From -->
                <div>
                <label
                    for="filter-date-from"
                    class="mb-2 block text-sm font-medium text-gray-700"
                >
                    From
                </label>

                <input
                    id="filter-date-from"
                    v-model="filterDateFrom"
                    type="date"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                >
                </div>

                <!-- Date To -->
                <div>
                <label
                    for="filter-date-to"
                    class="mb-2 block text-sm font-medium text-gray-700"
                >
                    To
                </label>

                <input
                    id="filter-date-to"
                    v-model="filterDateTo"
                    type="date"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                >
                </div>

            </div>

            <!-- Buttons -->
            <div class="mt-5 flex flex-wrap gap-3">

                <button
                type="button"
                @click="applyFilters"
                :disabled="loading"
                class="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                {{ loading ? 'Loading...' : 'Apply Filters' }}
                </button>

                <button
                type="button"
                @click="clearFilters"
                :disabled="loading"
                class="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                Clear Filters
                </button>

            </div>
            </div>

        <!-- Transaction table -->
        <div
          class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
        >
          <!-- Empty -->
          <div
            v-if="!loading && transactions.length === 0"
            class="px-6 py-12 text-center"
          >
            <div class="text-4xl">
              💸
            </div>

            <h2 class="mt-4 text-lg font-semibold text-gray-900">
              No transactions yet
            </h2>

            <p class="mt-1 text-sm text-gray-500">
              Start tracking your finances by adding a transaction.
            </p>

            <NuxtLink
              to="/transactions/create"
              class="mt-6 inline-block rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              + Add Transaction
            </NuxtLink>
          </div>

            <!-- Table -->
            <div v-else class="overflow-x-auto">

            <table class="w-full text-left">

              <thead class="border-b border-gray-200 bg-gray-50">
                <tr>

                  <th
                    class="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500"
                  >
                    Description
                  </th>

                  <th
                    class="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500"
                  >
                    Category
                  </th>

                  <th
                    class="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500"
                  >
                    Account
                  </th>

                  <th
                    class="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500"
                  >
                    Date
                  </th>

                  <th
                    class="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500"
                  >
                    Amount
                  </th>

                  <th class="px-6 py-4"></th>

                </tr>
              </thead>

              <tbody class="divide-y divide-gray-100">

                <tr
                  v-for="transaction in transactions"
                  :key="transaction.id"
                  class="transition hover:bg-gray-50"
                >

                  <!-- Description -->
                  <td class="whitespace-nowrap px-6 py-4">

                    <div class="flex items-center gap-3">

                      <div
                        class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100"
                      >
                        {{
                          transaction.type === 'INCOME'
                            ? '💰'
                            : '💸'
                        }}
                      </div>

                      <div>
                        <p class="text-sm font-medium text-gray-900">
                          {{
                            transaction.description ||
                            transaction.category.name
                          }}
                        </p>

                        <p class="text-xs text-gray-500">
                          {{ transaction.type }}
                        </p>
                      </div>

                    </div>

                  </td>

                  <!-- Category -->
                  <td class="whitespace-nowrap px-6 py-4">

                    <span class="text-sm text-gray-700">
                      {{ transaction.category.name }}
                    </span>

                  </td>

                  <!-- Account -->
                  <td class="whitespace-nowrap px-6 py-4">

                    <span class="text-sm text-gray-700">
                      {{ transaction.account.name }}
                    </span>

                  </td>

                  <!-- Date -->
                  <td class="whitespace-nowrap px-6 py-4">

                    <span class="text-sm text-gray-600">
                      {{
                        new Date(
                          transaction.transactionDate
                        ).toLocaleDateString('en-PH')
                      }}
                    </span>

                  </td>

                  <!-- Amount -->
                  <td class="whitespace-nowrap px-6 py-4 text-right">

                    <span
                      class="text-sm font-semibold"
                      :class="
                        transaction.type === 'INCOME'
                          ? 'text-green-600'
                          : 'text-red-600'
                      "
                    >
                      {{
                        transaction.type === 'INCOME'
                          ? '+'
                          : '-'
                      }}₱{{
                        Number(transaction.amount).toLocaleString(
                          'en-PH',
                          {
                            minimumFractionDigits: 2
                          }
                        )
                      }}
                    </span>

                  </td>

                  <!-- Actions -->
                  <td class="whitespace-nowrap px-6 py-4 text-right">

                    <div class="flex items-center gap-3">
                        <NuxtLink
                          :to="`/transactions/${transaction.id}`"
                          class="text-sm font-medium text-gray-600 hover:text-gray-900 hover:underline"
                        >
                          View
                        </NuxtLink>
                        <NuxtLink
                            :to="`/transactions/${transaction.id}/edit`"
                            class="text-sm font-medium text-gray-600 hover:text-gray-900 hover:underline"
                        >
                            Edit
                        </NuxtLink>

                        <button
                            type="button"
                            class="text-sm font-medium text-red-600 hover:text-red-700 hover:underline"
                            @click="deletingTransactionId = transaction.id"
                            >
                            Delete
                        </button>

                    </div>

                  </td>

                </tr>

              </tbody>

            </table>

            <!-- Pagination -->
            <div
            v-if="transactions.length > 0"
            class="flex flex-col gap-4 border-t border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
            >

            <!-- Result count -->
            <div class="text-sm text-gray-500">
                Showing
                <span class="font-medium text-gray-900">
                {{ (currentPage - 1) * itemsPerPage + 1 }}
                </span>
                to
                <span class="font-medium text-gray-900">
                {{
                    Math.min(
                    currentPage * itemsPerPage,
                    totalTransactions
                    )
                }}
                </span>
                of
                <span class="font-medium text-gray-900">
                {{ totalTransactions }}
                </span>
                transactions
            </div>

            <!-- Pagination controls -->
            <div class="flex items-center gap-1">

                <!-- Previous -->
                <button
                type="button"
                @click="previousPage"
                :disabled="currentPage === 1 || loading"
                class="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                Previous
                </button>

                <!-- Page numbers -->
                <button
                v-for="page in totalPages"
                :key="page"
                type="button"
                @click="goToPage(page)"
                :disabled="loading"
                class="min-w-10 rounded-lg px-3 py-2 text-sm font-medium transition"
                :class="
                    page === currentPage
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                "
                >
                {{ page }}
                </button>

                <!-- Next -->
                <button
                type="button"
                @click="nextPage"
                :disabled="currentPage === totalPages || loading"
                class="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                Next
                </button>

            </div>

            </div>

          </div>

        </div>

      </main>
    </div>

    <div
        v-if="deletingTransactionId !== null"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
        >
        <div
            class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        >
            <h2 class="text-lg font-semibold text-gray-900">
            Delete Transaction?
            </h2>

            <p class="mt-2 text-sm text-gray-500">
            Are you sure you want to delete this transaction?
            This action cannot be undone.
            </p>

            <div class="mt-6 flex justify-end gap-3">

            <button
                type="button"
                class="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                :disabled="deleting"
                @click="deletingTransactionId = null"
            >
                Cancel
            </button>

            <button
                type="button"
                class="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="deleting"
                @click="deleteTransaction"
            >
                {{ deleting ? 'Deleting...' : 'Delete Transaction' }}
            </button>

            </div>
        </div>
    </div>
</template>