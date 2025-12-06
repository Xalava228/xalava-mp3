import { apiClient } from './client'
import { Podcast, Episode } from '../types'

export const podcastsApi = {
  getAll: async (): Promise<Podcast[]> => {
    const { data } = await apiClient.get('/podcasts')
    return data
  },

  getById: async (id: string): Promise<Podcast> => {
    const { data } = await apiClient.get(`/podcasts/${id}`)
    return data
  },

  getEpisodes: async (podcastId: string): Promise<Episode[]> => {
    const { data } = await apiClient.get(`/podcasts/${podcastId}/episodes`)
    return data
  },

  getEpisode: async (episodeId: string): Promise<Episode> => {
    const { data } = await apiClient.get(`/episodes/${episodeId}`)
    return data
  },
}


