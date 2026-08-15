import { Router } from 'express'
import bcrypt from 'bcrypt'
import { prisma } from '../lib/prisma.js'
import jwt from 'jsonwebtoken'
import { authenticate, AuthRequest } from '../middleware/auth.middleware.js'

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

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {}

    if(!email || !password){
      return res.status(400).json({
        success : false,
        message : 'Email and Password are required.'
      })
    }

    const user = await prisma.user.findUnique({
      where : {
        email
      }
    })

    if(!user){
      return res.status(400).json({
        success : false,
        message : 'Invalid email or password'
      })
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    )

    if(!passwordMatch){
      return res.status(400).json({
        success : false,
        message : 'Invalid email or password'
      })
    }

    const jwtSecret = process.env.JWT_SECRET

    if(!jwtSecret){
      throw new Error('JWT_SECRET is not configured.')
    }

    const token = jwt.sign(
      {
        userId : user.id,
        email : user.email
      },
      jwtSecret,
      {
        expiresIn : '1d'
      }
    )

    res.cookie('token', token, {
      httpOnly : true,
      secure   : false,
      sameSite : 'lax',
      maxAge   : 24 * 60 * 60 * 100
    })

    return res.json({
      success : true,
      message : 'Login Successful.',
      data    : {
        id : user.id,
        name : user.name,
        email : user.email,
      }
    })
  } catch (error) {
    console.error('Login Error', error)

    return res.status(400).json({
      success : false,
      message : 'Something went wrong.'

    })
  }
})

router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where : {
        id : req.user!.userId
      },
      select : {
        id : true,
        name : true,
        email : true,
        createdAt : true
      }
    })

    if(!user){
      return res.status(400).json({
        success : false,
        message : 'User not found.'
      })
    }

    return res.json({
      success : true,
      data : user
    })
  } catch (error) {
    console.error('ME ERROR', error)

    return res.status(400).json({
      success : false,
      message : 'Something went wrong.'
    })
  }
})

export default router