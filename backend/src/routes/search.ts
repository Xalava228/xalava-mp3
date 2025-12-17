import express, { Response } from 'express'
import { storage } from '../db/storage'
import { sanitizeString } from '../utils/validation'

const router = express.Router()

router.get('/', async (req, res: Response) => {
  try {
    const { q } = req.query

    if (!q || typeof q !== 'string') {
      return res.json({
        tracks: [],
        podcasts: [],
        episodes: [],
      })
    }

    // Санитизация поискового запроса (максимум 100 символов)
    const sanitizedQuery = sanitizeString(q, 100)
    if (sanitizedQuery.length === 0) {
      return res.json({
        tracks: [],
        podcasts: [],
        episodes: [],
      })
    }

    const searchLower = sanitizedQuery.toLowerCase()

    const [allTracks, allPodcasts, allEpisodes] = await Promise.all([
      storage.tracks.getAll(),
      storage.podcasts.getAll(),
      storage.episodes.getAll(),
    ])

    const tracks = allTracks.filter(t => 
      t.title.toLowerCase().includes(searchLower) ||
      t.artist.toLowerCase().includes(searchLower)
    ).slice(0, 20)

    const podcasts = allPodcasts.filter(p => 
      p.title.toLowerCase().includes(searchLower) ||
      p.author.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower)
    ).slice(0, 20)

    const episodes = allEpisodes.filter(e => 
      e.title.toLowerCase().includes(searchLower) ||
      (e.description && e.description.toLowerCase().includes(searchLower))
    ).slice(0, 20)

    res.json({
      tracks,
      podcasts,
      episodes,
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

export default router


