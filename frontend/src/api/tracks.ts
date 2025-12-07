import { apiClient } from './client'
import { Track } from '../types'

export const tracksApi = {
  getAll: async (): Promise<Track[]> => {
    const { data } = await apiClient.get('/tracks')
    return data
  },

  getById: async (id: string): Promise<Track> => {
    const { data } = await apiClient.get(`/tracks/${id}`)
    return data
  },

  update: async (id: string, updates: { title?: string; artist?: string; description?: string; cover?: File; audio?: File }): Promise<Track> => {
    const formData = new FormData()
    // Всегда отправляем title и artist, так как они обязательны
    if (updates.title !== undefined) formData.append('title', updates.title)
    if (updates.artist !== undefined) formData.append('artist', updates.artist)
    // Description может быть пустой строкой, но мы отправляем её если она определена
    if (updates.description !== undefined) formData.append('description', updates.description)
    // Cover отправляем только если выбран новый файл
    if (updates.cover) formData.append('cover', updates.cover)
    // Audio отправляем только если выбран новый файл
    if (updates.audio) formData.append('audio', updates.audio)

    const { data } = await apiClient.put(`/tracks/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return data.track
  },
}


