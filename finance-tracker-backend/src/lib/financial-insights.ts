type InsightTransaction = {
  type: 'INCOME' | 'EXPENSE'
  amount: { toString(): string }
  transactionDate: Date
}

type FinancialTotals = {
  income: number
  expenses: number
  netSavings: number
}

const percentageChange = (current: number, previous: number): number | null => {
  if (previous === 0) return null
  return ((current - previous) / Math.abs(previous)) * 100
}

const roundPercent = (value: number | null): number | null =>
  value === null ? null : Math.round(value * 100) / 100

export const calculateFinancialInsights = (
  transactions: readonly InsightTransaction[],
  month: number,
  year: number
) => {
  const previousStart = new Date(Date.UTC(year, month - 2, 1))
  const currentStart = new Date(Date.UTC(year, month - 1, 1))
  const currentEnd = new Date(Date.UTC(year, month, 1))

  const totals = (start: Date, end: Date): FinancialTotals => {
    let income = 0
    let expenses = 0

    for (const transaction of transactions) {
      if (transaction.transactionDate < start || transaction.transactionDate >= end) {
        continue
      }

      if (transaction.type === 'INCOME') {
        income += Number(transaction.amount)
      } else {
        expenses += Number(transaction.amount)
      }
    }

    return { income, expenses, netSavings: income - expenses }
  }

  const current = totals(currentStart, currentEnd)
  const previous = totals(previousStart, currentStart)

  return {
    period: { month, year },
    current,
    previous,
    savingsRate: roundPercent(
      current.income > 0 ? (current.netSavings / current.income) * 100 : null
    ),
    expenseRatio: roundPercent(
      current.income > 0 ? (current.expenses / current.income) * 100 : null
    ),
    comparison: {
      income: roundPercent(percentageChange(current.income, previous.income)),
      expenses: roundPercent(percentageChange(current.expenses, previous.expenses)),
      netSavings: roundPercent(percentageChange(current.netSavings, previous.netSavings))
    }
  }
}
