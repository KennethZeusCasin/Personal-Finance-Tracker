import assert from 'node:assert/strict'
import test from 'node:test'
import { calculateFinancialInsights } from '../src/lib/financial-insights.js'

const transaction = (date: string, type: 'INCOME' | 'EXPENSE', amount: string) => ({
  transactionDate: new Date(date),
  type,
  amount
})

test('calculates rates and changes against the previous month', () => {
  const result = calculateFinancialInsights([
    transaction('2026-08-12T00:00:00Z', 'INCOME', '12000.00'),
    transaction('2026-08-15T00:00:00Z', 'EXPENSE', '8500.00'),
    transaction('2026-09-10T00:00:00Z', 'INCOME', '15000.00'),
    transaction('2026-09-20T00:00:00Z', 'EXPENSE', '9500.00')
  ], 9, 2026)

  assert.deepEqual(result.current, { income: 15000, expenses: 9500, netSavings: 5500 })
  assert.deepEqual(result.previous, { income: 12000, expenses: 8500, netSavings: 3500 })
  assert.equal(result.savingsRate, 36.67)
  assert.equal(result.expenseRatio, 63.33)
  assert.deepEqual(result.comparison, {
    income: 25,
    expenses: 11.76,
    netSavings: 57.14
  })
})

test('January compares with December and respects UTC month boundaries', () => {
  const result = calculateFinancialInsights([
    transaction('2025-12-31T23:59:59.999Z', 'INCOME', '100.00'),
    transaction('2026-01-01T00:00:00.000Z', 'INCOME', '150.00'),
    transaction('2026-02-01T00:00:00.000Z', 'INCOME', '999.00')
  ], 1, 2026)

  assert.equal(result.previous.income, 100)
  assert.equal(result.current.income, 150)
  assert.equal(result.comparison.income, 50)
})

test('zero income and zero previous values have no percentage baseline', () => {
  const result = calculateFinancialInsights([
    transaction('2026-09-10T00:00:00Z', 'EXPENSE', '20.00')
  ], 9, 2026)

  assert.equal(result.savingsRate, null)
  assert.equal(result.expenseRatio, null)
  assert.deepEqual(result.comparison, {
    income: null,
    expenses: null,
    netSavings: null
  })
})

test('a negative previous net savings uses its absolute value as the baseline', () => {
  const result = calculateFinancialInsights([
    transaction('2026-08-10T00:00:00Z', 'INCOME', '100.00'),
    transaction('2026-08-11T00:00:00Z', 'EXPENSE', '200.00'),
    transaction('2026-09-10T00:00:00Z', 'INCOME', '200.00'),
    transaction('2026-09-11T00:00:00Z', 'EXPENSE', '100.00')
  ], 9, 2026)

  assert.equal(result.previous.netSavings, -100)
  assert.equal(result.current.netSavings, 100)
  assert.equal(result.comparison.netSavings, 200)
})
