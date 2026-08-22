import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import {
    authenticate,
    AuthRequest
} from '../middleware/auth.middleware.js'

const router = Router()

router.post('/', authenticate, async (req: AuthRequest, res) => {
    try {
        const { name, type, balance } = req.body || {}

        if(!name || !type){
            return res.status(400).json({
                success : false,
                message : 'Account name and type are required.'
            })
        }

        const account = await prisma.account.create({
            data : {
                name,
                type,
                balance : balance ?? 0,
                userId : req.user!.userId
            }
        })

        return res.status(201).json({
            success : true,
            message : 'Account created successfully.',
            data : account
        })
    } catch (error) {
        console.error('CREATE ACCOUNT ERROR : ', error)

        return res.status(500).json({
            success : false,
            message : 'Something went wrong'
        })
    }
})

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const accounts = await prisma.account.findMany({
      where: {
        userId: req.user!.userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return res.json({
      success: true,
      data: accounts
    })
  } catch (error) {
    console.error('GET ACCOUNTS ERROR:', error)

    return res.status(500).json({
      success: false,
      message: 'Something went wrong.'
    })
  }
})

router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id)
    const { name, type, balance } = req.body || {}

    const account = await prisma.account.findFirst({
      where: {
        id,
        userId: req.user!.userId
      }
    })

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found.'
      })
    }

    const updatedAccount = await prisma.account.update({
      where: {
        id
      },
      data: {
        ...(name !== undefined && { name }),
        ...(type !== undefined && { type }),
        ...(balance !== undefined && { balance })
      }
    })

    return res.json({
      success: true,
      message: 'Account updated successfully.',
      data: updatedAccount
    })
  } catch (error) {
    console.error('UPDATE ACCOUNT ERROR:', error)

    return res.status(500).json({
      success: false,
      message: 'Something went wrong.'
    })
  }
})

router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id)

    const account = await prisma.account.findFirst({
      where: {
        id,
        userId: req.user!.userId
      }
    })

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found.'
      })
    }

    await prisma.account.delete({
      where: {
        id
      }
    })

    return res.json({
      success: true,
      message: 'Account deleted successfully.'
    })
  } catch (error) {
    console.error('DELETE ACCOUNT ERROR:', error)

    return res.status(500).json({
      success: false,
      message: 'Something went wrong.'
    })
  }
})

export default router