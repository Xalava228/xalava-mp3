import { useAuthStore } from '../store/authStore'
import { useQuery } from '@tanstack/react-query'
import { tracksApi } from '../api/tracks'
import { playerApi } from '../api/player'
import Card from '../components/Card'
import { LogOut, User, Music, Clock } from 'lucide-react'
import { formatTime } from '../utils/formatTime'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const { data: tracks } = useQuery({
    queryKey: ['tracks'],
    queryFn: tracksApi.getAll,
  })

  const { data: history } = useQuery({
    queryKey: ['history'],
    queryFn: playerApi.getHistory,
    enabled: !!user,
  })

  const userTracks = tracks?.filter(track => 
    track.title.toLowerCase().includes(user?.name?.toLowerCase() || '') ||
    track.artist.toLowerCase().includes(user?.name?.toLowerCase() || '')
  ) || []

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
    <div className="p-8 pb-32">
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
            <div>
              <h2 className="text-2xl font-bold mb-2">{user.name}</h2>
              <p className="text-dark-text-secondary">{user.email}</p>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <Music className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{userTracks.length}</p>
                <p className="text-sm text-dark-text-secondary">Загружено треков</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{history?.length || 0}</p>
                <p className="text-sm text-dark-text-secondary">В истории</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Music className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{tracks?.length || 0}</p>
                <p className="text-sm text-dark-text-secondary">Всего треков</p>
              </div>
            </div>
          </Card>
        </div>

        {/* My Tracks */}
        {userTracks.length > 0 && (
          <section className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Мои треки</h2>
            <div className="space-y-2">
              {userTracks.map((track) => (
                <Card key={track.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{track.title}</h3>
                      <p className="text-sm text-dark-text-secondary">{track.artist}</p>
                    </div>
                    <p className="text-sm text-dark-text-secondary">
                      {formatTime(track.duration)}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Listening History */}
        {history && history.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">История прослушиваний</h2>
            <div className="space-y-2">
              {history.slice(0, 10).map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-dark-hover flex items-center justify-center">
                      <Music className="w-8 h-8 text-dark-text-secondary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Эпизод</h3>
                      <p className="text-sm text-dark-text-secondary">
                        Прогресс: {formatTime(item.progressSeconds)}
                      </p>
                    </div>
                    <p className="text-xs text-dark-text-secondary">
                      {new Date(item.updatedAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

