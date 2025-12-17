import { Play } from 'lucide-react'
import { usePlayerStore } from '../store/playerStore'
import { Episode, Track, ListeningHistory } from '../types'

interface ContinueButtonProps {
  historyItem: ListeningHistory
  className?: string
  queue?: (Track | Episode)[]
}

export default function ContinueButton({ historyItem, className = '', queue }: ContinueButtonProps) {
  const { setCurrentTrack, play, setQueue, seek, setCurrentTime } = usePlayerStore()

  const handleContinue = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    
    const content = historyItem.track || historyItem.episode
    if (!content) return

    const savedTime = historyItem.progressSeconds

    // Если передана очередь, используем её, иначе создаём очередь из одного элемента
    if (queue && queue.length > 0) {
      const index = queue.findIndex(t => t.id === content.id)
      if (index !== -1) {
        setQueue(queue, index)
        // Устанавливаем время после загрузки
        setTimeout(() => {
          setCurrentTime(savedTime)
          seek(savedTime)
        }, 100)
      } else {
        setQueue([...queue, content], queue.length)
        setTimeout(() => {
          setCurrentTime(savedTime)
          seek(savedTime)
        }, 100)
      }
    } else {
      setCurrentTrack(content, savedTime)
    }
    
    // Запускаем воспроизведение после небольшой задержки
    setTimeout(() => {
      play()
    }, 200)
  }

  return (
    <button
      onClick={handleContinue}
      className={`p-3 bg-gradient-to-r from-dark-accent to-dark-accent-secondary hover:from-dark-accent-secondary hover:to-dark-accent text-white rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-dark-accent/50 hover:scale-110 ${className}`}
      aria-label="Продолжить прослушивание"
      title="Продолжить с сохраненного места"
    >
      <Play className="w-5 h-5 text-white fill-white" />
    </button>
  )
}

