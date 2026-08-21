import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import {
    authenticate,
    AuthRequest
} from '../middleware/auth.middleware.js'

const router = Router()

router.post('/', authenticate, async (req: AuthRequest, res) => {
    try {
        const { name, type } = req.body || {}

        if(!name || !type){
            return res.status(400).json({
                success : false,
                message : 'Category name and type are required.'
            })
        }

        if(!['INCOME', 'EXPENSE'].includes(type)){
            return res.status(400).json({
                success : false,
                message : 'Category type must be INCOME or EXPENSE.'
            })
        }

        const category = await prisma.category.create({
            data : {
                name,
                type,
                userId : req.user!.userId
            }
        })

        return res.status(201).json({
            success : true,
            message : 'Category created successfully.',
            data : category
        })
    } catch (error) {
        console.error('CREATE CATEGORY ERROR : ', error)

        return res.status(500).json({
            success : false,
            message : 'Something went wrong.'
        })
    }
})

router.get('/', authenticate, async (req: AuthRequest, res) => {
    try {
        const categories = await prisma.category.findMany({
            where: {
                userId : req.user!.userId
            },
            orderBy : {
                name : 'asc'
            }
        })

        return res.json({
            success : true,
            data: categories
        })
    } catch (error) {
        console.error('GET CATEGORIES ERROR : ', error)

        return res.status(500).json({
            success : false,
            message : 'Something went wrong.'
        })
    }
})

router.get('/:id', authenticate, async (req: AuthRequest, res) => {
    try {
        const id = Number(req.params.id)

        if(Number.isNaN(id)){
            return res.status(400).json({
                success : false,
                message : 'Invalid Category ID.'
            })
        }

        const category = await prisma.category.findFirst({
            where : {
                id,
                userId: req.user!.userId
            },
        })

        if(!category){
            return res.status(404).json({
                success : false,
                message : 'Category not found.'
            })
        }

        return res.status(201).json({
            success : true,
            data : category
        })
    } catch (error) {
        console.error('GET CATEGORY ERROR : ', error)

        return res.status(500).json({
            success : false,
            message : 'Something went wrong'
        })
    }
})

router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id)
    const { name, type } = req.body || {}

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID.'
      })
    }

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Category name and type are required.'
      })
    }

    if (!['INCOME', 'EXPENSE'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Category type must be INCOME or EXPENSE.'
      })
    }

    const existingCategory = await prisma.category.findFirst({
      where: {
        id,
        userId: req.user!.userId
      }
    })

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.'
      })
    }

    const category = await prisma.category.update({
      where: {
        id
      },
      data: {
        name,
        type
      }
    })

    return res.json({
      success: true,
      message: 'Category updated successfully.',
      data: category
    })
  } catch (error) {
    console.error('UPDATE CATEGORY ERROR:', error)

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
        message: 'Invalid category ID.'
      })
    }

    const existingCategory = await prisma.category.findFirst({
      where: {
        id,
        userId: req.user!.userId
      }
    })

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.'
      })
    }

    await prisma.category.delete({
      where: {
        id
      }
    })

    return res.json({
      success: true,
      message: 'Category deleted successfully.'
    })
  } catch (error) {
    console.error('DELETE CATEGORY ERROR:', error)

    return res.status(500).json({
      success: false,
      message: 'Something went wrong.'
    })
  }
})

export default router