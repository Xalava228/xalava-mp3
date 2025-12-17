import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { usePlayerStore } from './store/playerStore'
import Sidebar from './components/Sidebar'
import MobileMenu from './components/MobileMenu'
import BottomPlayer from './components/BottomPlayer'
import AudioPlayer from './components/AudioPlayer'
import LoginModal from './components/LoginModal'
import Home from './pages/Home'
import Search from './pages/Search'
import Library from './pages/Library'
import Podcast from './pages/Podcast'
import Episode from './pages/Episode'
import Login from './pages/Login'
import Profile from './pages/Profile'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  const { init, isAuthenticated, showLoginModal, closeLoginModal, openLoginModal } = useAuthStore()

  useEffect(() => {
    init()
  }, [init])

  useEffect(() => {
    // Показываем модальное окно при первом заходе, если пользователь не авторизован
    if (!isAuthenticated && !localStorage.getItem('loginModalShown')) {
      openLoginModal('login')
      localStorage.setItem('loginModalShown', 'true')
    }
  }, [isAuthenticated, openLoginModal])

  // Останавливаем воспроизведение при закрытии вкладки/браузера
  useEffect(() => {
    const handleBeforeUnload = () => {
      usePlayerStore.getState().stop()
    }

    const handleVisibilityChange = () => {
      // Останавливаем воспроизведение при скрытии вкладки (опционально)
      // Можно раскомментировать, если нужно останавливать при переключении вкладок
      // if (document.hidden) {
      //   usePlayerStore.getState().pause()
      // }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return (
    <div className="min-h-screen bg-dark-bg">
      <AudioPlayer />
      <MobileMenu />
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={closeLoginModal} 
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <div className="flex">
              <Sidebar />
              <main className="flex-1 ml-60 min-h-screen max-md:ml-0 max-md:pt-16">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/search" element={<Search />} />
                  <Route
                    path="/library"
                    element={
                      <ProtectedRoute>
                        <Library />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/podcast/:id" element={<Podcast />} />
                  <Route path="/episode/:id" element={<Episode />} />
                </Routes>
              </main>
            </div>
          }
        />
      </Routes>
      <BottomPlayer />
    </div>
  )
}

export default App


