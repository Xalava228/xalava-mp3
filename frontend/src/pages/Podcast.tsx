import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { podcastsApi } from '../api/podcasts'
import { useAuthStore } from '../store/authStore'
import Card from '../components/Card'
import PlayButton from '../components/PlayButton'
import AddEpisodeModal from '../components/AddEpisodeModal'
import { formatTime } from '../utils/formatTime'
import { Link } from 'react-router-dom'
import { ArrowLeft, Plus } from 'lucide-react'
import { useState } from 'react'

export default function Podcast() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const [isAddEpisodeModalOpen, setIsAddEpisodeModalOpen] = useState(false)

  const { data: podcast } = useQuery({
    queryKey: ['podcast', id],
    queryFn: () => podcastsApi.getById(id!),
    enabled: !!id,
  })

  const { data: episodes } = useQuery({
    queryKey: ['episodes', id],
    queryFn: () => podcastsApi.getEpisodes(id!),
    enabled: !!id,
  })

  if (!podcast) {
    return (
      <div className="p-8 pb-32 max-md:p-4 max-md:pt-20">
        <div className="text-center py-12 text-dark-text-secondary">
          Загрузка...
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 pb-32 max-md:p-4 max-md:pt-20">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-dark-text-secondary hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад
      </Link>

      <div className="flex gap-8 mb-8 max-md:flex-col max-md:gap-4">
        <img
          src={podcast.coverUrl}
          alt={podcast.title}
          className="w-64 h-64 rounded-card object-cover flex-shrink-0 max-md:w-full max-md:h-auto max-md:aspect-square"
        />
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-4 max-md:text-2xl">{podcast.title}</h1>
          <p className="text-lg text-dark-text-secondary mb-4">
            {podcast.author}
          </p>
          <p className="text-dark-text-secondary mb-6">
            {podcast.description}
          </p>
          <div className="flex gap-2 flex-wrap">
            {podcast.genres.map((genre) => (
              <span
                key={genre}
                className="px-3 py-1 bg-dark-hover rounded-full text-sm text-dark-text-secondary"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Эпизоды</h2>
          {user && (
            <button
              onClick={() => setIsAddEpisodeModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-dark-accent to-dark-accent-secondary hover:from-dark-accent-secondary hover:to-dark-accent text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-dark-accent/30 hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить эпизод</span>
            </button>
          )}
        </div>
        {episodes && episodes.length > 0 ? (
          <div className="space-y-2">
            {episodes.map((episode) => (
              <Link key={episode.id} to={`/episode/${episode.id}`}>
                <Card className="flex items-center gap-4">
                  <img
                    src={episode.coverUrl || podcast.coverUrl}
                    alt={episode.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{episode.title}</h3>
                    <p className="text-sm text-dark-text-secondary truncate">
                      {episode.description || 'Описание отсутствует'}
                    </p>
                    <p className="text-xs text-dark-text-secondary mt-1">
                      {new Date(episode.publishedAt).toLocaleDateString('ru-RU')} • {formatTime(episode.duration)}
                    </p>
                  </div>
                  <div onClick={(e) => e.preventDefault()}>
                    <PlayButton item={episode} queue={episodes} />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-dark-text-secondary">
            {user ? 'Пока нет эпизодов. Добавьте первый эпизод!' : 'Пока нет эпизодов'}
          </div>
        )}
      </section>

      {id && (
        <AddEpisodeModal
          isOpen={isAddEpisodeModalOpen}
          onClose={() => setIsAddEpisodeModalOpen(false)}
          podcastId={id}
        />
      )}
    </div>
  )
}


