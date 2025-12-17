import { apiClient } from './client'
import { ListeningHistory } from '../types'

export const playerApi = {
  saveProgress: async (
    episodeId: string | null,
    trackId: string | null,
    progressSeconds: number
  ): Promise<ListeningHistory> => {
    const { data } = await apiClient.post('/player/progress', {
      episodeId,
      trackId,
      progressSeconds,
    })
    return data
  },

  getHistory: async (): Promise<ListeningHistory[]> => {
    const { data } = await apiClient.get('/player/history')
    return data
  },
}


