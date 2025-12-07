import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import authRoutes from './routes/auth'
import podcastsRoutes from './routes/podcasts'
import episodesRoutes from './routes/episodes'
import tracksRoutes from './routes/tracks'
import searchRoutes from './routes/search'
import recommendationsRoutes from './routes/recommendations'
import playerRoutes from './routes/player'
import favoritesRoutes from './routes/favorites'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const NODE_ENV = process.env.NODE_ENV || 'development'

// Security middleware (только для продакшена)
if (NODE_ENV === 'production') {
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" } // Разрешаем загрузку медиа файлов
  }))
}

// Middleware
// Нормализуем FRONTEND_URL - убираем слеш в конце если есть
const frontendUrl = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.replace(/\/$/, '') // Убираем слеш в конце
  : (NODE_ENV === 'production' ? '*' : 'http://localhost:3000')

const corsOptions = {
  origin: frontendUrl === '*' ? '*' : [frontendUrl, `${frontendUrl}/`], // Разрешаем оба варианта (с слешем и без)
  credentials: true,
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Serve uploaded files (доступны всем пользователям)
const uploadsPath = path.join(process.cwd(), 'backend', 'uploads')
app.use('/uploads', express.static(uploadsPath, {
  maxAge: NODE_ENV === 'production' ? '1y' : '0', // Кэширование в продакшене
  etag: true
}))

// Проверяем существование директорий для загрузок
const audioDir = path.join(uploadsPath, 'audio')
const coversDir = path.join(uploadsPath, 'covers')
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true })
  console.log('Создана директория для аудио файлов:', audioDir)
}
if (!fs.existsSync(coversDir)) {
  fs.mkdirSync(coversDir, { recursive: true })
  console.log('Создана директория для обложек:', coversDir)
}

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/podcasts', podcastsRoutes)
app.use('/api/episodes', episodesRoutes)
app.use('/api/tracks', tracksRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/recommendations', recommendationsRoutes)
app.use('/api/player', playerRoutes)
app.use('/api/favorites', favoritesRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Файл слишком большой' })
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Слишком много файлов' })
    }
    return res.status(400).json({ message: err.message || 'Ошибка загрузки файла' })
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message || 'Ошибка валидации' })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Недействительный токен' })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Токен истёк' })
  }

  console.error('Ошибка сервера:', {
    message: err.message,
    stack: NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method
  })

  res.status(err.status || 500).json({
    message: NODE_ENV === 'production' 
      ? 'Внутренняя ошибка сервера' 
      : err.message || 'Внутренняя ошибка сервера'
  })
})

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ message: 'Маршрут не найден' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📁 Data stored in: ${path.join(process.cwd(), 'backend', 'data')}`)
  console.log(`📤 Uploads directory: ${path.join(process.cwd(), 'backend', 'uploads')}`)
  console.log(`🌍 Environment: ${NODE_ENV}`)
  if (NODE_ENV === 'production') {
    console.log(`🔒 Security: Enabled`)
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'secret') {
      console.error('⚠️  ВНИМАНИЕ: JWT_SECRET не настроен правильно!')
    }
  }
})


