import express, { Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import multer from 'multer'
import path from 'path'
import { storage } from '../db/storage'
import { uploadAudio, uploadCover } from '../middleware/upload'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { rateLimit } from '../middleware/rateLimit'
import { Track } from '../types'
import { validateTitle, validateDescription, sanitizeString } from '../utils/validation'

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

// Update track (requires auth, only owner can update)
router.put(
  '/:id',
  authMiddleware,
  uploadTrackFiles, // Используем uploadTrackFiles для поддержки загрузки аудио и обложки
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params
      const { title, artist, description } = req.body

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Некорректный ID трека' })
      }

      const track = await storage.tracks.getById(id)
      if (!track) {
        return res.status(404).json({ message: 'Трек не найден' })
      }

      // Проверяем что пользователь является владельцем
      if (track.uploadedBy && track.uploadedBy !== req.userId) {
        return res.status(403).json({ message: 'Вы можете редактировать только свои треки' })
      }

      const updates: Partial<Track> = {}
      // title и artist обязательны при обновлении
      if (title !== undefined) {
        const trimmedTitle = title.trim()
        if (!trimmedTitle || !validateTitle(trimmedTitle)) {
          return res.status(400).json({ message: 'Название должно быть от 1 до 200 символов' })
        }
        updates.title = sanitizeString(trimmedTitle, 200)
      }
      if (artist !== undefined) {
        const trimmedArtist = artist.trim()
        if (!trimmedArtist || !validateTitle(trimmedArtist)) {
          return res.status(400).json({ message: 'Имя исполнителя должно быть от 1 до 200 символов' })
        }
        updates.artist = sanitizeString(trimmedArtist, 200)
      }
      // description опционален, может быть пустой строкой
      if (description !== undefined) {
        if (description && !validateDescription(description)) {
          return res.status(400).json({ message: 'Описание не должно превышать 2000 символов' })
        }
        updates.description = description ? sanitizeString(description.trim(), 2000) : undefined
      }

      // Обрабатываем загруженные файлы
      const files = (req as any).files as { [fieldname: string]: Express.Multer.File[] } | undefined
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`

      // Обновляем аудио файл если загружен новый
      if (files && files.audio && files.audio[0]) {
        const audioFile = files.audio[0]
        updates.audioUrl = `${baseUrl}/uploads/audio/${audioFile.filename}`
        // Примечание: длительность можно обновить позже, если нужно
        // Для этого потребуется парсить аудио файл на клиенте или сервере
      }

      // Обновляем обложку если загружена новая
      if (files && files.cover && files.cover[0]) {
        const coverFile = files.cover[0]
        updates.coverUrl = `${baseUrl}/uploads/covers/${coverFile.filename}`
      }

      const updatedTrack = await storage.tracks.update(id, updates)
      if (!updatedTrack) {
        return res.status(404).json({ message: 'Трек не найден' })
      }

      res.json({
        message: 'Трек успешно обновлён',
        track: updatedTrack,
      })
    } catch (error: any) {
      console.error('Ошибка при обновлении трека:', error)
      res.status(500).json({ message: error.message || 'Внутренняя ошибка сервера' })
    }
  }
)

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

      const { title, artist, duration, description } = req.body

      if (!title || !artist) {
        return res.status(400).json({ message: 'Название и исполнитель обязательны' })
      }

      // Валидация и санитизация
      if (!validateTitle(title)) {
        return res.status(400).json({ message: 'Название должно быть от 1 до 200 символов' })
      }

      if (!validateTitle(artist)) {
        return res.status(400).json({ message: 'Имя исполнителя должно быть от 1 до 200 символов' })
      }

      if (description && !validateDescription(description)) {
        return res.status(400).json({ message: 'Описание не должно превышать 2000 символов' })
      }

      const sanitizedTitle = sanitizeString(title, 200)
      const sanitizedArtist = sanitizeString(artist, 200)
      const sanitizedDescription = description ? sanitizeString(description, 2000) : undefined

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
        title: sanitizedTitle,
        artist: sanitizedArtist,
        description: sanitizedDescription,
        coverUrl,
        audioUrl,
        duration: trackDuration,
        createdAt: new Date().toISOString(),
        uploadedBy: req.userId, // Сохраняем ID пользователя
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
