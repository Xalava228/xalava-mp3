import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Search, Heart, Upload, User, X, Menu, LogIn, UserPlus, Music2 } from 'lucide-react'
import clsx from 'clsx'
import UploadModal from './UploadModal'
import { useAuthStore } from '../store/authStore'

const navigation = [
  { name: 'Главная', href: '/', icon: Home },
  { name: 'Поиск', href: '/search', icon: Search },
  { name: 'Избранное', href: '/library', icon: Heart },
]

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const { user, openLoginModal } = useAuthStore()
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2.5 glass rounded-xl text-white md:hidden border border-dark-border/50"
        aria-label="Меню"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu Sidebar */}
      <div
        className={clsx(
          'fixed left-0 top-0 h-full w-72 glass border-r border-dark-border/50 flex flex-col z-40 transition-transform duration-300 md:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-5">
          <div className="flex items-center justify-between">
            <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center">
                <Music2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white leading-none">Xalava</h1>
                <span className="text-[9px] font-medium text-dark-accent tracking-widest uppercase">.music</span>
              </div>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-dark-text-secondary hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <nav className="flex-1 px-3 overflow-y-auto">
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
                      onClick={() => {
                        openLoginModal('login')
                        setIsOpen(false)
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-dark-text-secondary hover:text-white hover:bg-dark-hover/50 transition-all"
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </button>
                  </li>
                )
              }
              
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative',
                      isActive
                        ? 'text-white bg-dark-card'
                        : 'text-dark-text-secondary hover:text-white hover:bg-dark-hover/50'
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-accent rounded-r-full" />
                    )}
                    <item.icon className={clsx('w-5 h-5', isActive && 'text-dark-accent')} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>

          <div className="h-px bg-gradient-to-r from-transparent via-dark-border to-transparent my-5" />

          <p className="text-[11px] font-semibold text-dark-text-muted uppercase tracking-wider px-3 mb-2">Аккаунт</p>
          {user ? (
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
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
              <span className="text-sm font-medium">{user.name}</span>
            </Link>
          ) : (
            <div className="space-y-1">
              <button
                onClick={() => {
                  openLoginModal('login')
                  setIsOpen(false)
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-dark-text-secondary hover:text-white hover:bg-dark-hover/50 transition-all"
              >
                <LogIn className="w-5 h-5" />
                <span className="text-sm font-medium">Войти</span>
              </button>
              <button
                onClick={() => {
                  openLoginModal('register')
                  setIsOpen(false)
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-dark-text-secondary hover:text-white hover:bg-dark-hover/50 transition-all"
              >
                <UserPlus className="w-5 h-5" />
                <span className="text-sm font-medium">Регистрация</span>
              </button>
            </div>
          )}
        </nav>

        <div className="p-3">
          {user ? (
            <button
              onClick={() => {
                setIsUploadModalOpen(true)
                setIsOpen(false)
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-accent hover:shadow-glow text-white font-semibold rounded-xl transition-all text-sm"
            >
              <Upload className="w-4 h-4" />
              <span>Загрузить</span>
            </button>
          ) : (
            <div className="text-center px-3 py-4 rounded-xl bg-dark-card/50 border border-dashed border-dark-border">
              <p className="text-dark-text-muted text-xs">Войдите, чтобы загружать музыку</p>
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
