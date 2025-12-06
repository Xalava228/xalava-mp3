import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import { playerApi } from '../api/player'
import { podcastsApi } from '../api/podcasts'
import Card from '../components/Card'
import ProgressBar from '../components/ProgressBar'
import { Link } from 'react-router-dom'
import { formatTime } from '../utils/formatTime'

export default function Library() {
  const { user } = useAuthStore()

  const { data: history } = useQuery({
    queryKey: ['history'],
    queryFn: playerApi.getHistory,
    enabled: !!user,
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
    <div className="p-8 pb-32">
      <h1 className="text-3xl font-bold mb-8">Библиотека</h1>

      {/* Recently Played */}
      {history && history.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Недавно прослушано</h2>
          <div className="space-y-2">
            {history.map((item) => (
              <Card key={item.id} className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-dark-hover flex items-center justify-center">
                  <span className="text-2xl">🎵</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">Эпизод</h3>
                  <p className="text-sm text-dark-text-secondary truncate">
                    Подкаст
                  </p>
                  <div className="mt-2">
                    <ProgressBar progress={(item.progressSeconds / 3600) * 100} />
                  </div>
                </div>
                <div className="text-sm text-dark-text-secondary">
                  {formatTime(item.progressSeconds)}
                </div>
              </Card>
            ))}
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


