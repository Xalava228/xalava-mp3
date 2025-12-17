import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { podcastsApi } from '../api/podcasts'
import { episodesApi } from '../api/episodes'
import { usePlayerStore } from '../store/playerStore'
import { Play, Clock, ArrowLeft, Mic2 } from 'lucide-react'
import FavoriteButton from '../components/FavoriteButton'

export default function Podcast() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { play, currentTrack, isPlaying, togglePlay, setQueue, setCurrentTrack } = usePlayerStore()

  const { data: podcast, isLoading: podcastLoading } = useQuery({
    queryKey: ['podcast', id],
    queryFn: () => podcastsApi.getById(id!),
    enabled: !!id,
  })

  const { data: episodes, isLoading: episodesLoading } = useQuery({
    queryKey: ['podcast-episodes', id],
    queryFn: () => episodesApi.getByPodcastId(id!),
    enabled: !!id,
  })

  const handlePlayEpisode = (episode: any) => {
    if (currentTrack?.id === episode.id) {
      togglePlay()
    } else {
      const queue = episodes?.length ? episodes : [episode]
      const index = queue.findIndex((e) => e.id === episode.id)
      setQueue(queue, index >= 0 ? index : 0)
      setCurrentTrack(queue[index >= 0 ? index : 0])
      play()
    }
  }

  if (podcastLoading) {
    return (
      <div className="p-6 pb-28 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="flex gap-6 mb-8">
            <div className="w-48 h-48 bg-dark-card rounded-2xl" />
            <div className="flex-1">
              <div className="h-8 bg-dark-card rounded w-1/2 mb-4" />
              <div className="h-4 bg-dark-card rounded w-1/3 mb-2" />
              <div className="h-4 bg-dark-card rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!podcast) {
    return (
      <div className="p-6 pb-28 max-w-4xl mx-auto">
        <div className="text-center py-20">
          <p className="text-dark-text-secondary">Подкаст не найден</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 pb-28 max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-dark-text-secondary hover:text-white transition-colors mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Назад</span>
      </button>

      {/* Podcast Header */}
      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        <div className="relative w-48 h-48 flex-shrink-0 mx-auto sm:mx-0">
          {podcast.coverUrl ? (
            <img
              src={podcast.coverUrl}
              alt={podcast.title}
              className="w-full h-full rounded-2xl object-cover shadow-lg"
            />
          ) : (
            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-blue-500/30 to-purple-600/30 flex items-center justify-center">
              <Mic2 className="w-16 h-16 text-blue-400" />
            </div>
          )}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full mb-3">
            Подкаст
          </span>
          <h1 className="text-3xl font-bold text-white mb-2">{podcast.title}</h1>
          <p className="text-dark-text-secondary mb-4">{podcast.author}</p>
          {podcast.description && (
            <p className="text-dark-text-muted text-sm line-clamp-3">{podcast.description}</p>
          )}
          <div className="flex items-center justify-center sm:justify-start gap-3 mt-4">
            <FavoriteButton podcastId={podcast.id} className="!p-3 bg-dark-card rounded-xl" />
          </div>
        </div>
      </div>

      {/* Episodes */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Эпизоды</h2>
          {episodes && <span className="text-dark-text-muted text-sm">{episodes.length}</span>}
        </div>

        {episodesLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-dark-card rounded-xl animate-pulse">
                <div className="w-12 h-12 bg-dark-hover rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 bg-dark-hover rounded w-1/2 mb-2" />
                  <div className="h-3 bg-dark-hover rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : !episodes || episodes.length === 0 ? (
          <div className="text-center py-12 bg-dark-card/50 rounded-2xl border border-dashed border-dark-border">
            <p className="text-dark-text-muted">Пока нет эпизодов</p>
          </div>
        ) : (
          <div className="space-y-2">
            {episodes.map((episode: any, index: number) => (
              <div
                key={episode.id}
                onClick={() => handlePlayEpisode(episode)}
                className="group flex items-center gap-4 p-4 rounded-xl bg-dark-card hover:bg-dark-hover transition-all cursor-pointer border border-transparent hover:border-dark-border/50"
              >
                <div className="w-8 text-center">
                  <span className="text-dark-text-muted text-sm font-medium">{index + 1}</span>
                </div>
                <div className="relative w-12 h-12 flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/30 to-purple-600/30 flex items-center justify-center">
                    <Mic2 className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    {currentTrack?.id === episode.id && isPlaying ? (
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
                  <p className="font-medium text-white truncate text-sm">{episode.title}</p>
                  {episode.duration && (
                    <div className="flex items-center gap-1 text-dark-text-muted text-xs mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{Math.floor(episode.duration / 60)} мин</span>
                    </div>
                  )}
                </div>
                <FavoriteButton episodeId={episode.id} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
