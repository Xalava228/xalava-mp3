import { useEffect, useState } from 'react'
import { usePlayerStore } from '../store/playerStore'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, Shuffle, Repeat, Repeat1 } from 'lucide-react'
import { formatTime } from '../utils/formatTime'

export default function BottomPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    openNowPlaying,
    isShuffle,
    repeatMode,
    toggleShuffle,
    cycleRepeat,
  } = usePlayerStore()
  
  const [isMuted, setIsMuted] = useState(false)
  const [prevVolume, setPrevVolume] = useState(volume)

  // Хуки должны вызываться всегда, поэтому эффект выше условного возврата
  useEffect(() => {
    if (currentTrack) {
      document.title = `${isPlaying ? '▶︎' : '❚❚'} ${currentTrack.title} — Xalava.music`
    } else {
      document.title = 'Xalava.music'
    }
  }, [currentTrack, isPlaying])

  if (!currentTrack) {
    return null
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleMute = () => {
    if (isMuted) {
      setVolume(prevVolume)
      setIsMuted(false)
    } else {
      setPrevVolume(volume)
      setVolume(0)
      setIsMuted(true)
    }
  }

  return (
    <div className="fixed bottom-0 left-60 right-0 h-20 glass border-t border-dark-border/50 px-4 flex items-center z-40 max-md:left-0">
      {/* Track Info */}
      <div className="flex items-center gap-3 w-[30%] min-w-0 max-md:w-auto">
        <button 
          onClick={openNowPlaying}
          className="relative group cursor-pointer"
        >
          {('coverUrl' in currentTrack && currentTrack.coverUrl) ? (
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-12 h-12 rounded-lg object-cover shadow-lg hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gradient-accent flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
              <span className="text-lg">🎵</span>
            </div>
          )}
          {/* Playing indicator */}
          {isPlaying && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-dark-accent rounded-full flex items-center justify-center animate-glow">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>
          )}
        </button>
        <button 
          onClick={openNowPlaying}
          className="min-w-0 max-md:hidden text-left cursor-pointer hover:opacity-80 transition-opacity"
        >
          <p className="text-sm font-medium text-white truncate">
            {currentTrack.title}
          </p>
          <p className="text-xs text-dark-text-secondary truncate">
            {'artist' in currentTrack ? currentTrack.artist : 'podcastId' in currentTrack ? 'Подкаст' : 'Автор'}
          </p>
        </button>
        <button className="p-1.5 text-dark-text-muted hover:text-dark-accent transition-colors max-md:hidden">
          <Heart className="w-4 h-4" />
        </button>
      </div>

      {/* Player Controls */}
      <div className="flex-1 flex flex-col items-center gap-1.5 max-w-xl mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleShuffle}
            className={`p-1.5 transition-colors ${isShuffle ? 'text-dark-accent' : 'text-dark-text-secondary hover:text-white'}`}
            aria-label="Shuffle"
            title="Перемешать"
          >
            <Shuffle className="w-5 h-5" />
          </button>
          <button
            onClick={previous}
            className="p-1.5 text-dark-text-secondary hover:text-white transition-colors"
            aria-label="Previous"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          <button
            onClick={togglePlay}
            className="w-10 h-10 bg-gradient-accent hover:shadow-glow rounded-full flex items-center justify-center transition-all hover-lift"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white fill-white" />
            ) : (
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            )}
          </button>
          <button
            onClick={next}
            className="p-1.5 text-dark-text-secondary hover:text-white transition-colors"
            aria-label="Next"
          >
            <SkipForward className="w-5 h-5" />
          </button>
          <button
            onClick={cycleRepeat}
            className={`p-1.5 transition-colors ${repeatMode !== 'off' ? 'text-dark-accent' : 'text-dark-text-secondary hover:text-white'}`}
            aria-label="Repeat"
            title={repeatMode === 'off' ? 'Повтор выкл' : repeatMode === 'all' ? 'Повтор очереди' : 'Повтор трека'}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-5 h-5" />
            ) : (
              <Repeat className="w-5 h-5" />
            )}
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="flex items-center gap-2 w-full">
          <span className="text-[11px] text-dark-text-muted w-10 text-right tabular-nums">
            {formatTime(currentTime)}
          </span>
          <div 
            className="flex-1 h-1 bg-dark-hover rounded-full cursor-pointer group relative"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const x = e.clientX - rect.left
              const percent = x / rect.width
              seek(percent * duration)
            }}
          >
            <div
              className="h-full bg-gradient-accent rounded-full relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity scale-0 group-hover:scale-100" />
            </div>
          </div>
          <span className="text-[11px] text-dark-text-muted w-10 tabular-nums">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2 w-[30%] justify-end max-md:hidden">
        <button
          onClick={handleMute}
          className="p-1.5 text-dark-text-secondary hover:text-white transition-colors"
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>
        <div 
          className="w-24 h-1 bg-dark-hover rounded-full cursor-pointer group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const x = e.clientX - rect.left
            const percent = Math.max(0, Math.min(1, x / rect.width))
            setVolume(percent)
            setIsMuted(false)
          }}
        >
          <div
            className="h-full bg-dark-text-secondary group-hover:bg-dark-accent rounded-full relative transition-colors"
            style={{ width: `${volume * 100}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity scale-0 group-hover:scale-100" />
          </div>
        </div>
      </div>
    </div>
  )
}
