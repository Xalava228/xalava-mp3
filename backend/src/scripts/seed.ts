import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'
import { storage } from '../db/storage'
import { Podcast, Episode, Track } from '../types'

dotenv.config()

const podcasts: Omit<Podcast, 'id' | 'createdAt'>[] = [
  {
    title: 'Технологии будущего',
    description: 'Обсуждение последних технологических трендов и инноваций',
    coverUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
    author: 'Иван Петров',
    genres: ['Технологии', 'Наука'],
  },
  {
    title: 'История России',
    description: 'Увлекательные рассказы о важных событиях в истории России',
    coverUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    author: 'Мария Сидорова',
    genres: ['История', 'Образование'],
  },
  {
    title: 'Бизнес и стартапы',
    description: 'Интервью с успешными предпринимателями и бизнес-советы',
    coverUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
    author: 'Алексей Козлов',
    genres: ['Бизнес', 'Предпринимательство'],
  },
  {
    title: 'Психология и саморазвитие',
    description: 'Практические советы по личностному росту и психологии',
    coverUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
    author: 'Елена Волкова',
    genres: ['Психология', 'Саморазвитие'],
  },
  {
    title: 'Музыка и культура',
    description: 'Разговоры о музыке, искусстве и культурных событиях',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    author: 'Дмитрий Соколов',
    genres: ['Музыка', 'Культура'],
  },
]

// Генерируем больше треков автоматически
const generateTracks = (): Omit<Track, 'id' | 'createdAt'>[] => {
  const artists = ['Анна Иванова', 'Сергей Морозов', 'Ольга Петрова', 'Дмитрий Соколов', 'Мария Волкова']
  const titles = [
    'Летняя ночь', 'Городские огни', 'Дождь', 'Звёздное небо', 'Океан',
    'Горы', 'Лес', 'Рассвет', 'Закат', 'Ветер', 'Дорога', 'Дом',
    'Мечты', 'Воспоминания', 'Надежда'
  ]
  const coverUrls = [
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
    'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
  ]

  const tracks: Omit<Track, 'id' | 'createdAt'>[] = []
  
  // Используем разные аудио источники для разнообразия
  const audioSources = [
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  ]

  for (let i = 0; i < 20; i++) {
    tracks.push({
      title: titles[i % titles.length] + (i >= titles.length ? ` ${Math.floor(i / titles.length) + 1}` : ''),
      artist: artists[i % artists.length],
      coverUrl: coverUrls[i % coverUrls.length],
      audioUrl: audioSources[i % audioSources.length], // Разные аудио для каждого трека
      duration: Math.floor(180 + Math.random() * 120), // 3-5 минут
    })
  }

  return tracks
}

const tracks = generateTracks()

async function seed() {
  try {
    console.log('Starting seed...')

    // Clear existing data by writing empty arrays
    await storage.podcasts.getAll().then(async (existing) => {
      if (existing.length > 0) {
        console.log('Clearing existing data...')
        // Data will be overwritten
      }
    })

    // Create podcasts
    const createdPodcasts: Podcast[] = []
    for (const podcastData of podcasts) {
      const podcast: Podcast = {
        id: uuidv4(),
        ...podcastData,
        createdAt: new Date().toISOString(),
      }
      await storage.podcasts.create(podcast)
      createdPodcasts.push(podcast)
    }
    console.log(`Created ${createdPodcasts.length} podcasts`)

    // Create episodes for each podcast (увеличено до 10 эпизодов)
    const episodes: Episode[] = []
    for (const podcast of createdPodcasts) {
      for (let i = 1; i <= 10; i++) {
        const episode: Episode = {
          id: uuidv4(),
          podcastId: podcast.id,
          title: `${podcast.title} - Эпизод ${i}`,
          description: `Это описание эпизода ${i} подкаста "${podcast.title}". ${podcast.description}`,
          audioUrl: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${i % 5 + 1}.mp3`,
          duration: Math.floor(1800 + Math.random() * 1800), // 30-60 minutes
          coverUrl: podcast.coverUrl,
          publishedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
        }
        await storage.episodes.create(episode)
        episodes.push(episode)
      }
    }
    console.log(`Created ${episodes.length} episodes`)

    // Create tracks
    const createdTracks: Track[] = []
    for (const trackData of tracks) {
      const track: Track = {
        id: uuidv4(),
        ...trackData,
        createdAt: new Date().toISOString(),
      }
      await storage.tracks.create(track)
      createdTracks.push(track)
    }
    console.log(`Created ${createdTracks.length} tracks`)

    console.log('Seed completed successfully!')
    console.log(`Data files created in: ${require('path').join(__dirname, '../../data')}`)
    process.exit(0)
  } catch (error) {
    console.error('Seed error:', error)
    process.exit(1)
  }
}

seed()


