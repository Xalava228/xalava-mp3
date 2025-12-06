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
  coverUrl: string
  audioUrl: string
  duration: number
  createdAt: string
}

export interface ListeningHistory {
  id: string
  userId: string
  episodeId?: string
  trackId?: string
  progressSeconds: number
  updatedAt: string
}

