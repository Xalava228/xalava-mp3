import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useQuery } from '@tanstack/react-query'
import { tracksApi } from '../api/tracks'
import { podcastsApi } from '../api/podcasts'
import { playerApi } from '../api/player'
import { favoritesApi } from '../api/favorites'
import Card from '../components/Card'
import EditModal from '../components/EditModal'
import UploadModal from '../components/UploadModal'
import PlayButton from '../components/PlayButton'
import { LogOut, User, Music, Clock, Edit, Upload, Heart, Mic, Plus } from 'lucide-react'
import { formatTime } from '../utils/formatTime'
import { useNavigate, Link } from 'react-router-dom'
import { Track, Podcast } from '../types'

export default function Profile() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Track | Podcast | null>(null)
  const [editType, setEditType] = useState<'track' | 'podcast'>('track')

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

  const { data: favorites } = useQuery({
    queryKey: ['favorites'],
    queryFn: favoritesApi.getAll,
    enabled: !!user,
  })

  const userTracks = tracks?.filter(track => 
    track.uploadedBy === user?.id
  ) || []

  const userPodcasts = podcasts?.filter(podcast => 
    podcast.uploadedBy === user?.id
  ) || []

  const handleEdit = (item: Track | Podcast, type: 'track' | 'podcast') => {
    setEditItem(item)
    setEditType(type)
    setEditModalOpen(true)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) {
    return (
      <div className="p-8">
        <Card className="p-6 text-center">
          <p className="text-dark-text-secondary">Пожалуйста, войдите в аккаунт</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-8 pb-32 max-md:p-4 max-md:pt-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Личный кабинет</h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-500 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <LogOut className="w-4 h-4" />
              <span>Выйти</span>
            </button>
          </div>
        </div>

        {/* User Info */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{user.name}</h2>
              <p className="text-dark-text-secondary">{user.email}</p>
            </div>
          </div>
        </Card>

        {/* Info Card */}
        {(userTracks.length > 0 || userPodcasts.length > 0) && (
          <Card className="p-4 mb-6 bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-start gap-3">
              <div className="text-blue-400 text-xl">ℹ️</div>
              <div>
                <h3 className="font-semibold mb-1 text-blue-400">Как редактировать контент</h3>
                <p className="text-sm text-dark-text-secondary">
                  В разделах "Мои треки" и "Мои подкасты" нажмите на иконку <Edit className="w-4 h-4 inline mx-1" /> рядом с нужным элементом. 
                  Вы сможете изменить название, описание, обложку и другие параметры.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-6 hover:bg-dark-hover transition-colors cursor-pointer" onClick={() => setUploadModalOpen(true)}>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
                <Upload className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-2xl font-bold">{userTracks.length + userPodcasts.length}</p>
              <p className="text-sm text-dark-text-secondary">Мой контент</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
                <Clock className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-2xl font-bold">{history?.length || 0}</p>
              <p className="text-sm text-dark-text-secondary">В истории</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-2">
                <Heart className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-2xl font-bold">{favorites?.length || 0}</p>
              <p className="text-sm text-dark-text-secondary">В избранном</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-2">
                <Music className="w-6 h-6 text-purple-500" />
              </div>
              <p className="text-2xl font-bold">{tracks?.length || 0}</p>
              <p className="text-sm text-dark-text-secondary">Всего треков</p>
            </div>
          </Card>
        </div>

        {/* My Tracks */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Music className="w-6 h-6" />
              Мои треки
              {userTracks.length > 0 && (
                <span className="text-sm font-normal text-dark-text-secondary">
                  ({userTracks.length})
                </span>
              )}
            </h2>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-dark-accent to-dark-accent-secondary hover:from-dark-accent-secondary hover:to-dark-accent text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-dark-accent/30 hover:scale-105 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить</span>
            </button>
          </div>
          {userTracks.length > 0 ? (
            <div className="space-y-2">
              {userTracks.map((track) => (
                <Card key={track.id} className="p-4 hover:bg-dark-hover transition-colors group">
                  <div className="flex items-center gap-4">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{track.title}</h3>
                      <p className="text-sm text-dark-text-secondary truncate">{track.artist}</p>
                      {track.description && (
                        <p className="text-xs text-dark-text-secondary mt-1 line-clamp-1">
                          {track.description}
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-dark-text-secondary hidden md:block">
                      {formatTime(track.duration)}
                    </p>
                    <div className="flex items-center gap-2">
                      <PlayButton item={track} queue={userTracks} className="scale-90" />
                      <button
                        onClick={() => handleEdit(track, 'track')}
                        className="p-2 bg-dark-surface hover:bg-dark-accent/20 border border-dark-border rounded-lg text-dark-text-secondary hover:text-white transition-all hover:scale-110"
                        title="Редактировать"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Music className="w-12 h-12 text-dark-text-secondary mx-auto mb-4" />
              <p className="text-dark-text-secondary mb-4">У вас пока нет загруженных треков</p>
              <button
                onClick={() => setUploadModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-dark-accent to-dark-accent-secondary hover:from-dark-accent-secondary hover:to-dark-accent text-white rounded-lg transition-all duration-300"
              >
                Загрузить первый трек
              </button>
            </Card>
          )}
        </section>

        {/* My Podcasts */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Mic className="w-6 h-6" />
              Мои подкасты
              {userPodcasts.length > 0 && (
                <span className="text-sm font-normal text-dark-text-secondary">
                  ({userPodcasts.length})
                </span>
              )}
            </h2>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-dark-accent to-dark-accent-secondary hover:from-dark-accent-secondary hover:to-dark-accent text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-dark-accent/30 hover:scale-105 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить</span>
            </button>
          </div>
          {userPodcasts.length > 0 ? (
            <div className="space-y-2">
              {userPodcasts.map((podcast) => (
                <Card key={podcast.id} className="p-4 hover:bg-dark-hover transition-colors group">
                  <div className="flex items-center gap-4">
                    <Link to={`/podcast/${podcast.id}`} className="flex-shrink-0">
                      <img
                        src={podcast.coverUrl}
                        alt={podcast.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/podcast/${podcast.id}`}>
                        <h3 className="font-semibold truncate hover:text-white transition-colors">
                          {podcast.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-dark-text-secondary truncate">{podcast.author}</p>
                      {podcast.description && (
                        <p className="text-xs text-dark-text-secondary mt-1 line-clamp-1">
                          {podcast.description}
                        </p>
                      )}
                      {podcast.genres && podcast.genres.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {podcast.genres.slice(0, 3).map((genre) => (
                            <span
                              key={genre}
                              className="px-2 py-0.5 bg-dark-surface rounded text-xs text-dark-text-secondary"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleEdit(podcast, 'podcast')}
                      className="p-2 bg-dark-surface hover:bg-dark-accent/20 border border-dark-border rounded-lg text-dark-text-secondary hover:text-white transition-all hover:scale-110"
                      title="Редактировать"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Mic className="w-12 h-12 text-dark-text-secondary mx-auto mb-4" />
              <p className="text-dark-text-secondary mb-4">У вас пока нет загруженных подкастов</p>
              <button
                onClick={() => setUploadModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-dark-accent to-dark-accent-secondary hover:from-dark-accent-secondary hover:to-dark-accent text-white rounded-lg transition-all duration-300"
              >
                Создать подкаст
              </button>
            </Card>
          )}
        </section>

        <EditModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false)
            setEditItem(null)
          }}
          item={editItem}
          type={editType}
        />

        {/* Listening History */}
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6" />
            История прослушиваний
            {history && history.length > 0 && (
              <span className="text-sm font-normal text-dark-text-secondary">
                ({history.length})
              </span>
            )}
          </h2>
          {history && history.length > 0 ? (
            <div className="space-y-2">
              {history
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .slice(0, 10)
                .map((item: any) => {
                  const content = item.track || item.episode
                  if (!content) return null

                  const progressPercent = content.duration > 0
                    ? (item.progressSeconds / content.duration) * 100
                    : 0

                  return (
                    <Card key={item.id} className="p-4 hover:bg-dark-hover transition-colors">
                      <div className="flex items-center gap-4">
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
                            <div className="h-1 bg-dark-border rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-dark-accent to-dark-accent-secondary"
                                style={{ width: `${Math.min(progressPercent, 100)}%` }}
                              />
                            </div>
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
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {item.track ? (
                            <PlayButton item={item.track} queue={tracks || []} className="scale-90" />
                          ) : (
                            <Link
                              to={`/episode/${item.episodeId}`}
                              className="p-2 bg-dark-surface hover:bg-dark-accent/20 border border-dark-border rounded-lg text-dark-text-secondary hover:text-white transition-all"
                            >
                              <Music className="w-5 h-5" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </Card>
                  )
                })}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Clock className="w-12 h-12 text-dark-text-secondary mx-auto mb-4" />
              <p className="text-dark-text-secondary">История прослушиваний пуста</p>
              <p className="text-sm text-dark-text-secondary mt-2">
                Начните слушать треки и подкасты, чтобы увидеть их здесь
              </p>
            </Card>
          )}
        </section>

        <UploadModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
        />
      </div>
    </div>
  )
}

