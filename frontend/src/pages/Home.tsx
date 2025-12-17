import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { podcastsApi } from '../api/podcasts'
import { tracksApi } from '../api/tracks'
import { Play, TrendingUp, Clock, Sparkles } from 'lucide-react'
import { usePlayerStore } from '../store/playerStore'
import FavoriteButton from '../components/FavoriteButton'

export default function Home() {
  const navigate = useNavigate()
  const { play, currentTrack, isPlaying, togglePlay, setQueue } = usePlayerStore()

  const { data: podcasts, isLoading: podcastsLoading } = useQuery({
    queryKey: ['podcasts'],
    queryFn: podcastsApi.getAll,
  })

  const { data: tracks, isLoading: tracksLoading } = useQuery({
    queryKey: ['tracks'],
    queryFn: tracksApi.getAll,
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

  return (
    <div className="p-6 pb-28 max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="mb-10">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark-accent/20 via-dark-card to-dark-card border border-dark-border/30 p-8 md:p-10">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-64 h-64 bg-dark-accent rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-dark-accent-secondary rounded-full blur-[80px] -translate-x-1/2 translate-y-1/2" />
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-dark-accent/20 rounded-full text-dark-accent text-xs font-medium mb-4">
              <Sparkles className="w-3 h-3" />
              Добро пожаловать
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Откройте для себя музыку
            </h1>
            <p className="text-dark-text-secondary max-w-lg">
              Слушайте любимые треки, открывайте новые подкасты и создавайте свою коллекцию
            </p>
          </div>
        </div>
      </section>

      {/* Popular Tracks */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Популярное</h2>
        </div>
        
        {tracksLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-dark-card rounded-xl p-4 animate-pulse">
                <div className="w-full aspect-square rounded-lg bg-dark-hover mb-3" />
                <div className="h-4 bg-dark-hover rounded w-3/4 mb-2" />
                <div className="h-3 bg-dark-hover rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : tracks?.length === 0 ? (
          <div className="text-center py-16 bg-dark-card/50 rounded-2xl border border-dashed border-dark-border">
            <p className="text-dark-text-muted">Пока нет треков</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tracks?.slice(0, 6).map((track) => (
              <div
                key={track.id}
                className="group bg-dark-card hover:bg-dark-hover rounded-xl p-4 transition-all hover-lift border border-transparent hover:border-dark-border/50 cursor-pointer"
                onClick={() => handlePlayTrack(track, tracks)}
              >
                <div className="relative mb-3">
                  {track.coverUrl ? (
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-dark-accent/30 to-dark-accent-secondary/30 flex items-center justify-center">
                      <span className="text-4xl">🎵</span>
                    </div>
                  )}
                  <button
                    className="absolute bottom-2 right-2 w-10 h-10 bg-gradient-accent rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-glow"
                  >
                    {currentTrack?.id === track.id && isPlaying ? (
                      <div className="flex items-center justify-center gap-0.5">
                        <span className="w-0.5 h-3 bg-white rounded-full animate-pulse" />
                        <span className="w-0.5 h-4 bg-white rounded-full animate-pulse delay-75" />
                        <span className="w-0.5 h-2 bg-white rounded-full animate-pulse delay-150" />
                      </div>
                    ) : (
                      <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                    )}
                  </button>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <FavoriteButton trackId={track.id} />
                  </div>
                </div>
                <h3 className="font-semibold text-white truncate text-sm">{track.title}</h3>
                <p className="text-dark-text-secondary text-xs truncate mt-0.5">{track.artist}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Podcasts */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Подкасты</h2>
        </div>

        {podcastsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-dark-card rounded-xl p-4 animate-pulse">
                <div className="w-full aspect-square rounded-lg bg-dark-hover mb-3" />
                <div className="h-4 bg-dark-hover rounded w-3/4 mb-2" />
                <div className="h-3 bg-dark-hover rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : podcasts?.length === 0 ? (
          <div className="text-center py-16 bg-dark-card/50 rounded-2xl border border-dashed border-dark-border">
            <p className="text-dark-text-muted">Пока нет подкастов</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {podcasts?.slice(0, 8).map((podcast) => (
              <div
                key={podcast.id}
                onClick={() => navigate(`/podcast/${podcast.id}`)}
                className="group bg-dark-card hover:bg-dark-hover rounded-xl p-4 transition-all hover-lift border border-transparent hover:border-dark-border/50 cursor-pointer"
              >
                <div className="relative mb-3">
                  {podcast.coverUrl ? (
                    <img
                      src={podcast.coverUrl}
                      alt={podcast.title}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-blue-500/30 to-purple-600/30 flex items-center justify-center">
                      <span className="text-4xl">🎙️</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                </div>
                <h3 className="font-semibold text-white truncate text-sm">{podcast.title}</h3>
                <p className="text-dark-text-secondary text-xs truncate mt-0.5">{podcast.author}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
