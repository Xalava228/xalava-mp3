// Простой rate limiter для загрузки файлов
// Для продакшена рекомендуется использовать express-rate-limit

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export const rateLimit = (maxRequests: number = 10, windowMs: number = 60000) => {
  return (req: any, res: any, next: any) => {
    const userId = (req as any).userId || req.ip
    const now = Date.now()
    
    if (!store[userId] || now > store[userId].resetTime) {
      store[userId] = {
        count: 1,
        resetTime: now + windowMs
      }
      return next()
    }
    
    if (store[userId].count >= maxRequests) {
      return res.status(429).json({
        message: `Слишком много запросов. Попробуйте через ${Math.ceil((store[userId].resetTime - now) / 1000)} секунд`
      })
    }
    
    store[userId].count++
    next()
  }
}

// Очистка старых записей каждые 5 минут
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach(key => {
    if (now > store[key].resetTime) {
      delete store[key]
    }
  })
}, 5 * 60 * 1000)

