import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { episodesApi } from '../api/episodes'
import { usePlayerStore } from '../store/playerStore'
import { Play, Pause, ArrowLeft, Clock, Mic2 } from 'lucide-react'
import FavoriteButton from '../components/FavoriteButton'

export default function Episode() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { play, currentTrack, isPlaying, togglePlay, setQueue, setCurrentTrack } = usePlayerStore()

  const { data: episode, isLoading } = useQuery({
    queryKey: ['episode', id],
    queryFn: () => episodesApi.getById(id!),
    enabled: !!id,
  })

  const handlePlay = () => {
    if (!episode) return
    if (currentTrack?.id === episode.id) {
      togglePlay()
    } else {
      setQueue([episode], 0)
      setCurrentTrack(episode)
      play()
    }
  }

  if (isLoading) {
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

  if (!episode) {
    return (
      <div className="p-6 pb-28 max-w-4xl mx-auto">
        <div className="text-center py-20">
          <p className="text-dark-text-secondary">Эпизод не найден</p>
        </div>
      </div>
    )
  }

  const isCurrentlyPlaying = currentTrack?.id === episode.id && isPlaying

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

      {/* Episode Header */}
      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        <div className="relative w-48 h-48 flex-shrink-0 mx-auto sm:mx-0">
          <div className="w-full h-full rounded-2xl bg-gradient-to-br from-blue-500/30 to-purple-600/30 flex items-center justify-center shadow-lg">
            <Mic2 className="w-16 h-16 text-blue-400" />
          </div>
        </div>
        <div className="flex-1 text-center sm:text-left">
          <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full mb-3">
            Эпизод подкаста
          </span>
          <h1 className="text-2xl font-bold text-white mb-2">{episode.title}</h1>
          {episode.duration && (
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-dark-text-secondary text-sm mb-4">
              <Clock className="w-4 h-4" />
              <span>{Math.floor(episode.duration / 60)} минут</span>
            </div>
          )}
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <button
              onClick={handlePlay}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-accent hover:shadow-glow text-white font-semibold rounded-xl transition-all"
            >
              {isCurrentlyPlaying ? (
                <>
                  <Pause className="w-5 h-5 fill-white" />
                  Пауза
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-white" />
                  Слушать
                </>
              )}
            </button>
            <FavoriteButton episodeId={episode.id} className="!p-3 bg-dark-card rounded-xl" />
          </div>
        </div>
      </div>

      {/* Description */}
      {episode.description && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">Описание</h2>
          <div className="bg-dark-card rounded-xl p-5 border border-dark-border/30">
            <p className="text-dark-text-secondary text-sm leading-relaxed whitespace-pre-line">
              {episode.description}
            </p>
          </div>
        </section>
      )}
    </div>
  )
}
