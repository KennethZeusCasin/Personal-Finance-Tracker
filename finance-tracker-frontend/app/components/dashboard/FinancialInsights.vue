<script setup lang="ts">
import type { FinancialInsights } from '~/composables/useDashboard'

const props = defineProps<{
  data: FinancialInsights
}>()

const { formatCurrency } = useCurrency()

const formatPercent = (value: number | null) =>
  value === null ? 'N/A' : `${value.toFixed(1)}%`

const progressWidth = (value: number | null) =>
  `${Math.min(100, Math.max(0, value ?? 0))}%`

const previousMonthLabel = computed(() => {
  const date = new Date(Date.UTC(
    props.data.period.year,
    props.data.period.month - 2,
    1
  ))

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(date)
})

const comparisons = computed(() => [
  {
    label: 'Income',
    change: props.data.comparison.income,
    current: props.data.current.income,
    previous: props.data.previous.income,
    higherIsBetter: true
  },
  {
    label: 'Expenses',
    change: props.data.comparison.expenses,
    current: props.data.current.expenses,
    previous: props.data.previous.expenses,
    higherIsBetter: false
  },
  {
    label: 'Net Savings',
    change: props.data.comparison.netSavings,
    current: props.data.current.netSavings,
    previous: props.data.previous.netSavings,
    higherIsBetter: true
  }
])

const changeClass = (change: number | null, higherIsBetter: boolean) => {
  if (change === null || change === 0) return 'text-gray-600'
  return (higherIsBetter ? change > 0 : change < 0)
    ? 'text-green-600'
    : 'text-red-600'
}

const formatChange = (change: number | null) =>
  change === null ? 'N/A' : `${change > 0 ? '+' : ''}${formatPercent(change)}`

const changeDescription = (change: number | null) => {
  if (change === null) return 'No previous baseline'
  if (change === 0) return 'No change'
  return change > 0 ? 'Increased' : 'Decreased'
}
</script>

<template>
  <section class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
    <div class="mb-6">
      <h2 class="text-lg font-semibold text-gray-900">
        Financial Insights
      </h2>
      <p class="text-sm text-gray-500">
        Savings and spending for the selected month
      </p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <div class="rounded-lg bg-gray-50 p-5">
        <p class="text-sm font-medium text-gray-600">Savings Rate</p>
        <p
          class="mt-2 text-2xl font-bold"
          :class="data.savingsRate !== null && data.savingsRate < 0 ? 'text-red-600' : 'text-green-600'"
        >
          {{ formatPercent(data.savingsRate) }}
        </p>
        <div class="mt-3 h-2 overflow-hidden rounded-full bg-gray-200" aria-hidden="true">
          <div
            class="h-full rounded-full bg-green-500"
            :style="{ width: progressWidth(data.savingsRate) }"
          />
        </div>
        <p class="mt-2 text-xs text-gray-500">Net savings relative to income</p>
      </div>

      <div class="rounded-lg bg-gray-50 p-5">
        <p class="text-sm font-medium text-gray-600">Expense-to-Income Ratio</p>
        <p
          class="mt-2 text-2xl font-bold"
          :class="data.expenseRatio !== null && data.expenseRatio > 100 ? 'text-red-600' : 'text-orange-600'"
        >
          {{ formatPercent(data.expenseRatio) }}
        </p>
        <div class="mt-3 h-2 overflow-hidden rounded-full bg-gray-200" aria-hidden="true">
          <div
            class="h-full rounded-full bg-orange-500"
            :style="{ width: progressWidth(data.expenseRatio) }"
          />
        </div>
        <p class="mt-2 text-xs text-gray-500">Expenses relative to income</p>
      </div>
    </div>

    <div class="mt-8">
      <h3 class="mb-4 text-base font-semibold text-gray-900">
        Compared with {{ previousMonthLabel }}
      </h3>

      <div class="grid gap-4 md:grid-cols-3">
        <div
          v-for="item in comparisons"
          :key="item.label"
          class="rounded-lg border border-gray-200 p-4"
        >
          <p class="text-sm text-gray-600">{{ item.label }}</p>
          <p
            class="mt-2 text-xl font-bold"
            :class="changeClass(item.change, item.higherIsBetter)"
          >
            {{ formatChange(item.change) }}
          </p>
          <p class="mt-1 text-xs text-gray-500">
            {{ changeDescription(item.change) }}
          </p>
          <p class="mt-3 text-xs text-gray-500">
            Current: {{ formatCurrency(item.current) }}
          </p>
          <p class="text-xs text-gray-500">
            Previous: {{ formatCurrency(item.previous) }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
