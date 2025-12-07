import express, { Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { storage } from '../db/storage'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = express.Router()

// Save progress
router.post('/progress', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { episodeId, trackId, progressSeconds } = req.body

    if (!episodeId && !trackId) {
      return res.status(400).json({ message: 'Необходимо указать episodeId или trackId' })
    }

    const history = {
      id: uuidv4(),
      userId: req.userId!,
      episodeId: episodeId || undefined,
      trackId: trackId || undefined,
      progressSeconds,
      updatedAt: new Date().toISOString(),
    }

    const saved = await storage.listeningHistory.upsert(history)
    res.json(saved)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// Get listening history with full track/episode data
router.get('/history', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const history = await storage.listeningHistory.getByUserId(req.userId!)
    history.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    
    // Загружаем полные данные треков и эпизодов
    const historyWithData = await Promise.all(
      history.slice(0, 50).map(async (item) => {
        let track = null
        let episode = null
        
        if (item.trackId) {
          track = await storage.tracks.getById(item.trackId)
        }
        if (item.episodeId) {
          episode = await storage.episodes.getById(item.episodeId)
        }
        
        return {
          ...item,
          track,
          episode,
        }
      })
    )
    
    res.json(historyWithData)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

export default router


