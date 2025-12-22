import { apiClient } from './client'
import { Episode } from '../types'

export const episodesApi = {
  getById: async (id: string): Promise<Episode> => {
    const { data } = await apiClient.get(`/episodes/${id}`)
    return data
  },

  getByPodcastId: async (podcastId: string): Promise<Episode[]> => {
    const { data } = await apiClient.get(`/podcasts/${podcastId}/episodes`)
    return data
  },

  upload: async (payload: {
    podcastId: string
    title: string
    description?: string
    duration?: number
    audio: File
    cover?: File
  }): Promise<Episode> => {
    const formData = new FormData()
    formData.append('podcastId', payload.podcastId)
    formData.append('title', payload.title)
    if (payload.description !== undefined) formData.append('description', payload.description)
    if (payload.duration !== undefined) formData.append('duration', String(payload.duration))
    formData.append('audio', payload.audio)
    if (payload.cover) formData.append('cover', payload.cover)

    const { data } = await apiClient.post('/episodes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.episode
  },
}






