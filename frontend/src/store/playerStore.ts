import { create } from 'zustand'
import { Episode, Track } from '../types'
import { playerApi } from '../api/player'

interface PlayerState {
  currentTrack: Track | Episode | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  queue: (Track | Episode)[]
  currentIndex: number
  audioElement: HTMLAudioElement | null

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
}

export const usePlayerStore = create<PlayerState>((set, get) => {
  let progressInterval: ReturnType<typeof setInterval> | null = null

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
    volume: 1,
    queue: [],
    currentIndex: 0,
    audioElement: null,

    setAudioElement: (element) => {
      set({ audioElement: element })
      if (element) {
        element.addEventListener('loadedmetadata', () => {
          const duration = element.duration || 0
          set({ duration })
        })
        element.addEventListener('timeupdate', () => {
          const newTime = element.currentTime || 0
          set({ currentTime: newTime })
        })
        element.addEventListener('ended', () => {
          const { queue, currentIndex, audioElement } = get()
          // Автоматически переключаемся на следующий трек только если есть очередь
          if (queue.length > 0 && currentIndex < queue.length - 1) {
            const newIndex = currentIndex + 1
            const nextTrack = queue[newIndex]
            
            // Плавное переключение без паузы
            if (audioElement && nextTrack) {
              // Останавливаем текущее воспроизведение
              audioElement.pause()
              
              // Устанавливаем новый трек
              audioElement.src = nextTrack.audioUrl
              audioElement.load()
              
              // Обновляем состояние
              set({ 
                currentIndex: newIndex,
                currentTrack: nextTrack, 
                currentTime: 0, 
                isPlaying: false, // Временно false, чтобы избежать конфликтов
                duration: 0
              })
              
              // Ждём загрузки метаданных и запускаем воспроизведение
              const handleCanPlay = () => {
                audioElement.removeEventListener('canplay', handleCanPlay)
                audioElement.play().then(() => {
                  set({ isPlaying: true })
                  startProgressTracking()
                }).catch((error) => {
                  console.error('Ошибка воспроизведения:', error)
                  set({ isPlaying: false })
                  stopProgressTracking()
                })
              }
              
              if (audioElement.readyState >= 3) {
                // Если уже загружено, запускаем сразу
                audioElement.play().then(() => {
                  set({ isPlaying: true })
                  startProgressTracking()
                }).catch((error) => {
                  console.error('Ошибка воспроизведения:', error)
                  set({ isPlaying: false })
                  stopProgressTracking()
                })
              } else {
                // Иначе ждём загрузки
                audioElement.addEventListener('canplay', handleCanPlay, { once: true })
              }
            }
          } else {
            // Если очередь закончилась, просто останавливаем
            set({ isPlaying: false, currentTime: 0 })
            stopProgressTracking()
          }
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
      if (audioElement) {
        audioElement.volume = volume
        set({ volume })
      }
    },

    setQueue: (queue, index = 0) => {
      set({ queue, currentIndex: index })
      if (queue.length > 0) {
        get().setCurrentTrack(queue[index])
      }
    },

    next: () => {
      const { queue, currentIndex, audioElement } = get()
      if (queue.length > 0 && currentIndex < queue.length - 1) {
        const newIndex = currentIndex + 1
        const nextTrack = queue[newIndex]
        
        // Плавное переключение без паузы
        if (audioElement && nextTrack) {
          // Останавливаем текущее воспроизведение
          audioElement.pause()
          stopProgressTracking()
          
          // Устанавливаем новый трек
          audioElement.src = nextTrack.audioUrl
          audioElement.load()
          
          // Обновляем состояние
          set({ 
            currentIndex: newIndex,
            currentTrack: nextTrack, 
            currentTime: 0, 
            isPlaying: false, // Временно false
            duration: 0
          })
          
          // Ждём загрузки и запускаем
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
      }
    },

    previous: () => {
      const { queue, currentIndex, audioElement } = get()
      if (queue.length > 0 && currentIndex > 0) {
        const newIndex = currentIndex - 1
        const prevTrack = queue[newIndex]
        
        // Плавное переключение без паузы
        if (audioElement && prevTrack) {
          // Останавливаем текущее воспроизведение
          audioElement.pause()
          stopProgressTracking()
          
          // Устанавливаем новый трек
          audioElement.src = prevTrack.audioUrl
          audioElement.load()
          
          // Обновляем состояние
          set({ 
            currentIndex: newIndex,
            currentTrack: prevTrack, 
            currentTime: 0, 
            isPlaying: false, // Временно false
            duration: 0
          })
          
          // Ждём загрузки и запускаем
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
  }
})

