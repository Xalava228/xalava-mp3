import { apiClient } from './client'
import { SearchResults } from '../types'

export const searchApi = {
  search: async (query: string): Promise<SearchResults> => {
    const { data } = await apiClient.get('/search', { params: { q: query } })
    return data
  },
}


