import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import { favoritesApi } from '../api/favorites'

interface FavoriteButtonProps {
  trackId?: string
  episodeId?: string
  podcastId?: string
  className?: string
}

export default function FavoriteButton({ trackId, episodeId, podcastId, className = '' }: FavoriteButtonProps) {
  const { user, openLoginModal } = useAuthStore()
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)

  const { data: checkData, refetch: refetchCheck } = useQuery({
    queryKey: ['favorite-check', trackId, episodeId, podcastId],
    queryFn: () => favoritesApi.check(trackId, episodeId, podcastId),
    enabled: !!user && (!!trackId || !!episodeId || !!podcastId),
    retry: 1,
  })

  const [isFavorited, setIsFavorited] = useState(checkData?.isFavorited || false)
  const [favoriteId, setFavoriteId] = useState(checkData?.favoriteId)

  useEffect(() => {
    if (checkData) {
      setIsFavorited(checkData.isFavorited)
      setFavoriteId(checkData.favoriteId)
    }
  }, [checkData])

  if (!user) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          openLoginModal('login')
        }}
        className={`p-2 rounded-full transition-all duration-200 hover:scale-110 text-dark-text-muted hover:text-dark-accent cursor-pointer ${className}`}
        title="Войдите, чтобы добавить в избранное"
        type="button"
      >
        <Heart className="w-5 h-5" />
      </button>
    )
  }

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (loading) return
    if (!trackId && !episodeId && !podcastId) return

    setLoading(true)

    try {
      if (isFavorited && favoriteId) {
        await favoritesApi.remove(favoriteId)
        setIsFavorited(false)
        setFavoriteId(undefined)
      } else {
        const fav = await favoritesApi.add(trackId, episodeId, podcastId)
        if (fav && fav.id) {
          setIsFavorited(true)
          setFavoriteId(fav.id)
        }
      }
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
      queryClient.invalidateQueries({ queryKey: ['favorite-check', trackId, episodeId, podcastId] })
      await refetchCheck()
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${className} ${
        isFavorited
          ? 'text-dark-accent'
          : 'text-dark-text-muted hover:text-dark-accent'
      } ${loading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
      disabled={loading}
      title={isFavorited ? 'Удалить из избранного' : 'Добавить в избранное'}
      type="button"
    >
      <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
    </button>
  )
}
