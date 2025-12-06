import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  userId?: string
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({ message: 'Токен не предоставлен' })
    }

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret || jwtSecret === 'secret') {
      console.error('⚠️ ВНИМАНИЕ: JWT_SECRET не установлен или использует небезопасное значение!')
      return res.status(500).json({ message: 'Ошибка конфигурации сервера' })
    }

    const decoded = jwt.verify(token, jwtSecret) as {
      userId: string
    }

    req.userId = decoded.userId
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Недействительный токен' })
  }
}


