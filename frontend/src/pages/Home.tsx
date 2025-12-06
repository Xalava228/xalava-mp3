import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import { usePlayerStore } from '../store/playerStore'
import { recommendationsApi } from '../api/recommendations'
import { podcastsApi } from '../api/podcasts'
import { tracksApi } from '../api/tracks'
import { playerApi } from '../api/player'
import Card from '../components/Card'
import PlayButton from '../components/PlayButton'
import ProgressBar from '../components/ProgressBar'
import { formatTime } from '../utils/formatTime'
import { Link } from 'react-router-dom'
import { Play, Pause } from 'lucide-react'

export default function Home() {
  const { user } = useAuthStore()
  const { 
    currentTrack, 
    isPlaying, 
    currentTime, 
    duration, 
    togglePlay, 
    seek 
  } = usePlayerStore()

  const { data: recommendations } = useQuery({
    queryKey: ['recommendations'],
    queryFn: recommendationsApi.getForYou,
  })

  const { data: tracks } = useQuery({
    queryKey: ['tracks'],
    queryFn: tracksApi.getAll,
  })

  const { data: podcasts } = useQuery({
    queryKey: ['podcasts'],
    queryFn: podcastsApi.getAll,
  })

  const { data: history } = useQuery({
    queryKey: ['history'],
    queryFn: playerApi.getHistory,
    enabled: !!user,
  })

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Доброе утро'
    if (hour < 18) return 'Добрый день'
    return 'Добрый вечер'
  }

  return (
    <div className="p-8 pb-32">
      <h1 className="text-3xl font-bold mb-8">
        {greeting()}, {user?.name || 'Гость'}
      </h1>

      {/* Now Playing */}
      {currentTrack ? (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Сейчас в эфире</h2>
          <Card className="p-6">
            <div className="flex items-center gap-6">
              <img
                src={('coverUrl' in currentTrack && currentTrack.coverUrl) ? currentTrack.coverUrl : '/placeholder.jpg'}
                alt={currentTrack.title}
                className="w-32 h-32 rounded-card object-cover"
              />
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">
                  {currentTrack.title}
                </h3>
                <p className="text-dark-text-secondary mb-4">
                  {'artist' in currentTrack ? currentTrack.artist : 'podcastId' in currentTrack ? 'Подкаст' : 'Автор'}
                </p>
                <div className="mb-4">
                  <div 
                    className="h-1 bg-dark-border rounded-full cursor-pointer mb-2 group relative"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const x = e.clientX - rect.left
                      const percent = Math.max(0, Math.min(1, x / rect.width))
                      if (duration > 0) {
                        seek(percent * duration)
                      }
                    }}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-dark-accent to-dark-accent-secondary rounded-full transition-all"
                      style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                    />
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-dark-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg"
                      style={{ left: `calc(${duration > 0 ? (currentTime / duration) * 100 : 0}% - 6px)` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-dark-text-secondary">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
                <button
                  onClick={togglePlay}
                  className="p-3 bg-gradient-to-r from-dark-accent to-dark-accent-secondary hover:from-dark-accent-secondary hover:to-dark-accent rounded-full shadow-lg hover:shadow-xl hover:shadow-dark-accent/50 transition-all duration-300 hover:scale-110"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white fill-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white fill-white" />
                  )}
                </button>
              </div>
            </div>
          </Card>
        </section>
      ) : tracks && tracks.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Сейчас в эфире</h2>
          <Card className="p-6">
            <div className="flex items-center gap-6">
              <img
                src={tracks[0].coverUrl}
                alt={tracks[0].title}
                className="w-32 h-32 rounded-card object-cover"
              />
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">
                  {tracks[0].title}
                </h3>
                <p className="text-dark-text-secondary mb-4">
                  {tracks[0].artist}
                </p>
                <div className="mb-4">
                  <ProgressBar progress={0} className="mb-2" />
                  <div className="flex justify-between text-sm text-dark-text-secondary">
                    <span>{formatTime(0)}</span>
                    <span>{formatTime(tracks[0].duration)}</span>
                  </div>
                </div>
                <PlayButton item={tracks[0]} queue={tracks} />
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* Continue Listening */}
      {history && history.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Продолжить</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {history.slice(0, 5).map((item) => (
              <Card key={item.id} className="group relative">
                <div className="aspect-square rounded-card overflow-hidden mb-3 bg-dark-hover">
                  <img
                    src="/placeholder.jpg"
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold mb-1 truncate">Эпизод</h3>
                <p className="text-sm text-dark-text-secondary mb-2 truncate">
                  Подкаст
                </p>
                <ProgressBar progress={(item.progressSeconds / 3600) * 100} />
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* For You Today - Tracks */}
      {recommendations && recommendations.tracks && recommendations.tracks.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Для вас сегодня</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {recommendations.tracks.slice(0, 10).map((track) => (
              <Card key={track.id} className="group relative">
                <div className="aspect-square rounded-card overflow-hidden mb-3 bg-dark-hover">
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <PlayButton item={track} queue={recommendations.tracks} className="scale-75" />
                  </div>
                </div>
                <h3 className="font-semibold mb-1 truncate">{track.title}</h3>
                <p className="text-sm text-dark-text-secondary truncate">
                  {track.artist}
                </p>
                <p className="text-xs text-dark-text-secondary mt-1">
                  {formatTime(track.duration)}
                </p>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* For You Today - Podcasts (fallback) */}
      {recommendations && (!recommendations.tracks || recommendations.tracks.length === 0) && recommendations.podcasts && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Для вас сегодня</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {recommendations.podcasts.slice(0, 10).map((podcast) => (
              <Link key={podcast.id} to={`/podcast/${podcast.id}`}>
                <Card className="group relative">
                  <div className="aspect-square rounded-card overflow-hidden mb-3 bg-dark-hover">
                    <img
                      src={podcast.coverUrl}
                      alt={podcast.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      {recommendations.episodes[0] && (
                        <PlayButton item={recommendations.episodes[0]} className="scale-75" />
                      )}
                    </div>
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

      {/* Popular Tracks */}
      {tracks && tracks.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Популярные треки</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {tracks.slice(0, 10).map((track) => (
              <Card key={track.id} className="group relative">
                <div className="aspect-square rounded-card overflow-hidden mb-3 bg-dark-hover">
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <PlayButton item={track} queue={tracks} className="scale-75" />
                  </div>
                </div>
                <h3 className="font-semibold mb-1 truncate">{track.title}</h3>
                <p className="text-sm text-dark-text-secondary truncate">
                  {track.artist}
                </p>
                <p className="text-xs text-dark-text-secondary mt-1">
                  {formatTime(track.duration)}
                </p>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Popular Podcasts */}
      {podcasts && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Популярные подкасты</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {podcasts.slice(0, 10).map((podcast) => (
              <Link key={podcast.id} to={`/podcast/${podcast.id}`}>
                <Card className="group relative">
                  <div className="aspect-square rounded-card overflow-hidden mb-3 bg-dark-hover">
                    <img
                      src={podcast.coverUrl}
                      alt={podcast.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      {recommendations?.episodes?.[0] && (
                        <PlayButton item={recommendations.episodes[0]} className="scale-75" />
                      )}
                    </div>
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

