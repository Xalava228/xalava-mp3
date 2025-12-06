import { Link, useLocation } from 'react-router-dom'
import { Home, Search, Library, Upload, User } from 'lucide-react'
import clsx from 'clsx'
import { useState } from 'react'
import UploadModal from './UploadModal'
import { useAuthStore } from '../store/authStore'

const navigation = [
  { name: 'Главная', href: '/', icon: Home },
  { name: 'Поиск', href: '/search', icon: Search },
  { name: 'Библиотека', href: '/library', icon: Library },
]

export default function Sidebar() {
  const location = useLocation()
  const { user } = useAuthStore()
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  return (
    <>
      <div className="fixed left-0 top-0 h-full w-64 bg-dark-surface/95 backdrop-blur-xl border-r border-dark-border flex flex-col z-30 pb-24 shadow-2xl">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent">
            Xalava.mp3
          </h1>
        </div>
        <nav className="flex-1 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300',
                      isActive
                        ? 'bg-gradient-to-r from-dark-accent to-dark-accent-secondary text-white shadow-lg shadow-dark-accent/30'
                        : 'text-dark-text-secondary hover:bg-dark-hover hover:text-white hover:translate-x-1'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
          {user && (
            <Link
              to="/profile"
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mt-2',
                location.pathname === '/profile'
                  ? 'bg-dark-hover text-white'
                  : 'text-dark-text-secondary hover:bg-dark-hover hover:text-white'
              )}
            >
              <User className="w-5 h-5" />
              <span className="font-medium">Личный кабинет</span>
            </Link>
          )}
        </nav>
        <div className="p-4 border-t border-dark-border mt-auto">
          {user && (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-dark-accent to-dark-accent-secondary hover:from-dark-accent-secondary hover:to-dark-accent text-white rounded-lg transition-all duration-300 font-medium mb-2 shadow-lg hover:shadow-xl hover:shadow-dark-accent/30 hover:scale-105"
            >
              <Upload className="w-5 h-5" />
              <span>Загрузить контент</span>
            </button>
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


