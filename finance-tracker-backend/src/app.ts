import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import authRoutes from './routes/auth.routes.js'
import accountRoutes from './routes/account.routes.js'
import categoryRoutes from './routes/category.routes.js'
import transactionRoutes from './routes/transaction.routes.js'

const app = express()

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Finance Tracker API is running'
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/accounts', accountRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/transactions', transactionRoutes)

export default app