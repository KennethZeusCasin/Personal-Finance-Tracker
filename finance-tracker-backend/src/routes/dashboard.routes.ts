import { Router } from "express";
import { prisma } from '../lib/prisma.js'
import {
    authenticate,
    AuthRequest
} from '../middleware/auth.middleware.js'

const router = Router()

router.get('/summary', authenticate, async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.userId

        // get all accounts belongin to the user
        const accounts = await prisma.account.findMany({
            where: {
                userId
            }
        })

        // calculate total balance
        const totalBalance = accounts.reduce(
            (total, account) => total + Number(account.balance),
            0
        )

        // get all transactions
        const transactions = await prisma.transaction.findMany({
            where: {
                userId
            }
        })

        // calculate total income
        const totalIncome = transactions
            .filter(transaction => transaction.type === 'INCOME')
            .reduce(
                (total, transaction) => total + Number(transaction.amount),
                0
            )

        // calculate total expenses
        const totalExpenses = transactions
            .filter(transaction => transaction.type === 'EXPENSE')
            .reduce(
                (total, transaction) => total + Number(transaction.amount),
                0
            )

        // current month
        const now = new Date()

        const startOfMonth = new Date(
            now.getFullYear(),
            now.getMonth(),
            1
        )

        const startOfNextMonth = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            1
        )

        // get current month transactions
        const monthlyTransactions = transactions.filter(transaction => {
            const date = new Date(transaction.transactionDate)

            return (
                date >= startOfMonth &&
                date < startOfNextMonth
            )
        })

        // Monthly Income
        const monthlyIncome = monthlyTransactions
            .filter(transaction => transaction.type === 'INCOME')
            .reduce(
                (total, transaction) => total + Number(transaction.amount),
                0
            )

        // Monthly Expenses
        const monthlyExpenses = monthlyTransactions
            .filter(transaction => transaction.type === 'EXPENSE')
            .reduce(
                (total, transaction) => total + Number(transaction.amount),
                0
            )

        return res.json({
            success : true,
            data : {
                totalBalance,
                totalIncome,
                totalExpenses,
                monthlyIncome,
                monthlyExpenses,
                transactionCount : transactions.length
            }
        })
    } catch (error) {
        console.error('DASHBOARD SUMMARY ERROR : ', error)
        
        return res.status(500).json({
            success: false,
            message : 'Something went wrong.'
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

export default router