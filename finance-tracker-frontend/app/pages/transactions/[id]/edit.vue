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
    accountId: number
    categoryId: number
    }

    const route = useRoute()
    const { apiFetch } = useApi()

    const accounts = ref<Account[]>([])
    const categories = ref<Category[]>([])

    const transactionType = ref<'INCOME' | 'EXPENSE'>('EXPENSE')
    const amount = ref('')
    const accountId = ref<number | ''>('')
    const categoryId = ref<number | ''>('')
    const transactionDate = ref('')
    const description = ref('')

    const loading = ref(false)
    const loadingTransaction = ref(true)
    const error = ref<string | null>(null)

    const transactionId = Number(route.params.id)

    const fetchFormData = async () => {
        const [
            accountsResponse,
            categoriesResponse
        ] = await Promise.all([
            apiFetch<{ success: boolean; data: Account[] }>(
            '/accounts'
            ),

            apiFetch<{ success: boolean; data: Category[] }>(
            '/categories'
            )
        ])

        accounts.value = accountsResponse.data
        categories.value = categoriesResponse.data
    }

    const fetchTransaction = async () => {
        try {
            const response = await apiFetch<{
            success: boolean
            data: Transaction
            }>(`/transactions/${transactionId}`)

            const transaction = response.data

            transactionType.value = transaction.type
            amount.value = String(transaction.amount)

            accountId.value = transaction.accountId
            categoryId.value = transaction.categoryId

            transactionDate.value =
            transaction.transactionDate.split('T')[0] ?? ''

            description.value =
            transaction.description ?? ''
        } catch (err: any) {
            console.error('Fetch transaction error:', err)

            error.value =
            err?.data?.message ?? 'Unable to load transaction.'
        } finally {
            loadingTransaction.value = false
        }
    }

    const filteredCategories = computed(() => {
        return categories.value.filter(
            category => category.type === transactionType.value
        )
    })

    const isInitializing = ref(true)

    watch(transactionType, () => {
        if (!isInitializing.value) {
            categoryId.value = ''
        }
    })

    const updateTransaction = async () => {
        loading.value = true
        error.value = null

        try {
            await apiFetch(`/transactions/${transactionId}`, {
            method: 'PUT',

            body: {
                type: transactionType.value,
                amount: Number(amount.value),
                accountId: Number(accountId.value),
                categoryId: Number(categoryId.value),
                transactionDate: transactionDate.value,
                description: description.value || null
            }
            })

            await navigateTo('/transactions')
        } catch (err: any) {
            console.error('Update transaction error:', err)

            error.value =
            err?.data?.message ?? 'Unable to update transaction.'
        } finally {
            loading.value = false
        }
    }

    onMounted(async () => {
        try {
            await fetchFormData()
            await fetchTransaction()
        } catch (err: any) {
            console.error('Edit page error:', err)

            error.value =
            err?.data?.message ?? 'Unable to load transaction.'
        } finally {
            isInitializing.value = false
        }
    })
</script>

<template>
  <div class="min-h-screen bg-gray-100">
      <!-- Content -->
      <main class="p-4 sm:p-6 lg:p-8">

        <div class="mx-auto max-w-3xl">

          <!-- Back -->
          <NuxtLink
            to="/transactions"
            class="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            ← Back to Transactions
          </NuxtLink>

          <!-- Form Card -->
          <div
            class="rounded-xl border border-gray-200 bg-white shadow-sm"
          >

            <!-- Card Header -->
            <div class="border-b border-gray-200 px-6 py-5">
              <h1 class="text-xl font-semibold text-gray-900">
                Edit Transaction
              </h1>

              <p class="mt-1 text-sm text-gray-500">
                Update the details of your transaction.
              </p>
            </div>

            <!-- Error -->
            <Toast
                v-if="error"
                :message="error"
                type="error"
                @close="error = null"
            />

            <!-- Form -->
            <form
              class="space-y-6 p-6"
               @submit.prevent="updateTransaction"
            >

              <!-- Type -->
              <div>
                <label
                  class="mb-2 block text-sm font-medium text-gray-700"
                >
                  Transaction Type
                </label>

                <div class="grid grid-cols-2 gap-3">

                  <button
                    type="button"
                    @click="transactionType = 'EXPENSE'"
                    class="rounded-lg border px-4 py-3 text-sm font-medium transition"
                    :class="
                      transactionType === 'EXPENSE'
                        ? 'border-red-600 bg-red-50 text-red-600'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    "
                  >
                    💸 Expense
                  </button>

                  <button
                    type="button"
                    @click="transactionType = 'INCOME'"
                    class="rounded-lg border px-4 py-3 text-sm font-medium transition"
                    :class="
                      transactionType === 'INCOME'
                        ? 'border-green-600 bg-green-50 text-green-600'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    "
                  >
                    💰 Income
                  </button>

                </div>
              </div>

              <!-- Amount -->
              <div>
                <label
                  for="amount"
                  class="mb-2 block text-sm font-medium text-gray-700"
                >
                  Amount
                </label>

                <div class="relative">
                  <span
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    ₱
                  </span>

                  <input
                    id="amount"
                    v-model="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    required
                    class="w-full rounded-lg border border-gray-300 py-2.5 pl-8 pr-3 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  />
                </div>
              </div>

              <!-- Account -->
              <div>
                <label
                  for="account"
                  class="mb-2 block text-sm font-medium text-gray-700"
                >
                  Account
                </label>

                <select
                  id="account"
                  v-model="accountId"
                  required
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                >
                  <option value="" disabled>
                    Select an account
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

              <!-- Category -->
              <div>
                <label
                  for="category"
                  class="mb-2 block text-sm font-medium text-gray-700"
                >
                  Category
                </label>

                <select
                  id="category"
                  v-model="categoryId"
                  required
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                >
                  <option value="" disabled>
                    Select a category
                  </option>

                  <option
                    v-for="category in filteredCategories"
                    :key="category.id"
                    :value="category.id"
                  >
                    {{ category.name }}
                  </option>
                </select>
              </div>

              <!-- Date -->
              <div>
                <label
                  for="transaction-date"
                  class="mb-2 block text-sm font-medium text-gray-700"
                >
                  Transaction Date
                </label>

                <input
                  id="transaction-date"
                  v-model="transactionDate"
                  type="date"
                  required
                  class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>

              <!-- Description -->
              <div>
                <label
                  for="description"
                  class="mb-2 block text-sm font-medium text-gray-700"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  v-model="description"
                  rows="3"
                  placeholder="Enter a description..."
                  class="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                ></textarea>
              </div>

              <!-- Actions -->
              <div
                class="flex justify-end gap-3 border-t border-gray-200 pt-6"
              >

                <NuxtLink
                  to="/transactions"
                  class="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </NuxtLink>

                <button
                  type="submit"
                  :disabled="loading"
                  class="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {{ loading ? 'Updating...' : 'Update Transaction' }}
                </button>

              </div>

            </form>

          </div>

        </div>

      </main>
  </div>
</template>