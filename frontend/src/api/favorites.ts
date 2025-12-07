import { apiClient } from './client'

export interface Favorite {
  id: string
  userId: string
  trackId?: string
  episodeId?: string
  podcastId?: string
  createdAt: string
  track?: any
  episode?: any
  podcast?: any
}

export const favoritesApi = {
  getAll: async (): Promise<Favorite[]> => {
    const { data } = await apiClient.get('/favorites')
    return data
  },

  add: async (trackId?: string, episodeId?: string, podcastId?: string): Promise<Favorite> => {
    const { data } = await apiClient.post('/favorites', {
      trackId,
      episodeId,
      podcastId,
    })
    return data
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/favorites/${id}`)
  },

  check: async (trackId?: string, episodeId?: string, podcastId?: string): Promise<{ isFavorited: boolean; favoriteId?: string }> => {
    const { data } = await apiClient.get('/favorites/check', {
      params: { trackId, episodeId, podcastId },
    })
    return data
  },
}

