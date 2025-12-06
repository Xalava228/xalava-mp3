import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { podcastsApi } from '../api/podcasts'
import Card from '../components/Card'
import PlayButton from '../components/PlayButton'
import ProgressBar from '../components/ProgressBar'
import { formatTime } from '../utils/formatTime'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { usePlayerStore } from '../store/playerStore'

export default function Episode() {
  const { id } = useParams<{ id: string }>()
  const { currentTrack, isPlaying, togglePlay, currentTime, duration } = usePlayerStore()

  const { data: episode } = useQuery({
    queryKey: ['episode', id],
    queryFn: () => podcastsApi.getEpisode(id!),
    enabled: !!id,
  })

  const isCurrentEpisode = currentTrack?.id === episode?.id

  if (!episode) {
    return (
      <div className="p-8 pb-32">
        <div className="text-center py-12 text-dark-text-secondary">
          Загрузка...
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 pb-32">
      <Link
        to={`/podcast/${episode.podcastId}`}
        className="inline-flex items-center gap-2 text-dark-text-secondary hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад к подкасту
      </Link>

      <div className="max-w-4xl mx-auto">
        <div className="flex gap-8 mb-8">
          <img
            src={episode.coverUrl || '/placeholder.jpg'}
            alt={episode.title}
            className="w-64 h-64 rounded-card object-cover flex-shrink-0"
          />
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-4">{episode.title}</h1>
            <p className="text-dark-text-secondary mb-6">
              {episode.description || 'Описание отсутствует'}
            </p>
            <div className="mb-6">
              <p className="text-sm text-dark-text-secondary mb-2">
                {new Date(episode.publishedAt).toLocaleDateString('ru-RU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })} • {formatTime(episode.duration)}
              </p>
            </div>
            <PlayButton item={episode} />
          </div>
        </div>

        {isCurrentEpisode && (
          <Card className="p-6">
            <div className="mb-4">
              <ProgressBar
                progress={duration > 0 ? (currentTime / duration) * 100 : 0}
                className="mb-2"
              />
              <div className="flex justify-between text-sm text-dark-text-secondary">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            <button
              onClick={togglePlay}
              className="px-6 py-2 bg-gradient-to-r from-dark-accent to-dark-accent-secondary hover:from-dark-accent-secondary hover:to-dark-accent text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-dark-accent/30 hover:scale-105"
            >
              {isPlaying ? 'Пауза' : 'Воспроизвести'}
            </button>
          </Card>
        )}
      </div>
    </div>
  )
}

