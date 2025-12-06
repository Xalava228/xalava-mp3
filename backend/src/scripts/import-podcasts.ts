import dotenv from 'dotenv'
import Parser from 'rss-parser'
import { v4 as uuidv4 } from 'uuid'
import { storage } from '../db/storage'
import { Podcast, Episode } from '../types'

dotenv.config()

const parser = new Parser()

// Популярные RSS фиды подкастов (можно добавить свои)
const PODCAST_RSS_FEEDS = [
  'https://feeds.simplecast.com/54nAGcIl', // Пример подкаста
  'https://rss.cnn.com/rss/edition.rss', // CNN (можно использовать как пример)
  // Добавьте сюда свои RSS фиды подкастов
]

// Альтернативно: готовые данные популярных подкастов
const POPULAR_PODCASTS = [
  {
    title: 'Подкаст о технологиях',
    description: 'Еженедельные обсуждения последних новостей в мире технологий',
    coverUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
    author: 'Tech Weekly',
    genres: ['Технологии', 'Наука'],
    rssUrl: null, // Если есть RSS, укажите здесь
  },
  {
    title: 'Исторические рассказы',
    description: 'Увлекательные истории из прошлого',
    coverUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    author: 'История России',
    genres: ['История', 'Образование'],
    rssUrl: null,
  },
  {
    title: 'Бизнес подкаст',
    description: 'Интервью с успешными предпринимателями',
    coverUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
    author: 'Business Talk',
    genres: ['Бизнес'],
    rssUrl: null,
  },
  {
    title: 'Психология и саморазвитие',
    description: 'Практические советы по личностному росту',
    coverUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
    author: 'Психология жизни',
    genres: ['Психология'],
    rssUrl: null,
  },
  {
    title: 'Музыкальный подкаст',
    description: 'Разговоры о музыке и культуре',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    author: 'Music Culture',
    genres: ['Музыка', 'Культура'],
    rssUrl: null,
  },
]

interface RSSFeed {
  title: string
  description: string
  link?: string
  items: Array<{
    title: string
    pubDate?: string
    enclosure?: {
      url: string
      type?: string
    }
    content?: string
    contentSnippet?: string
  }>
}

async function importFromRSS(rssUrl: string): Promise<{ podcast: Podcast; episodes: Episode[] } | null> {
  try {
    console.log(`Импортирую подкаст из RSS: ${rssUrl}`)
    const feed = await parser.parseURL(rssUrl) as RSSFeed

    if (!feed.title || !feed.items || feed.items.length === 0) {
      console.log(`Пропущен: нет данных в RSS фиде`)
      return null
    }

    // Создаём подкаст
    const podcast: Podcast = {
      id: uuidv4(),
      title: feed.title,
      description: feed.description || 'Описание отсутствует',
      coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', // Дефолтная обложка
      author: feed.link || 'Неизвестный автор',
      genres: ['Подкаст'],
      createdAt: new Date().toISOString(),
    }

    // Создаём эпизоды
    const episodes: Episode[] = feed.items.slice(0, 10).map((item, index) => {
      const audioUrl = item.enclosure?.url || `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${index + 1}.mp3`
      
      return {
        id: uuidv4(),
        podcastId: podcast.id,
        title: item.title || `Эпизод ${index + 1}`,
        description: item.contentSnippet || item.content || `Описание эпизода ${index + 1}`,
        audioUrl,
        duration: 1800 + Math.random() * 1800, // 30-60 минут
        coverUrl: podcast.coverUrl,
        publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }
    })

    return { podcast, episodes }
  } catch (error: any) {
    console.error(`Ошибка при импорте RSS ${rssUrl}:`, error.message)
    return null
  }
}

async function createPodcastWithEpisodes(podcastData: typeof POPULAR_PODCASTS[0]): Promise<void> {
  const podcast: Podcast = {
    id: uuidv4(),
    ...podcastData,
    createdAt: new Date().toISOString(),
  }

  await storage.podcasts.create(podcast)

  // Создаём 10 эпизодов для каждого подкаста
  const episodes: Episode[] = []
  for (let i = 1; i <= 10; i++) {
    const episode: Episode = {
      id: uuidv4(),
      podcastId: podcast.id,
      title: `${podcast.title} - Эпизод ${i}`,
      description: `Это описание эпизода ${i} подкаста "${podcast.title}". ${podcast.description}`,
      audioUrl: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${i % 5 + 1}.mp3`,
      duration: Math.floor(1800 + Math.random() * 1800), // 30-60 минут
      coverUrl: podcast.coverUrl,
      publishedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    }
    await storage.episodes.create(episode)
    episodes.push(episode)
  }

  console.log(`✓ Создан подкаст: ${podcast.title} (${episodes.length} эпизодов)`)
}

async function importPodcasts() {
  try {
    console.log('Начинаю импорт подкастов...\n')

    // Попытка импорта из RSS (если указаны)
    let importedCount = 0
    for (const rssUrl of PODCAST_RSS_FEEDS) {
      if (!rssUrl) continue
      
      const result = await importFromRSS(rssUrl)
      if (result) {
        await storage.podcasts.create(result.podcast)
        for (const episode of result.episodes) {
          await storage.episodes.create(episode)
        }
        importedCount++
        console.log(`✓ Импортирован из RSS: ${result.podcast.title} (${result.episodes.length} эпизодов)\n`)
      }
    }

    // Создание подкастов из готовых данных
    console.log('Создаю подкасты из готовых данных...\n')
    for (const podcastData of POPULAR_PODCASTS) {
      await createPodcastWithEpisodes(podcastData)
    }

    console.log(`\n✅ Импорт завершён!`)
    console.log(`   - Импортировано из RSS: ${importedCount}`)
    console.log(`   - Создано из готовых данных: ${POPULAR_PODCASTS.length}`)
    console.log(`   - Всего эпизодов: ~${POPULAR_PODCASTS.length * 10}`)
    
  } catch (error: any) {
    console.error('Ошибка при импорте:', error.message)
    process.exit(1)
  }
}

// Запуск
importPodcasts().then(() => {
  process.exit(0)
})

