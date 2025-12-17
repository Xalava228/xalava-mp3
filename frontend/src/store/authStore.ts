import { create } from 'zustand'
import { User } from '../types'
import { usePlayerStore } from './playerStore'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  showLoginModal: boolean
  loginModalMode: 'login' | 'register'

  setAuth: (user: User, token: string) => void
  logout: () => void
  init: () => void
  openLoginModal: (mode?: 'login' | 'register') => void
  closeLoginModal: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  showLoginModal: false,
  loginModalMode: 'login',

  setAuth: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', token)
    set({ user, token, isAuthenticated: true, showLoginModal: false })
  },

  logout: () => {
    // Останавливаем воспроизведение при выходе
    usePlayerStore.getState().stop()
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    set({ user: null, token: null, isAuthenticated: false })
  },

  init: () => {
    const userStr = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (userStr && token) {
      try {
        const user = JSON.parse(userStr)
        set({ user, token, isAuthenticated: true })
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }
  },

  openLoginModal: (mode = 'login') => {
    set({ showLoginModal: true, loginModalMode: mode })
  },

  closeLoginModal: () => {
    set({ showLoginModal: false })
  },
}))


