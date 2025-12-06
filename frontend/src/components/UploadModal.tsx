import { useState } from 'react'
import { X, Upload, Music, Mic } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
}

type UploadType = 'track' | 'podcast'

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [uploadType, setUploadType] = useState<UploadType>('track')
  
  // Track fields
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [duration, setDuration] = useState('')
  
  // Podcast fields
  const [podcastTitle, setPodcastTitle] = useState('')
  const [podcastDescription, setPodcastDescription] = useState('')
  const [podcastAuthor, setPodcastAuthor] = useState('')
  const [podcastGenres, setPodcastGenres] = useState('')
  const [podcastCoverFile, setPodcastCoverFile] = useState<File | null>(null)
  const [rssUrl, setRssUrl] = useState('')
  const [importMode, setImportMode] = useState(false)
  
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

  const resetForm = (keepImportMode = false) => {
    setTitle('')
    setArtist('')
    setAudioFile(null)
    setCoverFile(null)
    setDuration('')
    setPodcastTitle('')
    setPodcastDescription('')
    setPodcastAuthor('')
    setPodcastGenres('')
    setPodcastCoverFile(null)
    setRssUrl('')
    if (!keepImportMode) {
      setImportMode(false)
    }
    setError('')
    setSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (uploadType === 'track') {
      if (!title || !artist) {
        setError('Заполните название и исполнителя')
        return
      }

      if (!audioFile) {
        setError('Выберите аудио файл')
        return
      }

      setLoading(true)

      try {
        const formData = new FormData()
        formData.append('title', title)
        formData.append('artist', artist)
        formData.append('audio', audioFile)
        if (coverFile) {
          formData.append('cover', coverFile)
        }
        if (duration) {
          formData.append('duration', duration)
        }

        const token = localStorage.getItem('token')
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
        const response = await fetch(`${apiUrl}/tracks/upload`, {
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
        console.log('Трек загружен:', result)

        setSuccess(true)
        resetForm()

        queryClient.invalidateQueries({ queryKey: ['tracks'] })
        queryClient.invalidateQueries({ queryKey: ['recommendations'] })

        setTimeout(() => {
          onClose()
          setSuccess(false)
        }, 2000)
      } catch (err: any) {
        console.error('Ошибка загрузки:', err)
        setError(err.message || 'Ошибка при загрузке трека')
      } finally {
        setLoading(false)
      }
    } else {
      // Podcast upload/import
      if (importMode) {
        // Импорт из RSS
        if (!rssUrl) {
          setError('Введите RSS ссылку')
          return
        }

        setLoading(true)

        try {
          const token = localStorage.getItem('token')
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
          
          // Создаём AbortController для таймаута
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 90000) // 90 секунд таймаут
          
          const response = await fetch(`${apiUrl}/podcasts/import`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify({
              rssUrl,
              genres: podcastGenres,
            }),
            signal: controller.signal,
          })
          
          clearTimeout(timeoutId)

          if (!response.ok) {
            let errorMessage = 'Ошибка при импорте'
            try {
              const error = await response.json()
              errorMessage = error.message || errorMessage
            } catch {
              errorMessage = `Ошибка ${response.status}: ${response.statusText}`
            }
            throw new Error(errorMessage)
          }

          const result = await response.json()
          console.log('Подкаст импортирован:', result)

          setSuccess(true)
          resetForm()

          queryClient.invalidateQueries({ queryKey: ['podcasts'] })
          queryClient.invalidateQueries({ queryKey: ['recommendations'] })

          setTimeout(() => {
            onClose()
            setSuccess(false)
          }, 3000)
        } catch (err: any) {
          console.error('Ошибка импорта:', err)
          if (err.name === 'AbortError') {
            setError('Превышено время ожидания. RSS фид слишком большой или медленный. Попробуйте другую ссылку.')
          } else {
            setError(err.message || 'Ошибка при импорте подкаста. Проверьте правильность RSS ссылки')
          }
        } finally {
          setLoading(false)
        }
      } else {
        // Ручное создание подкаста
        if (!podcastTitle || !podcastAuthor) {
          setError('Заполните название и автора подкаста')
          return
        }

        setLoading(true)

        try {
          const formData = new FormData()
          formData.append('title', podcastTitle)
          formData.append('description', podcastDescription)
          formData.append('author', podcastAuthor)
          if (podcastGenres) {
            formData.append('genres', podcastGenres)
          }
          if (podcastCoverFile) {
            formData.append('cover', podcastCoverFile)
          }

          const token = localStorage.getItem('token')
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
          const response = await fetch(`${apiUrl}/podcasts/upload`, {
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
          console.log('Подкаст создан:', result)

          setSuccess(true)
          resetForm()

          queryClient.invalidateQueries({ queryKey: ['podcasts'] })
          queryClient.invalidateQueries({ queryKey: ['recommendations'] })

          setTimeout(() => {
            onClose()
            setSuccess(false)
          }, 2000)
        } catch (err: any) {
          console.error('Ошибка загрузки:', err)
          setError(err.message || 'Ошибка при создании подкаста')
        } finally {
          setLoading(false)
        }
      }
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

        <h2 className="text-2xl font-bold mb-6">Загрузить контент</h2>

        {/* Type selector */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => {
              setUploadType('track')
              resetForm()
            }}
            className={`flex-1 px-4 py-2 rounded-lg transition-all duration-300 ${
              uploadType === 'track'
                ? 'bg-gradient-to-r from-dark-accent to-dark-accent-secondary text-white shadow-lg'
                : 'bg-dark-surface border border-dark-border text-dark-text-secondary hover:bg-dark-hover'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Music className="w-4 h-4" />
              <span>Трек</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => {
              setUploadType('podcast')
              resetForm()
            }}
            className={`flex-1 px-4 py-2 rounded-lg transition-all duration-300 ${
              uploadType === 'podcast'
                ? 'bg-gradient-to-r from-dark-accent to-dark-accent-secondary text-white shadow-lg'
                : 'bg-dark-surface border border-dark-border text-dark-text-secondary hover:bg-dark-hover'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Mic className="w-4 h-4" />
              <span>Подкаст</span>
            </div>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {uploadType === 'track' ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Название трека *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:border-white transition-colors"
                  placeholder="Введите название"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Исполнитель *</label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:border-white transition-colors"
                  placeholder="Введите имя исполнителя"
                  required
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
            </>
          ) : (
            <>
              {/* Mode selector for podcast */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setImportMode(false)
                    resetForm()
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg transition-all duration-300 text-sm ${
                    !importMode
                      ? 'bg-gradient-to-r from-dark-accent to-dark-accent-secondary text-white shadow-lg'
                      : 'bg-dark-surface border border-dark-border text-dark-text-secondary hover:bg-dark-hover'
                  }`}
                >
                  Создать вручную
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImportMode(true)
                    resetForm(true) // Сохраняем режим импорта
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg transition-all duration-300 text-sm ${
                    importMode
                      ? 'bg-gradient-to-r from-dark-accent to-dark-accent-secondary text-white shadow-lg'
                      : 'bg-dark-surface border border-dark-border text-dark-text-secondary hover:bg-dark-hover'
                  }`}
                >
                  Импорт из RSS
                </button>
              </div>

              {importMode ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">RSS ссылка *</label>
                    <input
                      type="url"
                      value={rssUrl}
                      onChange={(e) => setRssUrl(e.target.value)}
                      className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:border-white transition-colors"
                      placeholder="https://example.com/podcast.rss"
                      required
                    />
                    <p className="text-xs text-dark-text-secondary mt-1">
                      Вставьте ссылку на RSS фид подкаста с аудио файлами
                    </p>
                    <div className="mt-2 p-2 bg-dark-surface/50 rounded text-xs text-dark-text-secondary">
                      <p className="font-medium mb-1 text-yellow-400">⚠️ Важно:</p>
                      <p className="mb-2">RSS фид должен содержать подкасты с аудио файлами (теги &lt;enclosure&gt;), а не новостные статьи. Новостные RSS фиды не поддерживаются.</p>
                      <p className="font-medium mb-1">Простые RSS фиды для теста:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li className="mb-1">
                          <span className="font-medium">Радио-Т (русский):</span>
                          <br />
                          <code className="text-dark-accent text-[10px] break-all">https://feeds.simplecast.com/9XI0s2j7</code>
                        </li>
                        <li className="mb-1">
                          <span className="font-medium">Test Podcast (очень простой):</span>
                          <br />
                          <code className="text-dark-accent text-[10px] break-all">https://feeds.simplecast.com/2n0z3u4p</code>
                        </li>
                        <li className="mb-1">
                          <span className="font-medium">Альтернатива:</span>
                          <br />
                          <code className="text-dark-accent text-[10px] break-all">https://feeds.simplecast.com/54nAGcIl</code>
                          <br />
                          <span className="text-yellow-400">(может быть медленным)</span>
                        </li>
                      </ul>
                      <p className="mt-2 text-[10px] text-dark-text-secondary">
                        💡 Совет: Если RSS фид не загружается, попробуйте найти RSS ссылку конкретного подкаста на его официальном сайте или в подкаст-приложениях.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Жанры (через запятую, опционально)</label>
                    <input
                      type="text"
                      value={podcastGenres}
                      onChange={(e) => setPodcastGenres(e.target.value)}
                      className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:border-white transition-colors"
                      placeholder="Например: Технологии, Бизнес, Образование"
                    />
                    <p className="text-xs text-dark-text-secondary mt-1">
                      Если не указать, жанры будут взяты из RSS фида
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Название подкаста *</label>
                    <input
                      type="text"
                      value={podcastTitle}
                      onChange={(e) => setPodcastTitle(e.target.value)}
                      className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:border-white transition-colors"
                      placeholder="Введите название подкаста"
                      required={!importMode}
                    />
                  </div>

              <div>
                <label className="block text-sm font-medium mb-2">Описание</label>
                <textarea
                  value={podcastDescription}
                  onChange={(e) => setPodcastDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:border-white transition-colors resize-none"
                  placeholder="Введите описание подкаста"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Автор *</label>
                <input
                  type="text"
                  value={podcastAuthor}
                  onChange={(e) => setPodcastAuthor(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:border-white transition-colors"
                  placeholder="Введите имя автора"
                  required={!importMode}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Жанры (через запятую)</label>
                <input
                  type="text"
                  value={podcastGenres}
                  onChange={(e) => setPodcastGenres(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:border-white transition-colors"
                  placeholder="Например: Технологии, Бизнес, Образование"
                />
              </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Обложка (опционально)</label>
                    <label className="flex items-center gap-3 px-4 py-3 bg-dark-surface border border-dark-border rounded-lg cursor-pointer hover:bg-dark-hover transition-colors">
                      <Music className="w-5 h-5 text-dark-text-secondary" />
                      <span className="text-dark-text-secondary">
                        {podcastCoverFile ? podcastCoverFile.name : 'Выберите обложку (jpg, png)'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPodcastCoverFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </>
              )}
            </>
          )}

          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}

          {success && (
            <div className="text-green-400 text-sm">
              {uploadType === 'track' 
                ? 'Трек успешно загружен!' 
                : importMode 
                  ? 'Подкаст успешно импортирован из RSS!' 
                  : 'Подкаст успешно создан!'}
            </div>
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
              {loading ? 'Загрузка...' : 'Загрузить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

