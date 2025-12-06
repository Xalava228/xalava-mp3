import { useState } from 'react'
import { X, Upload, Music } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

interface AddEpisodeModalProps {
  isOpen: boolean
  onClose: () => void
  podcastId: string
}

export default function AddEpisodeModal({ isOpen, onClose, podcastId }: AddEpisodeModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [duration, setDuration] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const queryClient = useQueryClient()

  if (!isOpen) return null

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAudioFile(file)
      // Попытка получить длительность из файла
      const audio = new Audio()
      audio.src = URL.createObjectURL(file)
      audio.addEventListener('loadedmetadata', () => {
        setDuration(Math.floor(audio.duration).toString())
      })
    }
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setAudioFile(null)
    setCoverFile(null)
    setDuration('')
    setError('')
    setSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!title) {
      setError('Заполните название эпизода')
      return
    }

    if (!audioFile) {
      setError('Выберите аудио файл')
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('podcastId', podcastId)
      formData.append('title', title)
      formData.append('description', description)
      formData.append('audio', audioFile)
      if (coverFile) {
        formData.append('cover', coverFile)
      }
      if (duration) {
        formData.append('duration', duration)
      }

      const token = localStorage.getItem('token')
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${apiUrl}/episodes/upload`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      })

      if (!response.ok) {
        let errorMessage = 'Ошибка при загрузке'
        try {
          const error = await response.json()
          errorMessage = error.message || errorMessage
        } catch {
          errorMessage = `Ошибка ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log('Эпизод загружен:', result)

      setSuccess(true)
      resetForm()

      queryClient.invalidateQueries({ queryKey: ['episodes', podcastId] })
      queryClient.invalidateQueries({ queryKey: ['podcast', podcastId] })

      setTimeout(() => {
        onClose()
        setSuccess(false)
      }, 2000)
    } catch (err: any) {
      console.error('Ошибка загрузки:', err)
      setError(err.message || 'Ошибка при загрузке эпизода')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-card rounded-card w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-dark-text-secondary hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-6">Добавить эпизод</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Название эпизода *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:border-white transition-colors"
              placeholder="Введите название эпизода"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:border-white transition-colors resize-none"
              placeholder="Введите описание эпизода"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Аудио файл *</label>
            <label className="flex items-center gap-3 px-4 py-3 bg-dark-surface border border-dark-border rounded-lg cursor-pointer hover:bg-dark-hover transition-colors">
              <Upload className="w-5 h-5 text-dark-text-secondary" />
              <span className="text-dark-text-secondary">
                {audioFile ? audioFile.name : 'Выберите аудио файл (mp3, wav, ogg)'}
              </span>
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioChange}
                className="hidden"
                required
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Обложка (опционально)</label>
            <label className="flex items-center gap-3 px-4 py-3 bg-dark-surface border border-dark-border rounded-lg cursor-pointer hover:bg-dark-hover transition-colors">
              <Music className="w-5 h-5 text-dark-text-secondary" />
              <span className="text-dark-text-secondary">
                {coverFile ? coverFile.name : 'Выберите обложку (jpg, png)'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
          </div>

          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}

          {success && (
            <div className="text-green-400 text-sm">Эпизод успешно загружен!</div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white hover:bg-dark-hover transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-dark-accent to-dark-accent-secondary hover:from-dark-accent-secondary hover:to-dark-accent text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-dark-accent/30 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? 'Загрузка...' : 'Добавить эпизод'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

