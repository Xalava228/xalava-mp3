export interface User {
  id: string
  email: string
  passwordHash: string
  name: string
  createdAt: string
}

export interface Podcast {
  id: string
  title: string
  description: string
  coverUrl: string
  author: string
  genres: string[]
  createdAt: string
  uploadedBy?: string // ID пользователя, который загрузил подкаст
}

export interface Episode {
  id: string
  podcastId: string
  title: string
  description?: string
  audioUrl: string
  duration: number
  coverUrl?: string
  publishedAt: string
  createdAt: string
}

export interface Track {
  id: string
  title: string
  artist: string
  description?: string
  coverUrl: string
  audioUrl: string
  duration: number
  createdAt: string
  uploadedBy?: string // ID пользователя, который загрузил трек
}

export interface ListeningHistory {
  id: string
  userId: string
  episodeId?: string
  trackId?: string
  progressSeconds: number
  updatedAt: string
  track?: Track
  episode?: Episode
}

export interface Favorite {
  id: string
  userId: string
  trackId?: string
  episodeId?: string
  podcastId?: string
  createdAt: string
}

