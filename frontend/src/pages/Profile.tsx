import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  LogOut,
  Gauge,
  History,
  Heart,
  Music2,
  Mic2,
  Play,
  Pause,
  Plus,
  Pencil,
  Clock,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { tracksApi } from '../api/tracks'
import { podcastsApi } from '../api/podcasts'
import { favoritesApi } from '../api/favorites'
import { playerApi } from '../api/player'
import { usePlayerStore } from '../store/playerStore'
import UploadModal from '../components/UploadModal'
import EditModal from '../components/EditModal'
import { Episode, Track, Podcast } from '../types'

export default function Profile() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [uploadType, setUploadType] = useState<'track' | 'podcast'>('track')
  const [editItem, setEditItem] = useState<Track | Podcast | null>(null)
  const [editType, setEditType] = useState<'track' | 'podcast'>('track')

  const { play, togglePlay, currentTrack, isPlaying, setQueue, setCurrentTrack } = usePlayerStore()

  const { data: tracks = [] } = useQuery({
    queryKey: ['tracks'],
    queryFn: tracksApi.getAll,
  })

  const { data: podcasts = [] } = useQuery({
    queryKey: ['podcasts'],
    queryFn: podcastsApi.getAll,
  })

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites'],
    queryFn: favoritesApi.getAll,
    enabled: !!user,
  })

  const { data: history = [] } = useQuery({
    queryKey: ['history'],
    queryFn: playerApi.getHistory,
    enabled: !!user,
  })

  if (!user) {
    return null
  }

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : 'Недавно'

  const myTracks = useMemo(() => tracks.filter((t) => t.uploadedBy === user.id), [tracks, user.id])
  const myPodcasts = useMemo(() => podcasts.filter((p) => p.uploadedBy === user.id), [podcasts, user.id])

  const metrics = [
    { label: 'Мой контент', value: myTracks.length + myPodcasts.length, icon: Gauge },
    { label: 'В истории', value: history.length, icon: History },
    { label: 'В избранном', value: favorites.length, icon: Heart },
    { label: 'Всего треков', value: tracks.length, icon: Music2 },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handlePlayTrack = (track: Track, allTracks: Track[]) => {
    if (currentTrack?.id === track.id) {
      togglePlay()
    } else {
      const queue = allTracks?.length ? allTracks : [track]
      const index = queue.findIndex((t) => t.id === track.id)
      setQueue(queue, index >= 0 ? index : 0)
      play()
    }
  }

  const handlePlayEpisode = (episode: Episode) => {
    if (currentTrack?.id === episode.id) {
      togglePlay()
    } else {
      setCurrentTrack(episode)
      setQueue([episode], 0)
      play()
    }
  }

  const openEdit = (item: Track | Podcast, type: 'track' | 'podcast') => {
    setEditItem(item)
    setEditType(type)
  }

  return (
    <div className="p-6 pb-28 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="glass border border-dark-border/40 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-accent flex items-center justify-center shadow-glow">
              <span className="text-2xl font-bold text-white">{user.name?.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Личный кабинет</h1>
              <p className="text-dark-text-secondary text-sm">{user.email}</p>
              <p className="text-dark-text-muted text-xs">С нами с {memberSince}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 transition-all text-sm"
          >
            <LogOut className="w-4 h-4" />
            Выйти
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {metrics.map((m) => (
            <div key={m.label} className="glass border border-dark-border/40 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-dark-card flex items-center justify-center text-dark-accent">
                <m.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-dark-text-muted uppercase tracking-wider">{m.label}</p>
                <p className="text-lg font-bold text-white">{m.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* My tracks */}
      <section className="glass border border-dark-border/40 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Music2 className="w-5 h-5 text-dark-accent" />
            <h2 className="text-lg font-semibold text-white">Мои треки</h2>
            <span className="text-dark-text-muted text-sm">({myTracks.length})</span>
          </div>
          <button
            onClick={() => {
              setUploadType('track')
              setIsUploadModalOpen(true)
            }}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-accent text-white text-sm font-semibold shadow-glow hover:shadow-glow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Добавить
          </button>
        </div>

        {myTracks.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-dark-border rounded-xl bg-dark-card/40">
            <p className="text-dark-text-secondary">У вас пока нет треков</p>
          </div>
        ) : (
          <div className="space-y-2">
            {myTracks.map((track) => (
              <div
                key={track.id}
                onClick={() => handlePlayTrack(track, myTracks)}
                className="group flex items-center gap-4 p-3 rounded-xl bg-dark-card hover:bg-dark-hover transition-all cursor-pointer border border-transparent hover:border-dark-border/50"
              >
                <div className="relative w-12 h-12 flex-shrink-0">
                  {track.coverUrl ? (
                    <img src={track.coverUrl} alt={track.title} className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gradient-accent flex items-center justify-center">
                      <span className="text-lg">🎵</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate text-sm">{track.title}</p>
                  <p className="text-dark-text-secondary text-xs truncate">{track.artist}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      openEdit(track, 'track')
                    }}
                    className="p-2 text-dark-text-muted hover:text-white rounded-lg hover:bg-dark-hover transition-all"
                    title="Редактировать"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePlayTrack(track, myTracks)
                    }}
                    className="p-2 bg-dark-card rounded-lg text-white hover:text-dark-accent transition-colors"
                  >
                    {currentTrack?.id === track.id && isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                  {track.duration && (
                    <span className="text-dark-text-muted text-xs w-12 text-right">
                      {Math.floor(track.duration / 60)}:{String(Math.floor(track.duration % 60)).padStart(2, '0')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* My podcasts */}
      <section className="glass border border-dark-border/40 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Mic2 className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Мои подкасты</h2>
            <span className="text-dark-text-muted text-sm">({myPodcasts.length})</span>
          </div>
          <button
            onClick={() => {
              setUploadType('podcast')
              setIsUploadModalOpen(true)
            }}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-accent text-white text-sm font-semibold shadow-glow hover:shadow-glow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Добавить
          </button>
        </div>

        {myPodcasts.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-dark-border rounded-xl bg-dark-card/40">
            <p className="text-dark-text-secondary">У вас пока нет подкастов</p>
          </div>
        ) : (
          <div className="space-y-2">
            {myPodcasts.map((podcast) => (
              <div
                key={podcast.id}
                onClick={() => navigate(`/podcast/${podcast.id}`)}
                className="group flex items-center gap-4 p-3 rounded-xl bg-dark-card hover:bg-dark-hover transition-all cursor-pointer border border-transparent hover:border-dark-border/50"
              >
                <div className="relative w-12 h-12 flex-shrink-0">
                  {podcast.coverUrl ? (
                    <img src={podcast.coverUrl} alt={podcast.title} className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/30 to-purple-600/30 flex items-center justify-center">
                      <Mic2 className="w-5 h-5 text-blue-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate text-sm">{podcast.title}</p>
                  <p className="text-dark-text-secondary text-xs truncate">{podcast.author}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    openEdit(podcast, 'podcast')
                  }}
                  className="p-2 text-dark-text-muted hover:text-white rounded-lg hover:bg-dark-hover transition-all"
                  title="Редактировать"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* History */}
      <section className="glass border border-dark-border/40 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-dark-text-secondary" />
          <h2 className="text-lg font-semibold text-white">История прослушиваний</h2>
          <span className="text-dark-text-muted text-sm">({history.length})</span>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-dark-border rounded-xl bg-dark-card/40">
            <p className="text-dark-text-secondary">История пока пустая</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (item.track) handlePlayTrack(item.track as Track, tracks)
                  if (item.episode) handlePlayEpisode(item.episode as Episode)
                }}
                className="flex items-center gap-4 p-3 rounded-xl bg-dark-card hover:bg-dark-hover transition-all cursor-pointer border border-transparent hover:border-dark-border/50"
              >
                <div className="w-10 h-10 rounded-lg bg-dark-hover flex items-center justify-center text-dark-text-muted text-xs uppercase">
                  {item.track ? 'трек' : 'эп'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate text-sm">
                    {item.track ? item.track.title : item.episode?.title}
                  </p>
                  <p className="text-dark-text-secondary text-xs truncate">
                    {item.track ? item.track.artist : (item.episode as any)?.podcastTitle || 'Подкаст'}
                  </p>
                </div>
                <div className="text-dark-text-muted text-xs">
                  {Math.floor(item.progressSeconds / 60)}:{String(Math.floor(item.progressSeconds % 60)).padStart(2, '0')}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        initialType={uploadType}
      />

      <EditModal
        isOpen={!!editItem}
        onClose={() => setEditItem(null)}
        item={editItem}
        type={editType}
      />
    </div>
  )
}
