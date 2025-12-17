import { useState, useEffect } from 'react'
import { X, Upload, Music2, Mic2, Image, Loader2 } from 'lucide-react'
import { tracksApi } from '../api/tracks'
import { podcastsApi } from '../api/podcasts'
import { useQueryClient } from '@tanstack/react-query'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  initialType?: UploadType
}

type UploadType = 'track' | 'podcast'

export default function UploadModal({ isOpen, onClose, initialType = 'track' }: UploadModalProps) {
  const [type, setType] = useState<UploadType>(initialType)
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [description, setDescription] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const queryClient = useQueryClient()

  // Обнуляем форму и устанавливаем нужный тип при открытии
  useEffect(() => {
    if (isOpen) {
      setType(initialType)
      setTitle('')
      setArtist('')
      setDescription('')
      setAudioFile(null)
      setCoverFile(null)
      setError('')
    }
  }, [isOpen, initialType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (type === 'track') {
        if (!audioFile) {
          setError('Выберите аудио файл')
          setLoading(false)
          return
        }
        await tracksApi.upload({
          title,
          artist,
          audioFile,
          coverFile: coverFile || undefined,
        })
        queryClient.invalidateQueries({ queryKey: ['tracks'] })
      } else {
        await podcastsApi.create({
          title,
          author: artist,
          description,
          coverFile: coverFile || undefined,
        })
        queryClient.invalidateQueries({ queryKey: ['podcasts'] })
      }

      onClose()
      setTitle('')
      setArtist('')
      setDescription('')
      setAudioFile(null)
      setCoverFile(null)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при загрузке')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass border border-dark-border/50 rounded-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-dark-text-muted hover:text-white transition-colors rounded-lg hover:bg-dark-hover"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-accent mx-auto mb-3 flex items-center justify-center shadow-glow">
            <Upload className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-lg font-bold text-white">Загрузить контент</h2>
        </div>

        {/* Type Toggle */}
        <div className="flex gap-2 p-1 bg-dark-card rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setType('track')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              type === 'track'
                ? 'bg-gradient-accent text-white shadow-glow'
                : 'text-dark-text-secondary hover:text-white'
            }`}
          >
            <Music2 className="w-4 h-4" />
            Трек
          </button>
          <button
            type="button"
            onClick={() => setType('podcast')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              type === 'podcast'
                ? 'bg-gradient-accent text-white shadow-glow'
                : 'text-dark-text-secondary hover:text-white'
            }`}
          >
            <Mic2 className="w-4 h-4" />
            Подкаст
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-dark-text-secondary">Название</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-xl text-white placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-dark-accent focus:border-transparent transition-all text-sm"
              placeholder={type === 'track' ? 'Название трека' : 'Название подкаста'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-dark-text-secondary">
              {type === 'track' ? 'Исполнитель' : 'Автор'}
            </label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              required
              className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-xl text-white placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-dark-accent focus:border-transparent transition-all text-sm"
              placeholder={type === 'track' ? 'Имя исполнителя' : 'Имя автора'}
            />
          </div>

          {type === 'podcast' && (
            <div>
              <label className="block text-sm font-medium mb-1.5 text-dark-text-secondary">Описание</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-xl text-white placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-dark-accent focus:border-transparent transition-all resize-none text-sm"
                placeholder="О чём этот подкаст..."
              />
            </div>
          )}

          {type === 'track' && (
            <div>
              <label className="block text-sm font-medium mb-1.5 text-dark-text-secondary">Аудио файл</label>
              <label className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-dark-border rounded-xl cursor-pointer hover:border-dark-accent transition-colors">
                <Music2 className="w-5 h-5 text-dark-text-muted" />
                <span className="text-dark-text-secondary text-sm">
                  {audioFile ? audioFile.name : 'Выбрать MP3 файл'}
                </span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5 text-dark-text-secondary">Обложка (необязательно)</label>
            <label className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-dark-border rounded-xl cursor-pointer hover:border-dark-accent transition-colors">
              <Image className="w-5 h-5 text-dark-text-muted" />
              <span className="text-dark-text-secondary text-sm">
                {coverFile ? coverFile.name : 'Выбрать изображение'}
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
            <div className="text-red-400 text-sm bg-red-400/10 px-4 py-3 rounded-xl border border-red-400/20">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-accent hover:shadow-glow text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Загрузка...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Загрузить
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
