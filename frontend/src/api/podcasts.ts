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

  create: async (payload: { title: string; author: string; description?: string; coverFile?: File }): Promise<Podcast> => {
    const formData = new FormData()
    formData.append('title', payload.title)
    formData.append('author', payload.author)
    if (payload.description !== undefined) formData.append('description', payload.description)
    if (payload.coverFile) formData.append('cover', payload.coverFile)

    const { data } = await apiClient.post('/podcasts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.podcast || data
  },
}


