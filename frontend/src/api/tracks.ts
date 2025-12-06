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
}


