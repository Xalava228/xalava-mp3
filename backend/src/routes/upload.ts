import express, { Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { storage } from '../db/storage'
import { uploadAudio, uploadCover } from '../middleware/upload'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = express.Router()

// Upload new track (requires auth)
router.post(
  '/track',
  authMiddleware,
  uploadAudio.single('audio'),
  async (req: AuthRequest, res: Response, next: any) => {
    // Если есть обложка, загружаем её
    if ((req as any).body.hasCover === 'true') {
      return uploadCover.single('cover')(req, res, next)
    }
    next()
  },
  async (req: AuthRequest, res: Response) => {
    try {
      const { title, artist, duration } = req.body

      if (!title || !artist) {
        return res.status(400).json({ message: 'Название и исполнитель обязательны' })
      }

      if (!(req as any).file) {
        return res.status(400).json({ message: 'Аудио файл обязателен' })
      }

      // Получаем URL для аудио файла
      const audioUrl = `http://localhost:5000/uploads/audio/${(req as any).file.filename}`

      // Получаем URL для обложки (если загружена)
      let coverUrl = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400'
      if ((req as any).files?.cover) {
        const cover = Array.isArray((req as any).files.cover) 
          ? (req as any).files.cover[0] 
          : (req as any).files.cover
        coverUrl = `http://localhost:5000/uploads/covers/${cover.filename}`
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

      res.json({
        message: 'Трек успешно загружен',
        track,
      })
    } catch (error: any) {
      res.status(500).json({ message: error.message })
    }
  }
)

export default router

