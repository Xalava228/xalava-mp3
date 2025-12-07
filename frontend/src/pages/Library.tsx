import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import { playerApi } from '../api/player'
import { podcastsApi } from '../api/podcasts'
import { favoritesApi } from '../api/favorites'
import { tracksApi } from '../api/tracks'
import Card from '../components/Card'
import ProgressBar from '../components/ProgressBar'
import PlayButton from '../components/PlayButton'
import ContinueButton from '../components/ContinueButton'
import FavoriteButton from '../components/FavoriteButton'
import { Link } from 'react-router-dom'
import { formatTime } from '../utils/formatTime'
import { Heart, Clock } from 'lucide-react'

export default function Library() {
  const { user } = useAuthStore()

  const { data: history } = useQuery({
    queryKey: ['history'],
    queryFn: playerApi.getHistory,
    enabled: !!user,
  })

  const { data: favorites } = useQuery({
    queryKey: ['favorites'],
    queryFn: favoritesApi.getAll,
    enabled: !!user,
  })

  const { data: tracks } = useQuery({
    queryKey: ['tracks'],
    queryFn: tracksApi.getAll,
  })

  const { data: podcasts } = useQuery({
    queryKey: ['podcasts'],
    queryFn: podcastsApi.getAll,
  })

  if (!user) {
    return (
      <div className="p-8 pb-32 text-center">
        <p className="text-dark-text-secondary">
          Войдите, чтобы видеть свою библиотеку
        </p>
      </div>
    )
  }

  return (
    <div className="p-8 pb-32 max-md:p-4 max-md:pt-20">
      <h1 className="text-3xl font-bold mb-8 max-md:text-2xl">Библиотека</h1>

      {/* Favorites */}
      {favorites && favorites.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            Избранное
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {favorites.map((fav) => {
              const content = fav.track || fav.episode || fav.podcast
              if (!content) return null

              return (
                <Card key={fav.id} className="group relative">
                  <div className="aspect-square rounded-card overflow-hidden mb-3 bg-dark-hover relative">
                    <Link 
                      to={
                        fav.track ? '/' : 
                        fav.episode ? `/episode/${fav.episodeId}` : 
                        `/podcast/${fav.podcastId}`
                      }
                      className="block w-full h-full"
                    >
                      <img
                        src={content.coverUrl || '/placeholder.jpg'}
                        alt={content.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </Link>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      {fav.track && tracks && (
                        <PlayButton item={fav.track} queue={tracks} className="scale-75" />
                      )}
                      {fav.episode && (
                        <PlayButton item={fav.episode} className="scale-75" />
                      )}
                    </div>
                    {/* Кнопка удаления из избранного */}
                    <div className="absolute top-2 right-2 z-10">
                      <FavoriteButton
                        trackId={fav.trackId}
                        episodeId={fav.episodeId}
                        podcastId={fav.podcastId}
                        className="bg-black/50 backdrop-blur-sm"
                      />
                    </div>
                  </div>
                  <Link 
                    to={
                      fav.track ? '/' : 
                      fav.episode ? `/episode/${fav.episodeId}` : 
                      `/podcast/${fav.podcastId}`
                    }
                  >
                    <h3 className="font-semibold mb-1 truncate">{content.title}</h3>
                    <p className="text-sm text-dark-text-secondary truncate">
                      {fav.track ? content.artist : fav.podcast ? content.author : 'Подкаст'}
                    </p>
                  </Link>
                </Card>
              )
            })}
          </div>
        </section>
      )}

      {/* Recently Played */}
      {history && history.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6" />
            Недавно прослушано
          </h2>
          <div className="space-y-2">
            {history
              .sort((a: any, b: any) => {
                // Сортируем по дате последнего обновления (новые сверху)
                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
              })
              .slice(0, 20)
              .map((item: any) => {
                const content = item.track || item.episode
                if (!content) return null
                
                const progressPercent = content.duration > 0 
                  ? (item.progressSeconds / content.duration) * 100 
                  : 0

                const canContinue = item.progressSeconds > 5 && progressPercent < 95

                return (
                  <Card key={item.id} className="flex items-center gap-4 p-4 hover:bg-dark-hover transition-colors group">
                    <Link 
                      to={item.track ? '/' : `/episode/${item.episodeId}`}
                      className="flex items-center gap-4 flex-1 min-w-0"
                    >
                      <img
                        src={content.coverUrl || '/placeholder.jpg'}
                        alt={content.title}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{content.title}</h3>
                        <p className="text-sm text-dark-text-secondary truncate">
                          {item.track ? content.artist : 'Подкаст'}
                        </p>
                        <div className="mt-2">
                          <ProgressBar progress={progressPercent} />
                        </div>
                        <p className="text-xs text-dark-text-secondary mt-1">
                          {formatTime(item.progressSeconds)} / {formatTime(content.duration)} • {new Date(item.updatedAt).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </Link>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {canContinue ? (
                        <ContinueButton 
                          historyItem={item}
                          queue={item.track ? tracks || [] : []}
                          className="scale-90"
                        />
                      ) : (
                        <PlayButton 
                          item={content}
                          queue={item.track ? tracks || [] : []}
                          className="scale-90"
                        />
                      )}
                    </div>
                  </Card>
                )
              })}
          </div>
        </section>
      )}

      {/* Your Podcasts */}
      {podcasts && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Ваши подкасты</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {podcasts.slice(0, 20).map((podcast) => (
              <Link key={podcast.id} to={`/podcast/${podcast.id}`}>
                <Card className="group relative">
                  <div className="aspect-square rounded-card overflow-hidden mb-3 bg-dark-hover">
                    <img
                      src={podcast.coverUrl}
                      alt={podcast.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h3 className="font-semibold mb-1 truncate">{podcast.title}</h3>
                  <p className="text-sm text-dark-text-secondary truncate">
                    {podcast.author}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}


