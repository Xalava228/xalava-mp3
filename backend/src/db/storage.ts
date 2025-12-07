import fs from 'fs/promises'
import path from 'path'
import { User, Podcast, Episode, Track, ListeningHistory, Favorite } from '../types'

// Use process.cwd() to get project root, works in both dev and production
const DATA_DIR = path.join(process.cwd(), 'backend', 'data')

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
  } catch (error) {
    // Directory already exists or other error
  }
}

// File paths
const getFilePath = (filename: string) => path.join(DATA_DIR, filename)

// Generic read/write functions
async function readFile<T>(filename: string): Promise<T[]> {
  await ensureDataDir()
  const filePath = getFilePath(filename)
  try {
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data)
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return []
    }
    throw error
  }
}

async function writeFile<T>(filename: string, data: T[]): Promise<void> {
  await ensureDataDir()
  const filePath = getFilePath(filename)
  // Создаём резервную копию перед записью (только для критических файлов)
  try {
    const existingData = await fs.readFile(filePath, 'utf-8').catch(() => null)
    if (existingData) {
      const backupPath = filePath + '.backup'
      await fs.writeFile(backupPath, existingData, 'utf-8')
    }
  } catch (error) {
    // Игнорируем ошибки резервного копирования
  }
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

// Specific storage functions
export const storage = {
  users: {
    async getAll(): Promise<User[]> {
      return readFile<User>('users.json')
    },
    async getById(id: string): Promise<User | null> {
      const users = await readFile<User>('users.json')
      return users.find(u => u.id === id) || null
    },
    async getByEmail(email: string): Promise<User | null> {
      const users = await readFile<User>('users.json')
      return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null
    },
    async create(user: User): Promise<User> {
      const users = await readFile<User>('users.json')
      users.push(user)
      await writeFile('users.json', users)
      return user
    },
    async update(id: string, updates: Partial<User>): Promise<User | null> {
      const users = await readFile<User>('users.json')
      const index = users.findIndex(u => u.id === id)
      if (index === -1) return null
      users[index] = { ...users[index], ...updates }
      await writeFile('users.json', users)
      return users[index]
    },
  },

  podcasts: {
    async getAll(): Promise<Podcast[]> {
      return readFile<Podcast>('podcasts.json')
    },
    async getById(id: string): Promise<Podcast | null> {
      const podcasts = await readFile<Podcast>('podcasts.json')
      return podcasts.find(p => p.id === id) || null
    },
    async create(podcast: Podcast): Promise<Podcast> {
      const podcasts = await readFile<Podcast>('podcasts.json')
      podcasts.push(podcast)
      await writeFile('podcasts.json', podcasts)
      return podcast
    },
    async update(id: string, updates: Partial<Podcast>): Promise<Podcast | null> {
      const podcasts = await readFile<Podcast>('podcasts.json')
      const index = podcasts.findIndex(p => p.id === id)
      if (index === -1) return null
      podcasts[index] = { ...podcasts[index], ...updates }
      await writeFile('podcasts.json', podcasts)
      return podcasts[index]
    },
    async delete(id: string): Promise<boolean> {
      const podcasts = await readFile<Podcast>('podcasts.json')
      const index = podcasts.findIndex(p => p.id === id)
      if (index === -1) return false
      podcasts.splice(index, 1)
      await writeFile('podcasts.json', podcasts)
      return true
    },
  },

  episodes: {
    async getAll(): Promise<Episode[]> {
      return readFile<Episode>('episodes.json')
    },
    async getById(id: string): Promise<Episode | null> {
      const episodes = await readFile<Episode>('episodes.json')
      return episodes.find(e => e.id === id) || null
    },
    async getByPodcastId(podcastId: string): Promise<Episode[]> {
      const episodes = await readFile<Episode>('episodes.json')
      return episodes.filter(e => e.podcastId === podcastId)
    },
    async create(episode: Episode): Promise<Episode> {
      const episodes = await readFile<Episode>('episodes.json')
      episodes.push(episode)
      await writeFile('episodes.json', episodes)
      return episode
    },
  },

  tracks: {
    async getAll(): Promise<Track[]> {
      return readFile<Track>('tracks.json')
    },
    async getById(id: string): Promise<Track | null> {
      const tracks = await readFile<Track>('tracks.json')
      return tracks.find(t => t.id === id) || null
    },
    async create(track: Track): Promise<Track> {
      const tracks = await readFile<Track>('tracks.json')
      tracks.push(track)
      await writeFile('tracks.json', tracks)
      return track
    },
    async update(id: string, updates: Partial<Track>): Promise<Track | null> {
      const tracks = await readFile<Track>('tracks.json')
      const index = tracks.findIndex(t => t.id === id)
      if (index === -1) return null
      tracks[index] = { ...tracks[index], ...updates }
      await writeFile('tracks.json', tracks)
      return tracks[index]
    },
  },

  listeningHistory: {
    async getAll(): Promise<ListeningHistory[]> {
      return readFile<ListeningHistory>('listeningHistory.json')
    },
    async getByUserId(userId: string): Promise<ListeningHistory[]> {
      const history = await readFile<ListeningHistory>('listeningHistory.json')
      return history.filter(h => h.userId === userId)
    },
    async findByUserAndContent(userId: string, episodeId?: string, trackId?: string): Promise<ListeningHistory | null> {
      const history = await readFile<ListeningHistory>('listeningHistory.json')
      return history.find(h => 
        h.userId === userId && 
        (episodeId ? h.episodeId === episodeId : true) &&
        (trackId ? h.trackId === trackId : true)
      ) || null
    },
    async create(history: ListeningHistory): Promise<ListeningHistory> {
      const allHistory = await readFile<ListeningHistory>('listeningHistory.json')
      allHistory.push(history)
      await writeFile('listeningHistory.json', allHistory)
      return history
    },
    async update(id: string, updates: Partial<ListeningHistory>): Promise<ListeningHistory | null> {
      const history = await readFile<ListeningHistory>('listeningHistory.json')
      const index = history.findIndex(h => h.id === id)
      if (index === -1) return null
      history[index] = { ...history[index], ...updates }
      await writeFile('listeningHistory.json', history)
      return history[index]
    },
    async upsert(history: ListeningHistory): Promise<ListeningHistory> {
      const existing = await this.findByUserAndContent(
        history.userId,
        history.episodeId,
        history.trackId
      )
      
      if (existing) {
        return (await this.update(existing.id, {
          progressSeconds: history.progressSeconds,
          updatedAt: history.updatedAt,
        })) || history
      } else {
        return await this.create(history)
      }
    },
  },

  favorites: {
    async getAll(): Promise<Favorite[]> {
      return readFile<Favorite>('favorites.json')
    },
    async getByUserId(userId: string): Promise<Favorite[]> {
      const favorites = await readFile<Favorite>('favorites.json')
      return favorites.filter(f => f.userId === userId)
    },
    async create(favorite: Favorite): Promise<Favorite> {
      const favorites = await readFile<Favorite>('favorites.json')
      favorites.push(favorite)
      await writeFile('favorites.json', favorites)
      return favorite
    },
    async delete(id: string): Promise<boolean> {
      const favorites = await readFile<Favorite>('favorites.json')
      const index = favorites.findIndex(f => f.id === id)
      if (index === -1) return false
      favorites.splice(index, 1)
      await writeFile('favorites.json', favorites)
      return true
    },
    async findByUserAndContent(userId: string, trackId?: string, episodeId?: string, podcastId?: string): Promise<Favorite | null> {
      const favorites = await readFile<Favorite>('favorites.json')
      return favorites.find(f => 
        f.userId === userId && 
        (trackId ? f.trackId === trackId : true) &&
        (episodeId ? f.episodeId === episodeId : true) &&
        (podcastId ? f.podcastId === podcastId : true)
      ) || null
    },
  },
}

