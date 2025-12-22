import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayerStore } from '../store/playerStore'

export default function KeyboardShortcuts() {
  const navigate = useNavigate()
  const { openNowPlaying, currentTrack } = usePlayerStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Игнорируем, если пользователь вводит текст
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      // Ctrl/Cmd + K - быстрый поиск
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        navigate('/search')
        // Фокусируемся на поле поиска после небольшой задержки
        setTimeout(() => {
          const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement
          if (searchInput) {
            searchInput.focus()
          }
        }, 100)
        return
      }

      // Ctrl/Cmd + H - главная
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault()
        navigate('/')
        return
      }

      // Ctrl/Cmd + L - библиотека/избранное
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault()
        navigate('/library')
        return
      }

      // Ctrl/Cmd + P - профиль
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault()
        navigate('/profile')
        return
      }

      // ? - показать справку (можно добавить модальное окно)
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        // Можно добавить модальное окно со справкой
        console.log('Горячие клавиши: Ctrl+K - поиск, Ctrl+H - главная, Ctrl+L - библиотека, Ctrl+P - профиль')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate, openNowPlaying, currentTrack])

  return null
}

