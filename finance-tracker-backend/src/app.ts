import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.routes.js'
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors())
app.use(express.json())
app.use(cookieParser())

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Finance Tracker API is running'
  })
})

app.use('/api/auth', authRoutes)

export default app