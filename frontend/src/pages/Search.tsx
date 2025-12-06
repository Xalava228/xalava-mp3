import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { searchApi } from '../api/search'
import Card from '../components/Card'
import PlayButton from '../components/PlayButton'
import { Link } from 'react-router-dom'
import { Search as SearchIcon } from 'lucide-react'

export default function Search() {
  const [query, setQuery] = useState('')

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchApi.search(query),
    enabled: query.length > 0,
  })

  return (
    <div className="p-8 pb-32">
      <div className="mb-8">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-text-secondary" />
          <input
            type="text"
            placeholder="Что вы хотите послушать?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-dark-card border border-dark-border rounded-card text-white placeholder-dark-text-secondary focus:outline-none focus:border-white transition-colors"
          />
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-12 text-dark-text-secondary">
          Поиск...
        </div>
      )}

      {results && query && (
        <>
          {/* Tracks */}
          {results.tracks.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Треки</h2>
              <div className="space-y-2">
                {results.tracks.map((track) => (
                  <Card key={track.id} className="flex items-center gap-4">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{track.title}</h3>
                      <p className="text-sm text-dark-text-secondary truncate">
                        {track.artist}
                      </p>
                    </div>
                    <PlayButton item={track} queue={results.tracks} />
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Podcasts */}
          {results.podcasts.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Подкасты</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {results.podcasts.map((podcast) => (
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

          {/* Episodes */}
          {results.episodes.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4">Эпизоды</h2>
              <div className="space-y-2">
                {results.episodes.map((episode) => (
                  <Link key={episode.id} to={`/episode/${episode.id}`}>
                    <Card className="flex items-center gap-4">
                      <img
                        src={episode.coverUrl || '/placeholder.jpg'}
                        alt={episode.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{episode.title}</h3>
                        <p className="text-sm text-dark-text-secondary truncate">
                          Подкаст
                        </p>
                      </div>
                      <div onClick={(e) => e.preventDefault()}>
                        <PlayButton item={episode} queue={results.episodes} />
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.tracks.length === 0 && results.podcasts.length === 0 && results.episodes.length === 0 && (
            <div className="text-center py-12 text-dark-text-secondary">
              Ничего не найдено
            </div>
          )}
        </>
      )}

      {!query && (
        <div className="text-center py-12 text-dark-text-secondary">
          Введите запрос для поиска
        </div>
      )}
    </div>
  )
}


