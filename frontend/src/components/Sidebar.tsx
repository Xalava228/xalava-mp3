import { Link, useLocation } from 'react-router-dom'
import { Home, Search, Heart, Upload, LogIn, UserPlus, Music2 } from 'lucide-react'
import clsx from 'clsx'
import { useState } from 'react'
import UploadModal from './UploadModal'
import { useAuthStore } from '../store/authStore'

const navigation = [
  { name: 'Главная', href: '/', icon: Home },
  { name: 'Поиск', href: '/search', icon: Search },
  { name: 'Избранное', href: '/library', icon: Heart },
]

export default function Sidebar() {
  const location = useLocation()
  const { user, openLoginModal } = useAuthStore()
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  return (
    <>
      <div className="fixed left-0 top-0 h-full w-60 glass border-r border-dark-border/50 flex flex-col z-30 pb-24 max-md:w-0 max-md:overflow-hidden">
        {/* Logo */}
        <div className="p-5 pb-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-accent flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-shadow">
              <Music2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-none">
                Xalava
              </h1>
              <span className="text-[10px] font-medium text-dark-accent tracking-widest uppercase">.music</span>
            </div>
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-3">
          <p className="text-[11px] font-semibold text-dark-text-muted uppercase tracking-wider px-3 mb-2">Меню</p>
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              const isLibrary = item.href === '/library'
              const needsAuth = isLibrary && !user
              
              if (needsAuth) {
                return (
                  <li key={item.name}>
                    <button
                      onClick={() => openLoginModal('login')}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left text-dark-text-secondary hover:text-white hover:bg-dark-hover/50 transition-all"
                    >
                      <item.icon className="w-[18px] h-[18px]" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </button>
                  </li>
                )
              }
              
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative group',
                      isActive
                        ? 'text-white bg-dark-card'
                        : 'text-dark-text-secondary hover:text-white hover:bg-dark-hover/50'
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-accent rounded-r-full" />
                    )}
                    <item.icon className={clsx('w-[18px] h-[18px]', isActive && 'text-dark-accent')} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-dark-border to-transparent my-5" />

          {/* User section */}
          <p className="text-[11px] font-semibold text-dark-text-muted uppercase tracking-wider px-3 mb-2">Аккаунт</p>
          {user ? (
            <Link
              to="/profile"
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
                location.pathname === '/profile'
                  ? 'text-white bg-dark-card'
                  : 'text-dark-text-secondary hover:text-white hover:bg-dark-hover/50'
              )}
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-accent flex items-center justify-center">
                <span className="text-xs font-bold text-white">{user.name?.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium truncate block">{user.name}</span>
              </div>
            </Link>
          ) : (
            <div className="space-y-1">
              <button
                onClick={() => openLoginModal('login')}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-dark-text-secondary hover:text-white hover:bg-dark-hover/50 transition-all"
              >
                <LogIn className="w-[18px] h-[18px]" />
                <span className="text-sm font-medium">Войти</span>
              </button>
              <button
                onClick={() => openLoginModal('register')}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-dark-text-secondary hover:text-white hover:bg-dark-hover/50 transition-all"
              >
                <UserPlus className="w-[18px] h-[18px]" />
                <span className="text-sm font-medium">Регистрация</span>
              </button>
            </div>
          )}
        </nav>

        {/* Upload section */}
        <div className="p-3 mt-auto">
          {user ? (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-accent hover:shadow-glow text-white font-semibold rounded-xl transition-all text-sm hover-lift"
            >
              <Upload className="w-4 h-4" />
              <span>Загрузить</span>
            </button>
          ) : (
            <div className="text-center px-3 py-4 rounded-xl bg-dark-card/50 border border-dashed border-dark-border">
              <p className="text-dark-text-muted text-xs">
                Войдите, чтобы загружать музыку
              </p>
            </div>
          )}
        </div>
      </div>
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </>
  )
}
