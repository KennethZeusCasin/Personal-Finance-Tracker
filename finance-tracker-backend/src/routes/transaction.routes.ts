import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import {
    authenticate,
    AuthRequest
} from '../middleware/auth.middleware.js'
import { create } from 'domain'

const router = Router()

router.post('/', authenticate, async (req: AuthRequest, res) => {
    try {
        const {
            accountId,
            categoryId,
            type,
            amount,
            description,
            transactionDate
        } = req.body || {}

        const userId = req.user!.userId

        if(
            !accountId ||
            !categoryId ||
            !type || 
            amount === undefined ||
            !transactionDate
        ){
            return res.status(400).json({
                success : false,
                message : 'Account, Category, type, amount, transaction date are required.'
            })
        }

        if (!['INCOME', 'EXPENSE'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Transaction type must be INCOME or EXPENSE.'
            })
        }

        const numericAmount = Number(amount)

        if(Number.isNaN(numericAmount) || numericAmount <= 0){
            return res.status(400).json({
                success : false,
                message : 'Amount must be greater than zero.'
            })
        }

        const account = await prisma.account.findFirst({
            where : {
                id : Number(accountId),
                userId
            }
        })

        if(!account){
            return res.status(400).json({
                success : false,
                message : 'Account not found'
            })
        }

        const category = await prisma.category.findFirst({
            where : {
                id : Number(categoryId),
                userId
            }
        })

        if(!category){
            return res.status(400).json({
                success : false,
                message : 'Category not found'
            })
        }

        if(category.type !== type){
            return res.status(400).json({
                success : false,
                message : 'Category type does not match transaction type.'
            })
        }

        const transaction = await prisma.$transaction(async (tx) => {
            const createdTransaction = await tx.transaction.create({
                data : {
                    userId,
                    accountId : Number(accountId),
                    categoryId : Number(categoryId),
                    type,
                    amount : numericAmount,
                    description : description || null,
                    transactionDate : new Date(transactionDate)
                },
                include : {
                    account : true,
                    category : true
                }
            })

            const newBalance = 
                type === 'INCOME'
                ? Number(account.balance) + numericAmount
                : Number(account.balance) - numericAmount

            await tx.account.update({
                where : {
                    id : account.id
                },
                data : {
                    balance : newBalance
                }
            })

            return createdTransaction
        })

        return res.status(201).json({
            success : true,
            message : 'Transaction created successfully.',
            data : transaction
        })
    } catch (error) {
        console.error('CREATE TRANSACTION ERROR : ', error)

        return res.status(500).json({
            success : false,
            message : 'Something went wrong.'
        })
    }
})

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId

    const {
      type,
      categoryId, 
      accountId,
      startDate,
      endDate,
      page = '1',
      limit = '10'
    } = req.query

    const currentPage = Math.max(Number(page), 1)
    const itemsPerPage = Math.min(Math.max(Number(limit), 1), 100)

    const skip = (currentPage - 1) * itemsPerPage

    const where: any = {
      userId
    }

    //filter by transaction type
    if(type){
      if(!['INCOME', 'EXPENSE'].includes(String(type))){
        return res.status(400).json({
          success : false,
          message : 'Type must be INCOME or EXPENSE' 
        })
      }
      where.type = String(type)
    }

    // filter by category
    if(categoryId){
      const categoryIdNumber = Number(categoryId)

      if(Number.isNaN(categoryIdNumber)){
        return res.status(400).json({
          success : false,
          message : 'Invalid category ID.'
        })
      }
      where.categoryId = categoryIdNumber
    }

    // filter by account
    if(accountId){
      const accountIdNumber = Number(accountId)

      if(Number.isNaN(accountIdNumber)){
        return res.status(400).json({
          success : false,
          message : 'Invalid account ID.'
        })
      }
      where.accountId = accountIdNumber
    }

    // filter by end date
    if(endDate){
      const end = new Date(String(endDate))

      end.setHours(23, 59, 59, 999)

      where.transactionDate = {
        ...(where.transactionDate || {}),
        lte: end
      }
    }

    // Get transactions and total count at the same time
    const [transactions, total] = await prisma.$transaction([
      prisma.transaction.findMany({
        where,
        include: {
          account : {
            select : {
              id : true,
              name : true,
              type: true
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
        orderBy : {
          transactionDate : 'desc'
        },
        skip,
        take : itemsPerPage
      }),

      prisma.transaction.count({
        where
      })
    ])

    const totalPages = Math.ceil(total / itemsPerPage)

    return res.json({
      success : true,
      data : transactions,
      pagination : {
        currentPage,
        itemsPerPage,
        totalItems : total,
        totalPages,
        hasNextPage : currentPage < totalPages,
        hasPreviousPage : currentPage > 1
      }
    })

  } catch (error) {
    console.error('GET TRANSACTIONS ERROR:', error)

    return res.status(500).json({
      success: false,
      message: 'Something went wrong.'
    })
  }
})

router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id)

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction ID.'
      })
    }

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: req.user!.userId
      },
      include: {
        account: true,
        category: true
      }
    })

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.'
      })
    }

    return res.json({
      success: true,
      data: transaction
    })
  } catch (error) {
    console.error('GET TRANSACTION ERROR:', error)

    return res.status(500).json({
      success: false,
      message: 'Something went wrong.'
    })
  }
})

router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id)

    const {
      accountId,
      categoryId,
      type,
      amount,
      description,
      transactionDate
    } = req.body || {}

    const userId = req.user!.userId

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction ID.'
      })
    }

    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!existingTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.'
      })
    }

    if (
      !accountId ||
      !categoryId ||
      !type ||
      amount === undefined ||
      !transactionDate
    ) {
      return res.status(400).json({
        success: false,
        message: 'Account, category, type, amount and transaction date are required.'
      })
    }

    if (!['INCOME', 'EXPENSE'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Transaction type must be INCOME or EXPENSE.'
      })
    }

    const numericAmount = Number(amount)

    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than zero.'
      })
    }

    const newAccount = await prisma.account.findFirst({
      where: {
        id: Number(accountId),
        userId
      }
    })

    if (!newAccount) {
      return res.status(404).json({
        success: false,
        message: 'Account not found.'
      })
    }

    const category = await prisma.category.findFirst({
      where: {
        id: Number(categoryId),
        userId
      }
    })

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.'
      })
    }

    if (category.type !== type) {
      return res.status(400).json({
        success: false,
        message: 'Category type does not match transaction type.'
      })
    }

    const updatedTransaction = await prisma.$transaction(async (tx) => {
      // Get the original account
      const oldAccount = await tx.account.findUnique({
        where: {
          id: existingTransaction.accountId
        }
      })

      if (!oldAccount) {
        throw new Error('Original account not found.')
      }

      // Reverse the original transaction
      const reversedBalance =
        existingTransaction.type === 'INCOME'
          ? Number(oldAccount.balance) - Number(existingTransaction.amount)
          : Number(oldAccount.balance) + Number(existingTransaction.amount)

      await tx.account.update({
        where: {
          id: oldAccount.id
        },
        data: {
          balance: reversedBalance
        }
      })

      // Apply the new transaction
      const newBalance =
        type === 'INCOME'
          ? Number(newAccount.balance) + numericAmount
          : Number(newAccount.balance) - numericAmount

      await tx.account.update({
        where: {
          id: newAccount.id
        },
        data: {
          balance: newBalance
        }
      })

      return tx.transaction.update({
        where: {
          id
        },
        data: {
          accountId: Number(accountId),
          categoryId: Number(categoryId),
          type,
          amount: numericAmount,
          description: description || null,
          transactionDate: new Date(transactionDate)
        },
        include: {
          account: true,
          category: true
        }
      })
    })

    return res.json({
      success: true,
      message: 'Transaction updated successfully.',
      data: updatedTransaction
    })
  } catch (error) {
    console.error('UPDATE TRANSACTION ERROR:', error)

    return res.status(500).json({
      success: false,
      message: 'Something went wrong.'
    })
  }
})

router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id)

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction ID.'
      })
    }

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: req.user!.userId
      }
    })

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.'
      })
    }

    await prisma.$transaction(async (tx) => {
      const account = await tx.account.findUnique({
        where: {
          id: transaction.accountId
        }
      })

      if (!account) {
        throw new Error('Account not found.')
      }

      // Reverse the transaction
      const newBalance =
        transaction.type === 'INCOME'
          ? Number(account.balance) - Number(transaction.amount)
          : Number(account.balance) + Number(transaction.amount)

      await tx.account.update({
        where: {
          id: account.id
        },
        data: {
          balance: newBalance
        }
      })

      await tx.transaction.delete({
        where: {
          id
        }
      })
    })

    return res.json({
      success: true,
      message: 'Transaction deleted successfully.'
    })
  } catch (error) {
    console.error('DELETE TRANSACTION ERROR:', error)

    return res.status(500).json({
      success: false,
      message: 'Something went wrong.'
    })
  }
})

export default router