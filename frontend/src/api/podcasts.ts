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

  update: async (id: string, updates: { title?: string; description?: string; author?: string; genres?: string; cover?: File }): Promise<Podcast> => {
    const formData = new FormData()
    if (updates.title) formData.append('title', updates.title)
    if (updates.description !== undefined) formData.append('description', updates.description)
    if (updates.author) formData.append('author', updates.author)
    if (updates.genres) formData.append('genres', updates.genres)
    if (updates.cover) formData.append('cover', updates.cover)

    const { data } = await apiClient.put(`/podcasts/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return data.podcast
  },
}


