import { usePlayerStore } from '../store/playerStore'
import { Play, Pause, SkipBack, SkipForward, Volume2, List } from 'lucide-react'
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
  } = usePlayerStore()

  if (!currentTrack) {
    return null
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="fixed bottom-0 left-64 right-0 h-24 bg-dark-card/95 backdrop-blur-xl border-t border-dark-border shadow-2xl px-6 flex items-center gap-6 z-40 max-md:left-0 max-md:px-4">
      {/* Track Info */}
      <div className="flex items-center gap-4 min-w-[200px] max-w-[200px] max-md:min-w-[150px] max-md:max-w-[150px]">
        {('coverUrl' in currentTrack && currentTrack.coverUrl) ? (
          <img
            src={currentTrack.coverUrl}
            alt={currentTrack.title}
            className="w-14 h-14 rounded-lg object-cover flex-shrink-0 max-md:w-12 max-md:h-12"
          />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-dark-hover flex items-center justify-center flex-shrink-0 max-md:w-12 max-md:h-12">
            <span className="text-2xl max-md:text-xl">🎵</span>
          </div>
        )}
        <div className="min-w-0 flex-1 overflow-hidden max-md:hidden">
          <p className="text-sm font-medium text-white truncate">
            {currentTrack.title}
          </p>
          <p className="text-xs text-dark-text-secondary truncate">
            {'artist' in currentTrack ? currentTrack.artist : 'podcastId' in currentTrack ? 'Подкаст' : 'Автор'}
          </p>
        </div>
      </div>

      {/* Player Controls - фиксированная позиция */}
      <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
        <div className="flex items-center gap-4 flex-shrink-0">
          <button
            onClick={previous}
            className="p-2 hover:bg-dark-hover rounded-full transition-colors flex-shrink-0"
            aria-label="Previous"
          >
            <SkipBack className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={togglePlay}
            className="p-3 bg-gradient-to-r from-dark-accent to-dark-accent-secondary hover:from-dark-accent-secondary hover:to-dark-accent text-white rounded-full transition-all duration-300 flex-shrink-0 shadow-lg hover:shadow-xl hover:shadow-dark-accent/50 hover:scale-110"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white" />
            )}
          </button>
          <button
            onClick={next}
            className="p-2 hover:bg-dark-hover rounded-full transition-colors flex-shrink-0"
            aria-label="Next"
          >
            <SkipForward className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="flex items-center gap-2 w-full max-w-md">
          <span className="text-xs text-dark-text-secondary w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <div className="flex-1 relative">
            <div className="h-1 bg-dark-border rounded-full cursor-pointer" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const x = e.clientX - rect.left
              const percent = x / rect.width
              seek(percent * duration)
            }}>
              <div
                className="h-full bg-gradient-to-r from-dark-accent to-dark-accent-secondary rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <span className="text-xs text-dark-text-secondary w-10">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Volume & Queue */}
      <div className="flex items-center gap-4 min-w-[200px] justify-end max-md:min-w-0 max-md:hidden">
        <button
          className="p-2 hover:bg-dark-hover rounded-full transition-colors"
          aria-label="Queue"
        >
          <List className="w-5 h-5 text-dark-text-secondary" />
        </button>
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-dark-text-secondary" />
          <div className="relative w-24">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-1 bg-dark-border rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #667eea 0%, #667eea ${volume * 100}%, rgba(118, 75, 162, 0.3) ${volume * 100}%, rgba(118, 75, 162, 0.3) 100%)`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

