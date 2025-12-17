import express, { Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import multer from 'multer'
import path from 'path'
import Parser from 'rss-parser'
import axios from 'axios'
import { storage } from '../db/storage'
import { uploadCover } from '../middleware/upload'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { rateLimit } from '../middleware/rateLimit'
import { Podcast } from '../types'
import { validateTitle, validateDescription, validateUrl, sanitizeString } from '../utils/validation'

// Настраиваем парсер для более быстрой обработки больших RSS фидов
const parser = new Parser({
  timeout: 120000, // 120 секунд (2 минуты) таймаут для загрузки RSS
  maxRedirects: 5,
  requestOptions: {
    timeout: 120000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  },
  customFields: {
    item: [
      ['content:encoded', 'contentEncoded'],
      ['itunes:duration', 'itunesDuration'],
    ]
  }
})

const router = express.Router()

// Get all podcasts
router.get('/', async (req, res: Response) => {
  try {
    const podcasts = await storage.podcasts.getAll()
    podcasts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    res.json(podcasts)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// Get podcast by ID
router.get('/:id', async (req, res: Response) => {
  try {
    const podcast = await storage.podcasts.getById(req.params.id)
    if (!podcast) {
      return res.status(404).json({ message: 'Подкаст не найден' })
    }
    res.json(podcast)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// Get episodes for a podcast
router.get('/:id/episodes', async (req, res: Response) => {
  try {
    const episodes = await storage.episodes.getByPodcastId(req.params.id)
    episodes.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    res.json(episodes)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// Import podcast from RSS (requires auth)
router.post(
  '/import',
  authMiddleware,
  rateLimit(5, 60 * 60 * 1000), // Максимум 5 импортов в час
  async (req: AuthRequest, res: Response) => {
    try {
      const { rssUrl, genres } = req.body

      if (!rssUrl) {
        return res.status(400).json({ message: 'RSS ссылка обязательна' })
      }

      console.log('Импорт подкаста из RSS:', rssUrl)

      // Парсим RSS фид с увеличенным таймаутом для больших фидов
      let feed
      try {
        console.log('Начинаю парсинг RSS фида...')
        const parsePromise = parser.parseURL(rssUrl)
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Таймаут при загрузке RSS фида (более 120 секунд). RSS фид слишком большой или медленный.')), 120000)
        )
        feed = await Promise.race([parsePromise, timeoutPromise]) as any
        console.log(`RSS фид успешно загружен. Найдено эпизодов: ${feed.items?.length || 0}`)
      } catch (parseError: any) {
        console.error('Ошибка парсинга RSS:', parseError)
        
        // Более понятные сообщения об ошибках
        if (parseError.message.includes('Таймаут') || parseError.code === 'ETIMEDOUT') {
          throw new Error('Таймаут при загрузке RSS фида. Возможно, фид слишком большой или сервер медленно отвечает. Попробуйте другой RSS фид.')
        } else if (parseError.code === 'ECONNRESET' || parseError.code === 'ENOTFOUND') {
          throw new Error('Не удалось подключиться к серверу RSS фида. Проверьте правильность ссылки и доступность интернета.')
        } else if (parseError.statusCode === 404) {
          throw new Error('RSS фид не найден (404). Проверьте правильность ссылки.')
        } else if (parseError.statusCode) {
          throw new Error(`Ошибка сервера RSS фида: ${parseError.statusCode}. Попробуйте позже или используйте другой RSS фид.`)
        } else {
          throw new Error(`Ошибка при парсинге RSS: ${parseError.message || 'Неизвестная ошибка'}`)
        }
      }

      if (!feed.title || !feed.items || feed.items.length === 0) {
        return res.status(400).json({ message: 'Неверный RSS фид или нет эпизодов' })
      }

      // Создаём подкаст
      const coverUrl = feed.image?.url || feed.itunes?.image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400'
      
      // Парсим жанры
      const genresArray = genres
        ? genres.split(',').map((g: string) => g.trim()).filter((g: string) => g.length > 0)
        : (feed.itunes?.categories || []).map((cat: any) => typeof cat === 'string' ? cat : cat._ || cat.$.text || '').filter((g: string) => g.length > 0)

      // Санитизация данных из RSS
      const sanitizedTitle = sanitizeString(feed.title || 'Без названия', 200)
      const sanitizedDescription = sanitizeString(feed.description || feed.itunes?.summary || '', 2000)
      const sanitizedAuthor = sanitizeString(feed.itunes?.author || feed.creator || 'Неизвестный автор', 200)
      const sanitizedGenres = genresArray.map((g: string) => sanitizeString(g, 50))

      const podcast = {
        id: uuidv4(),
        title: sanitizedTitle,
        description: sanitizedDescription,
        author: sanitizedAuthor,
        coverUrl,
        genres: sanitizedGenres,
        createdAt: new Date().toISOString(),
        uploadedBy: req.userId, // Сохраняем ID пользователя
      }

      // Сначала проверяем, есть ли хотя бы один эпизод с аудио
      const itemsToProcess = feed.items.slice(0, 10) // Обрабатываем только первые 10 эпизодов для быстрой загрузки
      let hasAudioEpisodes = false
      
      for (const item of itemsToProcess) {
        if (item.enclosure?.url) {
          const audioExtensions = ['.mp3', '.m4a', '.mp4', '.wav', '.ogg', '.aac', '.flac']
          const audioMimeTypes = ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac']
          const urlLower = item.enclosure.url.toLowerCase()
          const hasAudioExtension = audioExtensions.some(ext => urlLower.includes(ext))
          const hasAudioMimeType = item.enclosure.type && audioMimeTypes.some(mime => item.enclosure.type?.toLowerCase().includes(mime.split('/')[1]))
          
          if (hasAudioExtension || hasAudioMimeType) {
            hasAudioEpisodes = true
            break
          }
        }
      }
      
      if (!hasAudioEpisodes) {
        return res.status(400).json({ 
          message: 'В RSS фиде не найдено эпизодов с аудио файлами. Убедитесь, что это RSS фид подкаста, а не новостной фид. RSS фид должен содержать теги <enclosure> с аудио файлами (mp3, m4a, wav и т.д.).' 
        })
      }
      
      // Создаём подкаст только если есть эпизоды с аудио
      await storage.podcasts.create(podcast)

      // Создаём эпизоды из RSS
      const episodes = []
      
      console.log(`Обрабатываю ${itemsToProcess.length} эпизодов...`)
      
      for (let i = 0; i < itemsToProcess.length; i++) {
        const item = itemsToProcess[i]
        
        // Проверяем наличие реального аудио файла в enclosure
        const audioUrl = item.enclosure?.url || ''
        
        // Если нет enclosure, это не подкаст с аудио, а новостная статья
        if (!audioUrl || !item.enclosure) {
          console.log(`Пропущен эпизод ${i + 1}: нет аудио файла (enclosure). Это новостная статья, а не подкаст.`)
          continue
        }
        
        // Проверяем, что это действительно аудио файл (по расширению или MIME типу)
        const audioExtensions = ['.mp3', '.m4a', '.mp4', '.wav', '.ogg', '.aac', '.flac']
        const audioMimeTypes = ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac']
        const urlLower = audioUrl.toLowerCase()
        const hasAudioExtension = audioExtensions.some(ext => urlLower.includes(ext))
        const hasAudioMimeType = item.enclosure.type && audioMimeTypes.some(mime => item.enclosure.type?.toLowerCase().includes(mime.split('/')[1]))
        
        if (!hasAudioExtension && !hasAudioMimeType) {
          console.log(`Пропущен эпизод ${i + 1}: URL не является аудио файлом: ${audioUrl}`)
          continue
        }

        // Пытаемся получить длительность
        let duration = 0
        if (item.itunes?.duration) {
          const dur = item.itunes.duration
          if (typeof dur === 'string') {
            const parts = dur.split(':').map(Number)
            if (parts.length === 3) {
              duration = parts[0] * 3600 + parts[1] * 60 + parts[2]
            } else if (parts.length === 2) {
              duration = parts[0] * 60 + parts[1]
            } else {
              duration = parseInt(dur) || 1800
            }
          } else {
            duration = dur || 1800
          }
        } else {
          duration = 1800 // 30 минут по умолчанию
        }

        // Санитизация данных эпизода
        const sanitizedEpisodeTitle = sanitizeString(item.title || 'Без названия', 200)
        const rawDescription = item.contentSnippet || item.content || item.summary || ''
        const sanitizedEpisodeDesc = sanitizeString(rawDescription, 2000)

        const episode = {
          id: uuidv4(),
          podcastId: podcast.id,
          title: sanitizedEpisodeTitle,
          description: sanitizedEpisodeDesc,
          audioUrl,
          duration,
          coverUrl: item.itunes?.image || podcast.coverUrl,
          publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          createdAt: new Date().toISOString(),
        }

        episodes.push(episode)
      }

      console.log(`Создаю ${episodes.length} эпизодов в базе данных...`)
      
      // Создаём все эпизоды батчем (быстрее чем по одному)
      for (const episode of episodes) {
        await storage.episodes.create(episode)
      }
      
      console.log(`Эпизоды успешно созданы`)

      console.log(`Подкаст импортирован: ${podcast.title} (${episodes.length} эпизодов)`)

      res.json({
        message: `Подкаст успешно импортирован. Добавлено ${episodes.length} эпизодов`,
        podcast,
        episodesCount: episodes.length,
      })
    } catch (error: any) {
      console.error('Ошибка при импорте подкаста:', error)
      res.status(500).json({ 
        message: error.message || 'Ошибка при импорте подкаста. Проверьте правильность RSS ссылки' 
      })
    }
  }
)

// Update podcast (requires auth, only owner can update)
router.put(
  '/:id',
  authMiddleware,
  uploadCover.single('cover'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params
      const { title, description, author, genres } = req.body

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Некорректный ID подкаста' })
      }

      const podcast = await storage.podcasts.getById(id)
      if (!podcast) {
        return res.status(404).json({ message: 'Подкаст не найден' })
      }

      // Проверяем что пользователь является владельцем
      if (podcast.uploadedBy && podcast.uploadedBy !== req.userId) {
        return res.status(403).json({ message: 'Вы можете редактировать только свои подкасты' })
      }

      const updates: Partial<Podcast> = {}
      if (title) {
        if (!validateTitle(title)) {
          return res.status(400).json({ message: 'Название должно быть от 1 до 200 символов' })
        }
        updates.title = sanitizeString(title, 200)
      }
      if (description !== undefined) {
        if (!validateDescription(description)) {
          return res.status(400).json({ message: 'Описание не должно превышать 2000 символов' })
        }
        updates.description = sanitizeString(description, 2000)
      }
      if (author) {
        if (!validateTitle(author)) {
          return res.status(400).json({ message: 'Имя автора должно быть от 1 до 200 символов' })
        }
        updates.author = sanitizeString(author, 200)
      }
      if (genres) {
        const genresArray = genres
          ? genres.split(',').map((g: string) => sanitizeString(g.trim(), 50)).filter((g: string) => g.length > 0 && g.length <= 50)
          : []
        if (genresArray.length > 10) {
          return res.status(400).json({ message: 'Максимум 10 жанров' })
        }
        updates.genres = genresArray
      }

      // Обновляем обложку если загружена новая
      if ((req as any).file) {
        const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`
        updates.coverUrl = `${baseUrl}/uploads/covers/${(req as any).file.filename}`
      }

      const updatedPodcast = await storage.podcasts.update(id, updates)
      if (!updatedPodcast) {
        return res.status(404).json({ message: 'Подкаст не найден' })
      }

      res.json({
        message: 'Подкаст успешно обновлён',
        podcast: updatedPodcast,
      })
    } catch (error: any) {
      console.error('Ошибка при обновлении подкаста:', error)
      res.status(500).json({ message: error.message || 'Внутренняя ошибка сервера' })
    }
  }
)

// Upload new podcast manually (requires auth)
const uploadPodcastCover = uploadCover.single('cover')

router.post(
  '/upload',
  authMiddleware,
  rateLimit(10, 60 * 60 * 1000), // Максимум 10 подкастов в час
  uploadPodcastCover,
  async (req: AuthRequest, res: Response) => {
    try {
      console.log('Загрузка подкаста...')
      console.log('Body:', req.body)
      console.log('Cover file:', (req as any).file)

      const { title, description, author, genres } = req.body

      if (!title || !author) {
        return res.status(400).json({ message: 'Название и автор обязательны' })
      }

      // Валидация
      if (!validateTitle(title)) {
        return res.status(400).json({ message: 'Название должно быть от 1 до 200 символов' })
      }

      if (!validateTitle(author)) {
        return res.status(400).json({ message: 'Имя автора должно быть от 1 до 200 символов' })
      }

      if (description && !validateDescription(description)) {
        return res.status(400).json({ message: 'Описание не должно превышать 2000 символов' })
      }

      const sanitizedTitle = sanitizeString(title, 200)
      const sanitizedAuthor = sanitizeString(author, 200)
      const sanitizedDescription = description ? sanitizeString(description, 2000) : ''

      // Получаем URL для обложки (если загружена)
      let coverUrl = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400'
      if ((req as any).file && (req as any).file.filename) {
        const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`
        coverUrl = `${baseUrl}/uploads/covers/${(req as any).file.filename}`
      }

      // Парсим жанры с санитизацией
      const genresArray = genres
        ? genres.split(',').map((g: string) => sanitizeString(g.trim(), 50)).filter((g: string) => g.length > 0 && g.length <= 50)
        : []
      
      if (genresArray.length > 10) {
        return res.status(400).json({ message: 'Максимум 10 жанров' })
      }

      const podcast = {
        id: uuidv4(),
        title: sanitizedTitle,
        description: sanitizedDescription,
        author: sanitizedAuthor,
        coverUrl,
        genres: genresArray,
        createdAt: new Date().toISOString(),
        uploadedBy: req.userId, // Сохраняем ID пользователя
      }

      await storage.podcasts.create(podcast)

      console.log('Подкаст создан:', podcast)

      res.json({
        message: 'Подкаст успешно создан',
        podcast,
      })
    } catch (error: any) {
      console.error('Ошибка при загрузке подкаста:', error)
      res.status(500).json({ message: error.message || 'Внутренняя ошибка сервера' })
    }
  }
)

export default router


