import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search as SearchIcon, X, Play, Music2, Mic2, ArrowUpDown } from 'lucide-react'
import { tracksApi } from '../api/tracks'
import { podcastsApi } from '../api/podcasts'
import { usePlayerStore } from '../store/playerStore'
import { useNavigate } from 'react-router-dom'
import FavoriteButton from '../components/FavoriteButton'

type SortOption = 'relevance' | 'title-asc' | 'title-desc' | 'artist-asc' | 'artist-desc'

export default function Search() {
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'tracks' | 'podcasts'>('all')
  const [sortBy, setSortBy] = useState<SortOption>('relevance')
  const navigate = useNavigate()
  const { play, currentTrack, isPlaying, togglePlay, setQueue } = usePlayerStore()

  const { data: tracks } = useQuery({
    queryKey: ['tracks'],
    queryFn: tracksApi.getAll,
  })

  const { data: podcasts } = useQuery({
    queryKey: ['podcasts'],
    queryFn: podcastsApi.getAll,
  })

  const filteredTracks = useMemo(() => {
    if (!tracks) return []
    let filtered = tracks.filter(
      (track) =>
        track.title.toLowerCase().includes(query.toLowerCase()) ||
        track.artist.toLowerCase().includes(query.toLowerCase())
    )

    // Сортировка
    if (sortBy === 'title-asc') {
      filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title))
    } else if (sortBy === 'title-desc') {
      filtered = [...filtered].sort((a, b) => b.title.localeCompare(a.title))
    } else if (sortBy === 'artist-asc') {
      filtered = [...filtered].sort((a, b) => a.artist.localeCompare(b.artist))
    } else if (sortBy === 'artist-desc') {
      filtered = [...filtered].sort((a, b) => b.artist.localeCompare(a.artist))
    }

    return filtered
  }, [tracks, query, sortBy])

  const filteredPodcasts = useMemo(() => {
    if (!podcasts) return []
    let filtered = podcasts.filter(
      (podcast) =>
        podcast.title.toLowerCase().includes(query.toLowerCase()) ||
        podcast.author.toLowerCase().includes(query.toLowerCase())
    )

    // Сортировка
    if (sortBy === 'title-asc') {
      filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title))
    } else if (sortBy === 'title-desc') {
      filtered = [...filtered].sort((a, b) => b.title.localeCompare(a.title))
    } else if (sortBy === 'artist-asc') {
      filtered = [...filtered].sort((a, b) => a.author.localeCompare(b.author))
    } else if (sortBy === 'artist-desc') {
      filtered = [...filtered].sort((a, b) => b.author.localeCompare(a.author))
    }

    return filtered
  }, [podcasts, query, sortBy])

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

  const tabs = [
    { id: 'all', label: 'Все' },
    { id: 'tracks', label: 'Треки' },
    { id: 'podcasts', label: 'Подкасты' },
  ]

  return (
    <div className="p-6 pb-28 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Поиск</h1>
        <p className="text-dark-text-secondary text-sm">Найдите любимую музыку и подкасты</p>
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Что хотите послушать?"
          className="w-full pl-12 pr-12 py-4 bg-dark-card border border-dark-border rounded-2xl text-white placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-dark-accent focus:border-transparent transition-all text-sm"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-dark-text-muted hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Tabs and Sort */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-accent text-white shadow-glow'
                  : 'bg-dark-card text-dark-text-secondary hover:text-white hover:bg-dark-hover'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {query && (filteredTracks.length > 0 || filteredPodcasts.length > 0) && (
          <div className="relative">
            <button
              onClick={() => {
                const options: SortOption[] = ['relevance', 'title-asc', 'title-desc', 'artist-asc', 'artist-desc']
                const currentIndex = options.indexOf(sortBy)
                setSortBy(options[(currentIndex + 1) % options.length])
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-dark-card text-dark-text-secondary hover:text-white hover:bg-dark-hover transition-all"
              title="Сортировка"
            >
              <ArrowUpDown className="w-4 h-4" />
              <span className="hidden sm:inline">
                {sortBy === 'relevance' && 'По релевантности'}
                {sortBy === 'title-asc' && 'Название А-Я'}
                {sortBy === 'title-desc' && 'Название Я-А'}
                {sortBy === 'artist-asc' && 'Исполнитель А-Я'}
                {sortBy === 'artist-desc' && 'Исполнитель Я-А'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {query ? (
        <div className="space-y-8">
          {/* Tracks */}
          {(activeTab === 'all' || activeTab === 'tracks') && filteredTracks && filteredTracks.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Music2 className="w-5 h-5 text-dark-accent" />
                <h2 className="text-lg font-semibold text-white">Треки</h2>
                <span className="text-dark-text-muted text-sm">({filteredTracks.length})</span>
              </div>
              <div className="space-y-2">
                {filteredTracks.map((track) => (
                  <div
                    key={track.id}
                    onClick={() => handlePlayTrack(track, filteredTracks)}
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

          {/* Podcasts */}
          {(activeTab === 'all' || activeTab === 'podcasts') && filteredPodcasts && filteredPodcasts.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Mic2 className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-white">Подкасты</h2>
                <span className="text-dark-text-muted text-sm">({filteredPodcasts.length})</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {filteredPodcasts.map((podcast) => (
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
                          <span className="text-3xl">🎙️</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-white truncate text-sm">{podcast.title}</h3>
                    <p className="text-dark-text-secondary text-xs truncate mt-0.5">{podcast.author}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* No results */}
          {(activeTab === 'all' && (!filteredTracks?.length && !filteredPodcasts?.length)) ||
          (activeTab === 'tracks' && !filteredTracks?.length) ||
          (activeTab === 'podcasts' && !filteredPodcasts?.length) ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-dark-card mx-auto mb-4 flex items-center justify-center">
                <SearchIcon className="w-8 h-8 text-dark-text-muted" />
              </div>
              <p className="text-dark-text-secondary">По запросу "{query}" ничего не найдено</p>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-gradient-accent/10 mx-auto mb-4 flex items-center justify-center">
            <SearchIcon className="w-8 h-8 text-dark-accent" />
          </div>
          <p className="text-dark-text-secondary">Начните вводить для поиска</p>
        </div>
      )}
    </div>
  )
}
