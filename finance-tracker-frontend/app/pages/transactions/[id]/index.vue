<script setup lang="ts">
    definePageMeta({
      middleware: 'auth'
    })

    const route = useRoute()

    const transactionId = Number(route.params.id)

    interface Transaction {
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

    const transaction = ref<Transaction | null>(null)
    const loading = ref(true)
    const error = ref<string | null>(null)
    const { apiFetch } = useApi()
    
    const delay = (ms: number) =>
    new Promise(resolve => setTimeout(resolve, ms))

    const fetchTransaction = async () => {
        loading.value = true
        error.value = null
        const startTime = Date.now()
        try {
            const response = await apiFetch<{
            success: boolean
            data: Transaction
            }>(`/transactions/${transactionId}`)

            transaction.value = response.data

        } catch (err: any) {
            console.error('Fetch transaction error:', err)

            error.value =
            err?.data?.message ?? 'Unable to load transaction.'
        } finally {
            const elapsed = Date.now() - startTime
            const remaining = 1000 - elapsed

            if (remaining > 0) {
                await delay(remaining)
            }

            loading.value = false
        }
    }

    onMounted(() => {
        fetchTransaction()
    })

</script>

<template>
  <div class="min-h-screen bg-gray-100">

    <!-- Main content -->
    <main class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

      <!-- Back -->
      <div class="mb-6">
        <NuxtLink
          to="/transactions"
          class="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
        >
          <span>←</span>
          Back to Transactions
        </NuxtLink>
      </div>

      <!-- Loading -->
      <div
        v-if="loading"
        class="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm"
      >
        <p class="text-sm text-gray-500">
          Loading transaction...
        </p>
      </div>

      <!-- Error -->
      <div
        v-else-if="error"
        class="rounded-xl border border-red-200 bg-red-50 p-6"
      >
        <p class="text-sm text-red-600">
          {{ error }}
        </p>
      </div>

      <!-- Transaction -->
      <div
        v-else-if="transaction"
        class="space-y-6"
      >

        <!-- Header card -->
        <div class="rounded-xl border border-gray-200 bg-white shadow-sm">

          <div class="border-b border-gray-200 px-6 py-5">

            <div class="flex items-start justify-between gap-4">

              <div>
                <p class="text-sm text-gray-500">
                  Transaction Details
                </p>

                <h1 class="mt-1 text-xl font-semibold text-gray-900">
                  {{ transaction.description || transaction.category.name }}
                </h1>
              </div>

              <!-- Type -->
              <span
                class="rounded-full px-3 py-1 text-xs font-semibold"
                :class="
                  transaction.type === 'INCOME'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                "
              >
                {{ transaction.type }}
              </span>

            </div>

          </div>

          <!-- Amount -->
          <div class="px-6 py-8 text-center">

            <p class="text-sm text-gray-500">
              Amount
            </p>

            <p
              class="mt-2 text-4xl font-bold"
              :class="
                transaction.type === 'INCOME'
                  ? 'text-green-600'
                  : 'text-red-600'
              "
            >
              {{ transaction.type === 'INCOME' ? '+' : '-' }}₱{{
                Number(transaction.amount).toLocaleString('en-PH', {
                  minimumFractionDigits: 2
                })
              }}
            </p>

          </div>

        </div>

        <!-- Information -->
        <div class="rounded-xl border border-gray-200 bg-white shadow-sm">

          <div class="border-b border-gray-200 px-6 py-4">
            <h2 class="font-semibold text-gray-900">
              Transaction Information
            </h2>
          </div>

          <div class="divide-y divide-gray-100">

            <!-- Account -->
            <div class="flex items-center justify-between px-6 py-4">

              <div>
                <p class="text-sm text-gray-500">
                  Account
                </p>

                <p class="mt-1 text-sm font-medium text-gray-900">
                  {{ transaction.account.name }}
                </p>
              </div>

              <span class="text-sm text-gray-400">
                💳
              </span>

            </div>

            <!-- Category -->
            <div class="flex items-center justify-between px-6 py-4">

              <div>
                <p class="text-sm text-gray-500">
                  Category
                </p>

                <p class="mt-1 text-sm font-medium text-gray-900">
                  {{ transaction.category.name }}
                </p>
              </div>

              <span class="text-sm text-gray-400">
                🏷️
              </span>

            </div>

            <!-- Date -->
            <div class="flex items-center justify-between px-6 py-4">

              <div>
                <p class="text-sm text-gray-500">
                  Transaction Date
                </p>

                <p class="mt-1 text-sm font-medium text-gray-900">
                  {{
                    new Date(
                      transaction.transactionDate
                    ).toLocaleDateString('en-PH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  }}
                </p>
              </div>

              <span class="text-sm text-gray-400">
                📅
              </span>

            </div>

            <!-- Description -->
            <div class="px-6 py-4">

              <p class="text-sm text-gray-500">
                Description
              </p>

              <p class="mt-1 text-sm font-medium text-gray-900">
                {{ transaction.description || 'No description' }}
              </p>

            </div>

          </div>

        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3">

          <NuxtLink
            :to="`/transactions/${transaction.id}/edit`"
            class="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Edit Transaction
          </NuxtLink>

          <NuxtLink
            to="/transactions"
            class="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Back to Transactions
          </NuxtLink>

        </div>

      </div>

    </main>

  </div>
</template>