import { create } from 'zustand'
import { Episode, Track } from '../types'
import { playerApi } from '../api/player'

type RepeatMode = 'off' | 'all' | 'one'

interface PlayerState {
  currentTrack: Track | Episode | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  queue: (Track | Episode)[]
  currentIndex: number
  audioElement: HTMLAudioElement | null
  isNowPlayingOpen: boolean
  isShuffle: boolean
  repeatMode: RepeatMode
  playbackRate: number
  sleepTimerMinutes: number | null
  sleepTimerId: ReturnType<typeof setTimeout> | null

  setAudioElement: (element: HTMLAudioElement | null) => void
  setCurrentTrack: (track: Track | Episode | null, startTime?: number) => void
  play: () => void
  pause: () => void
  togglePlay: () => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setVolume: (volume: number) => void
  setQueue: (queue: (Track | Episode)[], index?: number) => void
  next: () => void
  previous: () => void
  seek: (time: number) => void
  saveProgress: () => void
  stop: () => void
  openNowPlaying: () => void
  closeNowPlaying: () => void
  toggleShuffle: () => void
  cycleRepeat: () => void
  setPlaybackRate: (rate: number) => void
  setSleepTimer: (minutes: number | null) => void
  clearSleepTimer: () => void
}

const loadSavedVolume = () => {
  if (typeof window === 'undefined') return 1
  const stored = parseFloat(localStorage.getItem('playerVolume') || '')
  if (Number.isNaN(stored)) return 1
  return Math.min(1, Math.max(0, stored))
}

const loadSavedShuffle = () => {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('playerShuffle') === 'true'
}

const loadSavedRepeat = (): RepeatMode => {
  if (typeof window === 'undefined') return 'off'
  const value = localStorage.getItem('playerRepeat') as RepeatMode | null
  return value === 'all' || value === 'one' ? value : 'off'
}

const loadSavedPlaybackRate = () => {
  if (typeof window === 'undefined') return 1
  const stored = parseFloat(localStorage.getItem('playerPlaybackRate') || '')
  if (Number.isNaN(stored)) return 1
  return Math.min(2, Math.max(0.5, stored))
}

export const usePlayerStore = create<PlayerState>((set, get) => {
  let progressInterval: ReturnType<typeof setInterval> | null = null
  const getRandomIndex = (length: number, currentIndex: number) => {
    if (length <= 1) return currentIndex
    let newIndex = currentIndex
    while (newIndex === currentIndex) {
      newIndex = Math.floor(Math.random() * length)
    }
    return newIndex
  }

  const playTrackAtIndex = (index: number) => {
    const { queue, audioElement } = get()
    const nextTrack = queue[index]
    if (!audioElement || !nextTrack) return

    // Останавливаем текущее воспроизведение
    audioElement.pause()
    stopProgressTracking()

    // Устанавливаем новый трек
    audioElement.src = nextTrack.audioUrl
    audioElement.load()

    // Обновляем состояние
    set({ 
      currentIndex: index,
      currentTrack: nextTrack, 
      currentTime: 0, 
      isPlaying: false, // Временно false
      duration: 0
    })

    const handleCanPlay = () => {
      audioElement.removeEventListener('canplay', handleCanPlay)
      audioElement.play().then(() => {
        set({ isPlaying: true })
        startProgressTracking()
      }).catch((error) => {
        console.error('Ошибка воспроизведения:', error)
        set({ isPlaying: false })
      })
    }

    if (audioElement.readyState >= 3) {
      audioElement.play().then(() => {
        set({ isPlaying: true })
        startProgressTracking()
      }).catch((error) => {
        console.error('Ошибка воспроизведения:', error)
        set({ isPlaying: false })
      })
    } else {
      audioElement.addEventListener('canplay', handleCanPlay, { once: true })
    }
  }

  const startProgressTracking = () => {
    if (progressInterval) clearInterval(progressInterval)
    progressInterval = setInterval(() => {
      const { audioElement, currentTrack, currentTime } = get()
      if (audioElement && currentTrack) {
        const newTime = audioElement.currentTime
        set({ currentTime: newTime })
        
        // Save progress every 5 seconds
        if (Math.floor(newTime) % 5 === 0 && Math.floor(newTime) !== Math.floor(currentTime)) {
          get().saveProgress()
        }
      }
    }, 1000)
  }

  const stopProgressTracking = () => {
    if (progressInterval) {
      clearInterval(progressInterval)
      progressInterval = null
    }
  }

  return {
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: loadSavedVolume(),
    queue: [],
    currentIndex: 0,
    audioElement: null,
    isNowPlayingOpen: false,
    isShuffle: loadSavedShuffle(),
    repeatMode: loadSavedRepeat(),
    playbackRate: loadSavedPlaybackRate(),
    sleepTimerMinutes: null,
    sleepTimerId: null,

    setAudioElement: (element) => {
      set({ audioElement: element })
      if (element) {
        // Синхронизируем громкость и скорость при подключении элемента
        element.volume = get().volume
        element.playbackRate = get().playbackRate
        element.addEventListener('loadedmetadata', () => {
          const duration = element.duration || 0
          set({ duration })
        })
        element.addEventListener('timeupdate', () => {
          const newTime = element.currentTime || 0
          set({ currentTime: newTime })
        })
        element.addEventListener('ended', () => {
          const { queue, currentIndex, audioElement, repeatMode, isShuffle } = get()

          if (!audioElement || queue.length === 0) {
            set({ isPlaying: false, currentTime: 0 })
            stopProgressTracking()
            return
          }

          // repeat one
          if (repeatMode === 'one') {
            audioElement.currentTime = 0
            audioElement.play().then(() => {
              set({ isPlaying: true, currentTime: 0 })
              startProgressTracking()
            }).catch((error) => {
              console.error('Ошибка воспроизведения:', error)
              set({ isPlaying: false })
              stopProgressTracking()
            })
            return
          }

          // shuffle next
          if (isShuffle && queue.length > 1) {
            const nextIndex = getRandomIndex(queue.length, currentIndex)
            playTrackAtIndex(nextIndex)
            return
          }

          // обычный переход или повтор всех
          if (currentIndex < queue.length - 1) {
            playTrackAtIndex(currentIndex + 1)
            return
          }

          if (repeatMode === 'all') {
            playTrackAtIndex(0)
            return
          }

          // закончилась очередь
          set({ isPlaying: false, currentTime: 0 })
          stopProgressTracking()
        })
        element.addEventListener('play', () => {
          set({ isPlaying: true })
        })
        element.addEventListener('pause', () => {
          set({ isPlaying: false })
        })
      }
    },

    setCurrentTrack: (track, startTime?: number) => {
      const { audioElement } = get()
      if (audioElement && track) {
        // Останавливаем текущее воспроизведение перед сменой трека
        audioElement.pause()
        audioElement.src = track.audioUrl
        audioElement.load()
        set({ 
          currentTrack: track, 
          currentTime: startTime || 0, 
          isPlaying: false,
          duration: 0 // Сброс, загрузится автоматически
        })
        
        // Если указано время начала, устанавливаем его после загрузки
        if (startTime !== undefined && startTime > 0) {
          const handleLoadedMetadata = () => {
            audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata)
            audioElement.currentTime = startTime
            set({ currentTime: startTime })
          }
          audioElement.addEventListener('loadedmetadata', handleLoadedMetadata)
        }
        // Не запускаем автоматически - пользователь сам нажмёт play
      } else {
        set({ currentTrack: track })
      }
    },

    play: () => {
      const { audioElement } = get()
      if (audioElement) {
        audioElement.play()
        set({ isPlaying: true })
        startProgressTracking()
      }
    },

    pause: () => {
      const { audioElement } = get()
      if (audioElement) {
        audioElement.pause()
        set({ isPlaying: false })
        stopProgressTracking()
      }
    },

    togglePlay: () => {
      const { isPlaying } = get()
      if (isPlaying) {
        get().pause()
      } else {
        get().play()
      }
    },

    setCurrentTime: (time) => {
      const { audioElement } = get()
      if (audioElement) {
        audioElement.currentTime = time
        set({ currentTime: time })
      }
    },

    setDuration: (duration) => set({ duration }),

    setVolume: (volume) => {
      const { audioElement } = get()
      const clamped = Math.min(1, Math.max(0, volume))
      if (audioElement) {
        audioElement.volume = clamped
      }
      set({ volume: clamped })
      if (typeof window !== 'undefined') {
        localStorage.setItem('playerVolume', String(clamped))
      }
    },

    setQueue: (queue, index = 0) => {
      set({ queue, currentIndex: index })
      if (queue.length > 0) {
        get().setCurrentTrack(queue[index])
      }
    },

    next: () => {
      const { queue, currentIndex, isShuffle, repeatMode } = get()
      if (queue.length === 0) return

      if (isShuffle && queue.length > 1) {
        const nextIndex = getRandomIndex(queue.length, currentIndex)
        playTrackAtIndex(nextIndex)
        return
      }

      if (currentIndex < queue.length - 1) {
        playTrackAtIndex(currentIndex + 1)
        return
      }

      if (repeatMode === 'all') {
        playTrackAtIndex(0)
      }
    },

    previous: () => {
      const { queue, currentIndex, isShuffle, repeatMode } = get()
      if (queue.length === 0) return

      if (isShuffle && queue.length > 1) {
        const prevIndex = getRandomIndex(queue.length, currentIndex)
        playTrackAtIndex(prevIndex)
        return
      }

      if (currentIndex > 0) {
        playTrackAtIndex(currentIndex - 1)
        return
      }

      if (repeatMode === 'all') {
        playTrackAtIndex(queue.length - 1)
      }
    },

    seek: (time) => {
      get().setCurrentTime(time)
    },

    saveProgress: async () => {
      const { currentTrack, currentTime } = get()
      if (!currentTrack) return

      try {
        // Check if it's an Episode (has podcastId) or Track
        const episodeId = 'podcastId' in currentTrack ? currentTrack.id : null
        const trackId = 'podcastId' in currentTrack ? null : currentTrack.id
        await playerApi.saveProgress(episodeId, trackId, currentTime)
      } catch (error) {
        console.error('Failed to save progress:', error)
      }
    },

    stop: () => {
      const { audioElement } = get()
      if (audioElement) {
        audioElement.pause()
        audioElement.src = ''
        audioElement.load()
      }
      stopProgressTracking()
      set({ 
        currentTrack: null, 
        isPlaying: false, 
        currentTime: 0, 
        duration: 0,
        queue: [],
        currentIndex: 0
      })
    },

    openNowPlaying: () => set({ isNowPlayingOpen: true }),
    closeNowPlaying: () => set({ isNowPlayingOpen: false }),

    toggleShuffle: () => {
      const { isShuffle } = get()
      const next = !isShuffle
      set({ isShuffle: next })
      if (typeof window !== 'undefined') {
        localStorage.setItem('playerShuffle', String(next))
      }
    },

    cycleRepeat: () => {
      const { repeatMode } = get()
      const nextMode: RepeatMode = repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off'
      set({ repeatMode: nextMode })
      if (typeof window !== 'undefined') {
        localStorage.setItem('playerRepeat', nextMode)
      }
    },

    setPlaybackRate: (rate) => {
      const { audioElement } = get()
      const clamped = Math.min(2, Math.max(0.5, rate))
      if (audioElement) {
        audioElement.playbackRate = clamped
      }
      set({ playbackRate: clamped })
      if (typeof window !== 'undefined') {
        localStorage.setItem('playerPlaybackRate', String(clamped))
      }
    },

    setSleepTimer: (minutes) => {
      const { sleepTimerId } = get()
      if (sleepTimerId) {
        clearTimeout(sleepTimerId)
      }

      if (minutes === null || minutes <= 0) {
        set({ sleepTimerMinutes: null, sleepTimerId: null })
        return
      }

      const timeoutId = setTimeout(() => {
        const { audioElement } = get()
        if (audioElement) {
          audioElement.pause()
        }
        get().pause()
        set({ sleepTimerMinutes: null, sleepTimerId: null })
      }, minutes * 60 * 1000)

      set({ sleepTimerMinutes: minutes, sleepTimerId: timeoutId })
    },

    clearSleepTimer: () => {
      const { sleepTimerId } = get()
      if (sleepTimerId) {
        clearTimeout(sleepTimerId)
      }
      set({ sleepTimerMinutes: null, sleepTimerId: null })
    },
  }
})

