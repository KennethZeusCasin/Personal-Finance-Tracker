import { Router } from 'express'
import bcrypt from 'bcrypt'
import { prisma } from '../lib/prisma.js'

const router = Router()

router.post('/register', async (req, res) => {
  try {

    const { name, email, password } = req.body || {}

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required.'
      })
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email
      }
    })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered.'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    })

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    })

  } catch (error) {
    console.error(error)

    return res.status(500).json({
      success: false,
      message: 'Something went wrong.'
    })
  }
})

export default router