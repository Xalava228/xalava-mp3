import { useEffect, useState } from 'react'
import { usePlayerStore } from '../store/playerStore'
import { Play, Pause, SkipBack, SkipForward, ChevronDown, Info, Heart, Timer, Gauge } from 'lucide-react'
import { formatTime } from '../utils/formatTime'
import FavoriteButton from './FavoriteButton'

export default function NowPlayingModal() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    isNowPlayingOpen,
    togglePlay,
    next,
    previous,
    seek,
    closeNowPlaying,
    playbackRate,
    setPlaybackRate,
    sleepTimerMinutes,
    setSleepTimer,
    clearSleepTimer,
  } = usePlayerStore()

  const [showSleepTimer, setShowSleepTimer] = useState(false)
  const [showPlaybackRate, setShowPlaybackRate] = useState(false)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeNowPlaying()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [closeNowPlaying])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.sleep-timer-menu') && !target.closest('.playback-rate-menu')) {
        setShowSleepTimer(false)
        setShowPlaybackRate(false)
      }
    }
    if (showSleepTimer || showPlaybackRate) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showSleepTimer, showPlaybackRate])

  if (!isNowPlayingOpen || !currentTrack) {
    return null
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  // Получаем данные трека
  const title = currentTrack.title
  const artist = 'artist' in currentTrack ? currentTrack.artist : 'podcastId' in currentTrack ? 'Подкаст' : 'Автор'
  const coverUrl = 'coverUrl' in currentTrack ? currentTrack.coverUrl : null

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center animate-fadeIn bg-dark-bg"
    >
      {/* Кнопка закрытия */}
      <button
        onClick={closeNowPlaying}
        className="absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 bg-dark-card/80 hover:bg-dark-hover backdrop-blur-sm border border-dark-border/50"
        aria-label="Закрыть"
      >
        <ChevronDown className="w-6 h-6 text-white" />
      </button>

      {/* Контент */}
      <div className="flex flex-col items-center px-8 w-full max-w-md">
        {/* Обложка */}
        <div className="mb-8 w-full aspect-square max-w-[360px]">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={title}
              className="w-full h-full object-cover rounded-2xl shadow-2xl"
            />
          ) : (
            <div 
              className="w-full h-full rounded-2xl flex items-center justify-center shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #ffa07a 100%)' }}
            >
              <span className="text-8xl">🎵</span>
            </div>
          )}
        </div>

        {/* Информация о треке */}
        <div className="text-center mb-8 w-full">
          <div className="flex items-center justify-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-white uppercase tracking-wide">
              {title}
            </h2>
            <FavoriteButton
              trackId={'artist' in currentTrack ? currentTrack.id : undefined}
              episodeId={'podcastId' in currentTrack ? currentTrack.id : undefined}
              className="p-1"
            />
            <button className="p-1 text-white/70 hover:text-white transition-colors">
              <Info className="w-5 h-5" />
            </button>
          </div>
          <p className="text-white/70 text-base">
            {artist}
          </p>
        </div>

        {/* Прогресс-бар */}
        <div className="w-full mb-6">
          <div 
            className="w-full h-1 rounded-full cursor-pointer"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const x = e.clientX - rect.left
              const percent = x / rect.width
              seek(percent * duration)
            }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{ 
                width: `${progress}%`,
                backgroundColor: 'rgba(255, 255, 255, 0.8)'
              }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-white/60">
              {formatTime(currentTime)}
            </span>
            <span className="text-xs text-white/60">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Контроли воспроизведения */}
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="flex items-center justify-center gap-8">
            <button
              onClick={previous}
              className="p-3 text-white/80 hover:text-white transition-colors hover:scale-110"
              aria-label="Предыдущий"
            >
              <SkipBack className="w-8 h-8" fill="currentColor" />
            </button>
            
            <button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-105"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
              aria-label={isPlaying ? 'Пауза' : 'Воспроизвести'}
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white" fill="white" />
              ) : (
                <Play className="w-8 h-8 text-white ml-1" fill="white" />
              )}
            </button>
            
            <button
              onClick={next}
              className="p-3 text-white/80 hover:text-white transition-colors hover:scale-110"
              aria-label="Следующий"
            >
              <SkipForward className="w-8 h-8" fill="currentColor" />
            </button>
          </div>

          {/* Дополнительные контроли */}
          <div className="flex items-center justify-center gap-6">
            {/* Скорость воспроизведения */}
            <div className="relative playback-rate-menu">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowPlaybackRate(!showPlaybackRate)
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-white/70 hover:text-white transition-colors"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                title="Скорость воспроизведения"
              >
                <Gauge className="w-4 h-4" />
                <span className="text-sm">{playbackRate}x</span>
              </button>
              {showPlaybackRate && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 rounded-lg"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex gap-2">
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => {
                          setPlaybackRate(rate)
                          setShowPlaybackRate(false)
                        }}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          playbackRate === rate
                            ? 'text-white'
                            : 'text-white/60 hover:text-white'
                        }`}
                        style={{
                          backgroundColor: playbackRate === rate ? 'rgba(255, 255, 255, 0.2)' : 'transparent'
                        }}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Таймер сна */}
            <div className="relative sleep-timer-menu">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowSleepTimer(!showSleepTimer)
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                  sleepTimerMinutes
                    ? 'text-white'
                    : 'text-white/70 hover:text-white'
                }`}
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                title="Таймер сна"
              >
                <Timer className="w-4 h-4" />
                {sleepTimerMinutes && (
                  <span className="text-sm">{sleepTimerMinutes}м</span>
                )}
              </button>
              {showSleepTimer && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 rounded-lg min-w-[200px]"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex flex-col gap-2">
                    <div className="text-xs text-white/60 mb-1">Таймер сна</div>
                    {[5, 10, 15, 30, 45, 60].map((minutes) => (
                      <button
                        key={minutes}
                        onClick={() => {
                          setSleepTimer(minutes)
                          setShowSleepTimer(false)
                        }}
                        className={`px-3 py-1.5 rounded text-sm text-left transition-colors ${
                          sleepTimerMinutes === minutes
                            ? 'text-white'
                            : 'text-white/60 hover:text-white'
                        }`}
                        style={{
                          backgroundColor: sleepTimerMinutes === minutes ? 'rgba(255, 255, 255, 0.2)' : 'transparent'
                        }}
                      >
                        {minutes} минут
                      </button>
                    ))}
                    {sleepTimerMinutes && (
                      <button
                        onClick={() => {
                          clearSleepTimer()
                          setShowSleepTimer(false)
                        }}
                        className="px-3 py-1.5 rounded text-sm text-left text-white/60 hover:text-white transition-colors"
                        style={{ backgroundColor: 'transparent' }}
                      >
                        Выключить
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

