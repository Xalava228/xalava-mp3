import { useState, useEffect } from 'react'
import { X, Upload, Music } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { tracksApi } from '../api/tracks'
import { podcastsApi } from '../api/podcasts'
import { Track, Podcast } from '../types'

interface EditModalProps {
  isOpen: boolean
  onClose: () => void
  item: Track | Podcast | null
  type: 'track' | 'podcast'
}

export default function EditModal({ isOpen, onClose, item, type }: EditModalProps) {
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [description, setDescription] = useState('')
  const [author, setAuthor] = useState('')
  const [genres, setGenres] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const queryClient = useQueryClient()

  useEffect(() => {
    if (item && isOpen) {
      if (type === 'track') {
        const track = item as Track
        setTitle(track.title)
        setArtist(track.artist)
        setDescription(track.description || '')
        setCoverPreview(track.coverUrl)
      } else {
        const podcast = item as Podcast
        setTitle(podcast.title)
        setDescription(podcast.description || '')
        setAuthor(podcast.author)
        setGenres(podcast.genres?.join(', ') || '')
        setCoverPreview(podcast.coverUrl)
      }
      setCoverFile(null)
      setAudioFile(null)
      setError('')
      setSuccess(false)
    }
  }, [item, isOpen, type])

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAudioFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!item) return

    if (type === 'track') {
      if (!title || !artist) {
        setError('Заполните название и исполнителя')
        return
      }
    } else {
      if (!title || !author) {
        setError('Заполните название и автора')
        return
      }
    }

    setLoading(true)

    try {
      if (type === 'track') {
        await tracksApi.update(item.id, {
          title: title.trim(),
          artist: artist.trim(),
          description: description.trim() || '', // Отправляем пустую строку если описание пустое
          cover: coverFile || undefined,
          audio: audioFile || undefined,
        })
        queryClient.invalidateQueries({ queryKey: ['tracks'] })
        queryClient.invalidateQueries({ queryKey: ['recommendations'] })
      } else {
        await podcastsApi.update(item.id, {
          title,
          description,
          author,
          genres: genres || undefined,
          cover: coverFile || undefined,
        })
        queryClient.invalidateQueries({ queryKey: ['podcasts'] })
      }

      setSuccess(true)
      setTimeout(() => {
        onClose()
        setSuccess(false)
      }, 2000)
    } catch (err: any) {
      console.error('Ошибка обновления:', err)
      setError(err.response?.data?.message || 'Ошибка при обновлении')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !item) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-card rounded-card w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-dark-text-secondary hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">
            Редактировать {type === 'track' ? 'трек' : 'подкаст'}
          </h2>
          <p className="text-sm text-dark-text-secondary">
            Измените нужные поля и нажмите "Сохранить"
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cover Preview */}
          <div className="flex flex-col items-center mb-4">
            <label className="block text-sm font-medium mb-2">Обложка</label>
            <div className="relative group">
              <img
                src={coverPreview}
                alt="Cover"
                className="w-32 h-32 rounded-card object-cover border-2 border-dark-border"
              />
              <label className="absolute inset-0 bg-black/50 rounded-card flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <div className="text-center">
                  <Upload className="w-6 h-6 text-white mx-auto mb-1" />
                  <span className="text-xs text-white">Нажмите для замены</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-dark-text-secondary mt-2 text-center">
              Наведите на обложку и нажмите для загрузки новой
            </p>
          </div>

          {type === 'track' ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Название трека *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:border-white transition-colors"
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
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Описание</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:border-white transition-colors resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Аудио файл</label>
                <label className="flex items-center gap-3 px-4 py-3 bg-dark-surface border border-dark-border rounded-lg cursor-pointer hover:bg-dark-hover transition-colors">
                  <Music className="w-5 h-5 text-dark-text-secondary" />
                  <span className="text-dark-text-secondary">
                    {audioFile ? audioFile.name : 'Выберите новый аудио файл (mp3, wav, ogg, m4a)'}
                  </span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-dark-text-secondary mt-1">
                  Оставьте пустым, чтобы не менять аудио файл
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Название подкаста *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:border-white transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Описание</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:border-white transition-colors resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Автор *</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:border-white transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Жанры (через запятую)</label>
                <input
                  type="text"
                  value={genres}
                  onChange={(e) => setGenres(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:border-white transition-colors"
                  placeholder="Например: Технологии, Бизнес"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Обложка</label>
            <label className="flex items-center gap-3 px-4 py-3 bg-dark-surface border border-dark-border rounded-lg cursor-pointer hover:bg-dark-hover transition-colors">
              <Music className="w-5 h-5 text-dark-text-secondary" />
              <span className="text-dark-text-secondary">
                {coverFile ? coverFile.name : 'Выберите новую обложку (jpg, png)'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
              />
            </label>
            <p className="text-xs text-dark-text-secondary mt-1">
              Оставьте пустым, чтобы не менять обложку
            </p>
          </div>

          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}

          {success && (
            <div className="text-green-400 text-sm">
              {type === 'track' ? 'Трек успешно обновлён!' : 'Подкаст успешно обновлён!'}
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
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

