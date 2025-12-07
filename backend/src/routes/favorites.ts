import express, { Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { storage } from '../db/storage'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = express.Router()

// Get user favorites
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const favorites = await storage.favorites.getByUserId(req.userId!)
    
    // Загружаем полные данные
    const favoritesWithData = await Promise.all(
      favorites.map(async (fav) => {
        let track = null
        let episode = null
        let podcast = null
        
        if (fav.trackId) {
          track = await storage.tracks.getById(fav.trackId)
        }
        if (fav.episodeId) {
          episode = await storage.episodes.getById(fav.episodeId)
        }
        if (fav.podcastId) {
          podcast = await storage.podcasts.getById(fav.podcastId)
        }
        
        return {
          ...fav,
          track,
          episode,
          podcast,
        }
      })
    )
    
    res.json(favoritesWithData)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// Add to favorites
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { trackId, episodeId, podcastId } = req.body

    if (!trackId && !episodeId && !podcastId) {
      return res.status(400).json({ message: 'Необходимо указать trackId, episodeId или podcastId' })
    }

    // Валидация ID (должны быть строками и не пустыми)
    if (trackId && (typeof trackId !== 'string' || trackId.trim().length === 0)) {
      return res.status(400).json({ message: 'Некорректный trackId' })
    }
    if (episodeId && (typeof episodeId !== 'string' || episodeId.trim().length === 0)) {
      return res.status(400).json({ message: 'Некорректный episodeId' })
    }
    if (podcastId && (typeof podcastId !== 'string' || podcastId.trim().length === 0)) {
      return res.status(400).json({ message: 'Некорректный podcastId' })
    }

    // Проверяем существование контента
    if (trackId) {
      const track = await storage.tracks.getById(trackId)
      if (!track) {
        return res.status(404).json({ message: 'Трек не найден' })
      }
    }
    if (episodeId) {
      const episode = await storage.episodes.getById(episodeId)
      if (!episode) {
        return res.status(404).json({ message: 'Эпизод не найден' })
      }
    }
    if (podcastId) {
      const podcast = await storage.podcasts.getById(podcastId)
      if (!podcast) {
        return res.status(404).json({ message: 'Подкаст не найден' })
      }
    }

    // Проверяем, не добавлено ли уже
    const existing = await storage.favorites.findByUserAndContent(
      req.userId!,
      trackId,
      episodeId,
      podcastId
    )

    if (existing) {
      return res.status(400).json({ message: 'Уже в избранном' })
    }

    const favorite = {
      id: uuidv4(),
      userId: req.userId!,
      trackId: trackId || undefined,
      episodeId: episodeId || undefined,
      podcastId: podcastId || undefined,
      createdAt: new Date().toISOString(),
    }

    await storage.favorites.create(favorite)
    res.json(favorite)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// Remove from favorites
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const favorite = await storage.favorites.getAll()
    const fav = favorite.find(f => f.id === req.params.id)
    
    if (!fav || fav.userId !== req.userId!) {
      return res.status(404).json({ message: 'Не найдено' })
    }

    await storage.favorites.delete(req.params.id)
    res.json({ message: 'Удалено из избранного' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// Check if item is favorited
router.get('/check', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { trackId, episodeId, podcastId } = req.query

    const existing = await storage.favorites.findByUserAndContent(
      req.userId!,
      trackId as string,
      episodeId as string,
      podcastId as string
    )

    res.json({ isFavorited: !!existing, favoriteId: existing?.id })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

export default router

