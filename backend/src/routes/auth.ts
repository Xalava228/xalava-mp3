import express, { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { storage } from '../db/storage'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = express.Router()

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Все поля обязательны' })
    }

    const existingUser = await storage.users.getByEmail(email)
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = {
      id: uuidv4(),
      email,
      passwordHash,
      name,
      createdAt: new Date().toISOString(),
    }

    await storage.users.create(user)

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret || jwtSecret === 'secret') {
      console.error('⚠️ ВНИМАНИЕ: JWT_SECRET не установлен!')
      return res.status(500).json({ message: 'Ошибка конфигурации сервера' })
    }

    const token = jwt.sign(
      { userId: user.id },
      jwtSecret,
      { expiresIn: '30d' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email и пароль обязательны' })
    }

    const user = await storage.users.getByEmail(email)
    if (!user) {
      return res.status(401).json({ message: 'Неверный email или пароль' })
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Неверный email или пароль' })
    }

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret || jwtSecret === 'secret') {
      console.error('⚠️ ВНИМАНИЕ: JWT_SECRET не установлен!')
      return res.status(500).json({ message: 'Ошибка конфигурации сервера' })
    }

    const token = jwt.sign(
      { userId: user.id },
      jwtSecret,
      { expiresIn: '30d' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// Get current user
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await storage.users.getById(req.userId!)
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' })
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

export default router


