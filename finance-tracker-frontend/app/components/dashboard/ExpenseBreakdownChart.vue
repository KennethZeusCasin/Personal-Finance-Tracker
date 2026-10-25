<script setup lang="ts">
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'

import { Doughnut } from 'vue-chartjs'

ChartJS.register(
  Tooltip,
  Legend,
  ArcElement
)

interface ExpenseBreakdown {
  categoryId: number
  category: string
  amount: number
}

const props = defineProps<{
  data: ExpenseBreakdown[]
}>()

const categoryColors = [
  '#F87171',
  '#F59E0B',
  '#8B5CF6',
  '#3B82F6',
  '#14B8A6',
  '#EC4899',
  '#84CC16',
  '#F97316'
]

const chartData = computed(() => ({
  labels: props.data.map(item => item.category),

  datasets: [
    {
      label: 'Expenses',
      data: props.data.map(item => item.amount),
      backgroundColor: props.data.map((_, index) =>
        categoryColors[index % categoryColors.length]
      ),
      borderColor: '#FFFFFF',
      borderWidth: 2
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,

  plugins: {
    legend: {
      position: 'bottom' as const
    },

    tooltip: {
      callbacks: {
        label: (context: any) => {
          const value = Number(context.raw)

          return `${context.label}: ${value.toLocaleString(
            'en-PH',
            {
              style: 'currency',
              currency: 'PHP'
            }
          )}`
        }
      }
    }
  }
}
</script>

<template>
  <div class="h-80">
    <Doughnut
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>
