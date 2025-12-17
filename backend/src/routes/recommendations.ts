import express, { Response } from 'express'
import { storage } from '../db/storage'

const router = express.Router()

router.get('/', async (req, res: Response) => {
  try {
    // Get latest recommendations
    const [allEpisodes, allTracks, allPodcasts] = await Promise.all([
      storage.episodes.getAll(),
      storage.tracks.getAll(),
      storage.podcasts.getAll(),
    ])

    const episodes = allEpisodes
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 10)

    const tracks = allTracks
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)

    const podcasts = allPodcasts
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)

    res.json({
      episodes,
      tracks,
      podcasts,
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

export default router


