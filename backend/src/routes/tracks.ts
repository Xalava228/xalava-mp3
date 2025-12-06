import express, { Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import multer from 'multer'
import path from 'path'
import { storage } from '../db/storage'
import { uploadAudio, uploadCover } from '../middleware/upload'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { rateLimit } from '../middleware/rateLimit'

const router = express.Router()

// Get all tracks
router.get('/', async (req, res: Response) => {
  try {
    const tracks = await storage.tracks.getAll()
    tracks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    res.json(tracks)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// Get track by ID
router.get('/:id', async (req, res: Response) => {
  try {
    const track = await storage.tracks.getById(req.params.id)
    if (!track) {
      return res.status(404).json({ message: 'Трек не найден' })
    }
    res.json(track)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// Upload new track (requires auth)
// Используем fields для загрузки обоих файлов одновременно
const uploadTrackFiles = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'audio') {
        cb(null, path.join(process.cwd(), 'backend', 'uploads', 'audio'))
      } else if (file.fieldname === 'cover') {
        cb(null, path.join(process.cwd(), 'backend', 'uploads', 'covers'))
      } else {
        // Эта ветка не должна выполняться, так как fields ограничивает только audio и cover
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
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB для аудио
}).fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
])

router.post(
  '/upload',
  authMiddleware,
  rateLimit(10, 60 * 60 * 1000), // Максимум 10 загрузок в час на пользователя
  uploadTrackFiles,
  async (req: AuthRequest, res: Response) => {
    try {
      console.log('Загрузка трека...')
      console.log('Body:', req.body)
      console.log('Files:', (req as any).files)

      const { title, artist, duration } = req.body

      if (!title || !artist) {
        return res.status(400).json({ message: 'Название и исполнитель обязательны' })
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
      let coverUrl = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400'
      if (files.cover && files.cover[0]) {
        const coverFile = files.cover[0]
        coverUrl = `${baseUrl}/uploads/covers/${coverFile.filename}`
      }

      // Парсим длительность
      const trackDuration = duration ? parseInt(duration) : 180

      const track = {
        id: uuidv4(),
        title,
        artist,
        coverUrl,
        audioUrl,
        duration: trackDuration,
        createdAt: new Date().toISOString(),
      }

      await storage.tracks.create(track)

      console.log('Трек создан:', track)

      res.json({
        message: 'Трек успешно загружен',
        track,
      })
    } catch (error: any) {
      console.error('Ошибка при загрузке трека:', error)
      res.status(500).json({ message: error.message || 'Внутренняя ошибка сервера' })
    }
  }
)

export default router
