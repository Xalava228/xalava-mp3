import { Play } from 'lucide-react'
import { usePlayerStore } from '../store/playerStore'
import { Episode, Track } from '../types'

interface PlayButtonProps {
  item: Track | Episode
  className?: string
  queue?: (Track | Episode)[] // Опциональная очередь треков
}

export default function PlayButton({ item, className = '', queue }: PlayButtonProps) {
  const { setCurrentTrack, play, setQueue } = usePlayerStore()

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault() // Предотвращаем переход по ссылке
    
    // Если передана очередь, используем её, иначе создаём очередь из одного элемента
    if (queue && queue.length > 0) {
      const index = queue.findIndex(t => t.id === item.id)
      if (index !== -1) {
        setQueue(queue, index)
        play()
      } else {
        // Если элемент не найден в очереди, добавляем его
        setQueue([...queue, item], queue.length)
        play()
      }
    } else {
      // Просто играем один трек без очереди
      setCurrentTrack(item)
      play()
    }
  }

  return (
    <button
      onClick={handlePlay}
      className={`p-3 bg-gradient-to-r from-dark-accent to-dark-accent-secondary hover:from-dark-accent-secondary hover:to-dark-accent text-white rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-dark-accent/50 hover:scale-110 ${className}`}
      aria-label="Play"
    >
      <Play className="w-5 h-5 text-white fill-white" />
    </button>
  )
}

