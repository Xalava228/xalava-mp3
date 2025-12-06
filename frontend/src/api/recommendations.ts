import { apiClient } from './client'
import { Episode, Track, Podcast } from '../types'

export const recommendationsApi = {
  getForYou: async (): Promise<{
    episodes: Episode[]
    tracks: Track[]
    podcasts: Podcast[]
  }> => {
    const { data } = await apiClient.get('/recommendations')
    return data
  },
}


