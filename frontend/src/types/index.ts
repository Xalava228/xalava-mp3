export interface User {
  id: string
  email: string
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
  uploadedBy?: string
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
  createdAt?: string
}

export interface Track {
  id: string
  title: string
  artist: string
  description?: string
  coverUrl: string
  audioUrl: string
  duration: number
  createdAt?: string
  uploadedBy?: string
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

export interface Playlist {
  id: string
  userId: string
  name: string
  description?: string
  coverUrl?: string
  items: (Episode | Track)[]
  createdAt: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface SearchResults {
  tracks: Track[]
  podcasts: Podcast[]
  episodes: Episode[]
}

export interface Favorite {
  id: string
  userId: string
  trackId?: string
  episodeId?: string
  podcastId?: string
  createdAt: string
  track?: Track
  episode?: Episode
  podcast?: Podcast
}


