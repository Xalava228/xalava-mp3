import express, { Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import multer from 'multer'
import path from 'path'
import { storage } from '../db/storage'
import { uploadAudio, uploadCover } from '../middleware/upload'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { rateLimit } from '../middleware/rateLimit'

const router = express.Router()

// Get episode by ID
router.get('/:id', async (req, res: Response) => {
  try {
    const episode = await storage.episodes.getById(req.params.id)
    if (!episode) {
      return res.status(404).json({ message: 'Эпизод не найден' })
    }
    res.json(episode)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// Upload new episode (requires auth)
const uploadEpisodeFiles = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'audio') {
        cb(null, path.join(process.cwd(), 'backend', 'uploads', 'audio'))
      } else if (file.fieldname === 'cover') {
        cb(null, path.join(process.cwd(), 'backend', 'uploads', 'covers'))
      } else {
        cb(new Error('Неизвестное поле: ' + file.fieldname), '')
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      if (file.fieldname === 'audio') {
        cb(null, 'audio-' + uniqueSuffix + path.extname(file.originalname))
      } else {
        const ext = path.extname(file.originalname) || '.jpg'
        cb(null, 'cover-' + uniqueSuffix + ext)
      }
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'audio') {
      const allowedMimes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a']
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true)
      } else {
        cb(new Error('Разрешены только аудио файлы (mp3, wav, ogg, m4a)'))
      }
    } else if (file.fieldname === 'cover') {
      const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true)
      } else {
        cb(new Error('Разрешены только изображения (jpg, png, webp)'))
      }
    } else {
      cb(new Error('Неизвестное поле: ' + file.fieldname))
    }
  },
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
}).fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
])

router.post(
  '/upload',
  authMiddleware,
  rateLimit(20, 60 * 60 * 1000), // Максимум 20 эпизодов в час
  uploadEpisodeFiles,
  async (req: AuthRequest, res: Response) => {
    try {
      console.log('Загрузка эпизода...')
      console.log('Body:', req.body)
      console.log('Files:', (req as any).files)

      const { podcastId, title, description, duration } = req.body

      if (!podcastId || !title) {
        return res.status(400).json({ message: 'ID подкаста и название эпизода обязательны' })
      }

      // Проверяем существование подкаста
      const podcast = await storage.podcasts.getById(podcastId)
      if (!podcast) {
        return res.status(404).json({ message: 'Подкаст не найден' })
      }

      const files = (req as any).files as { [fieldname: string]: Express.Multer.File[] }
      
      if (!files || !files.audio || !files.audio[0]) {
        return res.status(400).json({ message: 'Аудио файл обязателен' })
      }

      // Получаем URL для аудио файла
      const audioFile = files.audio[0]
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`
      const audioUrl = `${baseUrl}/uploads/audio/${audioFile.filename}`

      // Получаем URL для обложки (если загружена)
      let coverUrl = podcast.coverUrl // Используем обложку подкаста по умолчанию
      if (files.cover && files.cover[0]) {
        const coverFile = files.cover[0]
        coverUrl = `${baseUrl}/uploads/covers/${coverFile.filename}`
      }

      // Парсим длительность
      const episodeDuration = duration ? parseInt(duration) : 180

      const episode = {
        id: uuidv4(),
        podcastId,
        title,
        description: description || '',
        audioUrl,
        duration: episodeDuration,
        coverUrl,
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }

      await storage.episodes.create(episode)

      console.log('Эпизод создан:', episode)

      res.json({
        message: 'Эпизод успешно загружен',
        episode,
      })
    } catch (error: any) {
      console.error('Ошибка при загрузке эпизода:', error)
      res.status(500).json({ message: error.message || 'Внутренняя ошибка сервера' })
    }
  }
)

export default router


