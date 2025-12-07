import { Response } from 'express'

export class AppError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    Error.captureStackTrace(this, this.constructor)
  }
}

export const handleError = (err: any, res: Response, NODE_ENV: string) => {
  const statusCode = err.statusCode || 500
  const message = err.isOperational || NODE_ENV === 'development' 
    ? err.message 
    : 'Внутренняя ошибка сервера'

  console.error('Error:', {
    message: err.message,
    stack: NODE_ENV === 'development' ? err.stack : undefined,
    statusCode
  })

  res.status(statusCode).json({
    message,
    ...(NODE_ENV === 'development' && { stack: err.stack })
  })
}

