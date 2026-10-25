import { Router } from "express";
import { prisma } from '../lib/prisma.js'
import { calculateFinancialInsights } from '../lib/financial-insights.js'
import {
    authenticate,
    AuthRequest
} from '../middleware/auth.middleware.js'

const router = Router()

router.get('/summary', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId

    const now = new Date()

    const year = req.query.year === undefined
      ? now.getFullYear()
      : Number(req.query.year)

    const month = req.query.month === undefined
      ? now.getMonth() + 1
      : Number(req.query.month)

    if (
      !Number.isInteger(year) ||
      !Number.isInteger(month) ||
      year < 2000 ||
      year > 2100 ||
      month < 1 ||
      month > 12
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid month or year.'
      })
    }

    const startDate = new Date(Date.UTC(year, month - 1, 1))
    const endDate = new Date(Date.UTC(year, month, 1))

    // Current balances across all user accounts
    const accounts = await prisma.account.findMany({
      where: { userId },
      select: { balance: true }
    })

    const totalBalance = accounts.reduce(
      (total, account) => total + Number(account.balance),
      0
    )

    // Transactions for the selected period
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        transactionDate: {
          gte: startDate,
          lt: endDate
        }
      },
      select: {
        type: true,
        amount: true
      }
    })

    const monthlyIncome = transactions
      .filter(transaction => transaction.type === 'INCOME')
      .reduce(
        (total, transaction) => total + Number(transaction.amount),
        0
      )

    const monthlyExpenses = transactions
      .filter(transaction => transaction.type === 'EXPENSE')
      .reduce(
        (total, transaction) => total + Number(transaction.amount),
        0
      )

    const netSavings = monthlyIncome - monthlyExpenses

    return res.status(200).json({
      success: true,
      data: {
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        netSavings,
        transactionCount: transactions.length,
        month,
        year
      }
    })

  } catch (error) {
    console.error('DASHBOARD SUMMARY ERROR:', error)

    return res.status(500).json({
      success: false,
      message: 'Something went wrong.'
    })
  }
})


router.get('/recent-transactions', authenticate, async ( req: AuthRequest, res) => {
    try {
        const userId = req.user!.userId

        const limitParam = Number(req.query.limit) || 5

        // prevent excessively large requests
        const limit = Math.min(Math.max(limitParam, 1), 20)

        const transactions = await prisma.transaction.findMany({
            where: {
                userId
            },
            include: {
                account : {
                    select : {
                        id : true,
                        name : true,
                        type : true,
                    }
                },
                category : {
                    select : {
                        id : true,
                        name : true,
                        type : true
                    }
                }
            },
            orderBy : [
                {
                    transactionDate : 'desc'
                },
                {
                    id : 'desc'
                }
            ],
            take : limit
        })

        return res.json({
            success : true,
            data : transactions
        })
    } catch (error) {
        console.error('RECENT TRANSACTIONS ERROR : ', error)

        return res.status(400).json({
            success : false,
            message : 'Something went wrong.'
        })
    }
})

router.get('/financial-insights', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId
    const now = new Date()
    const month = req.query.month === undefined
      ? now.getMonth() + 1
      : Number(req.query.month)
    const year = req.query.year === undefined
      ? now.getFullYear()
      : Number(req.query.year)

    if (!Number.isInteger(month) || month < 1 || month > 12 ||
        !Number.isInteger(year) || year < 2000 || year > 2100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid month or year.'
      })
    }

    const previousStart = new Date(Date.UTC(year, month - 2, 1))
    const currentEnd = new Date(Date.UTC(year, month, 1))

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        transactionDate: {
          gte: previousStart,
          lt: currentEnd
        }
      },
      select: {
        type: true,
        amount: true,
        transactionDate: true
      }
    })

    return res.json({
      success: true,
      data: calculateFinancialInsights(transactions, month, year)
    })
  } catch (error) {
    console.error('FINANCIAL INSIGHTS ERROR:', error)

    return res.status(500).json({
      success: false,
      message: 'Something went wrong.'
    })
  }
})

router.get(
  '/monthly-overview',
  authenticate,
  async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId

      const currentYear = new Date().getFullYear()
      const year = req.query.year === undefined
        ? currentYear
        : Number(req.query.year)

      if (!Number.isInteger(year) || year < 2000 || year > 2100) {
        return res.status(400).json({
          success: false,
          message: 'Invalid year.'
        })
      }

      const startDate = new Date(Date.UTC(year, 0, 1))
      const endDate = new Date(Date.UTC(year + 1, 0, 1))

      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
          transactionDate: {
            gte: startDate,
            lt: endDate
          }
        },
        select: {
          type: true,
          amount: true,
          transactionDate: true
        },
        orderBy: {
          transactionDate: 'asc'
        }
      })

      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
      ]

      const monthlyData = months.map((month) => ({
        month,
        income: 0,
        expenses: 0
      }))

      transactions.forEach((transaction) => {
        const monthIndex = transaction.transactionDate.getUTCMonth()
        const amount = Number(transaction.amount)

        if (transaction.type === 'INCOME') {
          monthlyData[monthIndex].income += amount
        }

        if (transaction.type === 'EXPENSE') {
          monthlyData[monthIndex].expenses += amount
        }
      })

      return res.json({
        success: true,
        data: monthlyData
      })
    } catch (error) {
      console.error('MONTHLY OVERVIEW ERROR:', error)

      return res.status(500).json({
        success: false,
        message: 'Something went wrong.'
      })
    }
  }
)

router.get(
  '/expense-breakdown',
  authenticate,
  async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId

      const now = new Date()
      const month = req.query.month === undefined
        ? now.getMonth() + 1
        : Number(req.query.month)
      const year = req.query.year === undefined
        ? now.getFullYear()
        : Number(req.query.year)

      if (!Number.isInteger(month) || month < 1 || month > 12 ||
          !Number.isInteger(year) || year < 2000 || year > 2100) {
        return res.status(400).json({
          success: false,
          message: 'Invalid month or year.'
        })
      }

      const startOfMonth = new Date(Date.UTC(year, month - 1, 1))
      const startOfNextMonth = new Date(Date.UTC(year, month, 1))

      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
          type: 'EXPENSE',
          transactionDate: {
            gte: startOfMonth,
            lt: startOfNextMonth
          }
        },
        select: {
          amount: true,
          category: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })

      const categoryTotals = new Map<
        number,
        {
          categoryId: number
          category: string
          amount: number
        }
      >()

      transactions.forEach((transaction) => {
        const categoryId = transaction.category.id
        const amount = Number(transaction.amount)

        const existing = categoryTotals.get(categoryId)

        if (existing) {
          existing.amount += amount
        } else {
          categoryTotals.set(categoryId, {
            categoryId,
            category: transaction.category.name,
            amount
          })
        }
      })

      const data = Array.from(categoryTotals.values())
        .sort((a, b) => b.amount - a.amount)

      return res.json({
        success: true,
        data
      })
    } catch (error) {
      console.error('EXPENSE BREAKDOWN ERROR:', error)

      return res.status(500).json({
        success: false,
        message: 'Something went wrong.'
      })
    }
  }
)

export default router
