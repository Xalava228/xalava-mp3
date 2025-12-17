import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import { favoritesApi } from '../api/favorites'
import { usePlayerStore } from '../store/playerStore'
import { Play, Heart, LogIn } from 'lucide-react'
import FavoriteButton from '../components/FavoriteButton'

export default function Library() {
  const { user, openLoginModal } = useAuthStore()
  const { play, currentTrack, isPlaying, togglePlay, setQueue } = usePlayerStore()

  const { data: favorites, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: favoritesApi.getAll,
    enabled: !!user,
  })

  const handlePlayTrack = (track: any, allTracks: any[]) => {
    if (currentTrack?.id === track.id) {
      togglePlay()
    } else {
      const queue = allTracks?.length ? allTracks : [track]
      const index = queue.findIndex((t) => t.id === track.id)
      setQueue(queue, index >= 0 ? index : 0)
      play()
    }
  }

  if (!user) {
    return (
      <div className="p-6 pb-28 max-w-4xl mx-auto">
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-gradient-accent/10 mx-auto mb-5 flex items-center justify-center">
            <Heart className="w-10 h-10 text-dark-accent" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Войдите в аккаунт</h2>
          <p className="text-dark-text-secondary mb-6 max-w-sm mx-auto">
            Чтобы видеть избранное, необходимо войти в аккаунт
          </p>
          <button
            onClick={() => openLoginModal('login')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-accent hover:shadow-glow text-white font-semibold rounded-xl transition-all"
          >
            <LogIn className="w-4 h-4" />
            Войти
          </button>
        </div>
      </div>
    )
  }

  // Получаем треки и эпизоды из избранного
  const favoriteTracks = favorites?.filter((f) => f.track)?.map((f) => f.track) || []
  const favoriteEpisodes = favorites?.filter((f) => f.episode)?.map((f) => f.episode) || []

  return (
    <div className="p-6 pb-28 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Избранное</h1>
            <p className="text-dark-text-secondary text-sm">Ваша коллекция</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-dark-card animate-pulse">
              <div className="w-12 h-12 rounded-lg bg-dark-hover" />
              <div className="flex-1">
                <div className="h-4 bg-dark-hover rounded w-1/3 mb-2" />
                <div className="h-3 bg-dark-hover rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : favoriteTracks.length === 0 && favoriteEpisodes.length === 0 ? (
        <div className="text-center py-16 bg-dark-card/50 rounded-2xl border border-dashed border-dark-border">
          <div className="w-16 h-16 rounded-2xl bg-dark-hover mx-auto mb-4 flex items-center justify-center">
            <Heart className="w-8 h-8 text-dark-text-muted" />
          </div>
          <p className="text-dark-text-secondary mb-1">У вас пока нет избранного</p>
          <p className="text-dark-text-muted text-sm">Нажмите на сердечко, чтобы добавить</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Tracks */}
          {favoriteTracks.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Треки</h2>
                <span className="text-dark-text-muted text-sm">{favoriteTracks.length}</span>
              </div>
              <div className="space-y-2">
                {favoriteTracks.map((track: any) => (
                  <div
                    key={track.id}
                    onClick={() => handlePlayTrack(track, favoriteTracks)}
                    className="group flex items-center gap-4 p-3 rounded-xl bg-dark-card hover:bg-dark-hover transition-all cursor-pointer border border-transparent hover:border-dark-border/50"
                  >
                    <div className="relative w-12 h-12 flex-shrink-0">
                      {track.coverUrl ? (
                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gradient-accent flex items-center justify-center">
                          <span className="text-lg">🎵</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        {currentTrack?.id === track.id && isPlaying ? (
                          <div className="flex items-center justify-center gap-0.5">
                            <span className="w-0.5 h-3 bg-white rounded-full animate-pulse" />
                            <span className="w-0.5 h-4 bg-white rounded-full animate-pulse delay-75" />
                            <span className="w-0.5 h-2 bg-white rounded-full animate-pulse delay-150" />
                          </div>
                        ) : (
                          <Play className="w-4 h-4 text-white fill-white" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate text-sm">{track.title}</p>
                      <p className="text-dark-text-secondary text-xs truncate">{track.artist}</p>
                    </div>
                    <FavoriteButton trackId={track.id} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Episodes */}
          {favoriteEpisodes.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Эпизоды</h2>
                <span className="text-dark-text-muted text-sm">{favoriteEpisodes.length}</span>
              </div>
              <div className="space-y-2">
                {favoriteEpisodes.map((episode: any) => (
                  <div
                    key={episode.id}
                    className="group flex items-center gap-4 p-3 rounded-xl bg-dark-card hover:bg-dark-hover transition-all cursor-pointer border border-transparent hover:border-dark-border/50"
                  >
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/30 to-purple-600/30 flex items-center justify-center">
                        <span className="text-lg">🎙️</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate text-sm">{episode.title}</p>
                      <p className="text-dark-text-secondary text-xs truncate">{episode.podcastTitle || 'Подкаст'}</p>
                    </div>
                    <FavoriteButton episodeId={episode.id} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
