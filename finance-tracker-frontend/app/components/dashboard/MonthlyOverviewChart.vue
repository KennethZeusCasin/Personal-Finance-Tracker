<script setup lang="ts">
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'

import { Bar } from 'vue-chartjs'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
)

interface MonthlyOverview {
  month: string
  income: number
  expenses: number
}

const props = defineProps<{
  data: MonthlyOverview[]
}>()

const chartData = computed(() => ({
  labels: props.data.map(item => item.month),

  datasets: [
    {
      label: 'Income',
      data: props.data.map(item => item.income),
      backgroundColor: '#10B981',
      borderColor: '#059669',
      borderWidth: 1,
      borderRadius: 4
    },
    {
      label: 'Expenses',
      data: props.data.map(item => item.expenses),
      backgroundColor: '#F87171',
      borderColor: '#EF4444',
      borderWidth: 1,
      borderRadius: 4
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,

  plugins: {
    legend: {
      position: 'top' as const
    }
  },

  scales: {
    y: {
      beginAtZero: true
    }
  }
}
</script>

<template>
  <div class="h-80">
    <Bar
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>
