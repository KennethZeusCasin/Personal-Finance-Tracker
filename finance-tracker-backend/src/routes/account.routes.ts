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

export default router