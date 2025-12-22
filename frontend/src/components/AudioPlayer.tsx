import { useEffect, useRef } from 'react'
import { usePlayerStore } from '../store/playerStore'

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const { setAudioElement, currentTrack, isPlaying, volume } = usePlayerStore()

  useEffect(() => {
    if (audioRef.current) {
      setAudioElement(audioRef.current)
    }
  }, [setAudioElement])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // Обновляем src когда меняется трек
    if (currentTrack && audio.src !== currentTrack.audioUrl) {
      audio.src = currentTrack.audioUrl
      audio.load()
    }
  }, [currentTrack])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return

    // Синхронизируем состояние только если трек уже загружен
    // Избегаем конфликтов при автоматическом переключении треков
    const handlePlayPause = async () => {
      if (isPlaying) {
        // Проверяем, что src установлен и трек загружен
        if (audio.src && audio.readyState >= 2) {
          try {
            await audio.play()
          } catch (error) {
            console.error('Ошибка воспроизведения:', error)
            usePlayerStore.getState().pause()
          }
        }
      } else {
        audio.pause()
      }
    }

    // Небольшая задержка чтобы избежать конфликтов при переключении
    const timeout = setTimeout(handlePlayPause, 50)
    return () => clearTimeout(timeout)
  }, [isPlaying, currentTrack])

  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      audio.volume = volume
    }
  }, [volume])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const isInput =
        target &&
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
        (target?.getAttribute('contenteditable') === 'true')

      if (isInput) return

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          usePlayerStore.getState().togglePlay()
          break
        case 'ArrowRight':
          e.preventDefault()
          usePlayerStore.getState().seek(usePlayerStore.getState().currentTime + 10)
          break
        case 'ArrowLeft':
          e.preventDefault()
          usePlayerStore.getState().seek(Math.max(0, usePlayerStore.getState().currentTime - 10))
          break
        case 'KeyN':
          usePlayerStore.getState().next()
          break
        case 'KeyP':
          usePlayerStore.getState().previous()
          break
        case 'KeyS':
          usePlayerStore.getState().toggleShuffle()
          break
        case 'KeyR':
          usePlayerStore.getState().cycleRepeat()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  return (
    <audio
      ref={audioRef}
      preload="metadata"
      style={{ display: 'none' }}
    />
  )
}


