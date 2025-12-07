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
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)

  // Проверяем статус избранного
  const { data: checkData } = useQuery({
    queryKey: ['favorite-check', trackId, episodeId, podcastId],
    queryFn: () => favoritesApi.check(trackId, episodeId, podcastId),
    enabled: !!user && (!!trackId || !!episodeId || !!podcastId),
  })

  const [isFavorited, setIsFavorited] = useState(checkData?.isFavorited || false)
  const [favoriteId, setFavoriteId] = useState(checkData?.favoriteId)

  useEffect(() => {
    if (checkData) {
      setIsFavorited(checkData.isFavorited)
      setFavoriteId(checkData.favoriteId)
    }
  }, [checkData])

  if (!user) return null

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    
    if (loading) return

    setLoading(true)
    try {
      if (isFavorited && favoriteId) {
        await favoritesApi.remove(favoriteId)
        setIsFavorited(false)
        setFavoriteId(undefined)
      } else {
        const fav = await favoritesApi.add(trackId, episodeId, podcastId)
        setIsFavorited(true)
        setFavoriteId(fav.id)
      }
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
      queryClient.invalidateQueries({ queryKey: ['favorite-check', trackId, episodeId, podcastId] })
    } catch (error) {
      console.error('Ошибка при изменении избранного:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${className} ${
        isFavorited 
          ? 'text-red-500 fill-red-500' 
          : 'text-dark-text-secondary hover:text-red-500'
      }`}
      disabled={loading}
      title={isFavorited ? 'Удалить из избранного' : 'Добавить в избранное'}
    >
      <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
    </button>
  )
}

