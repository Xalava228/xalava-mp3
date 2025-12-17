import { useState, useEffect } from 'react'
import { X, Eye, EyeOff, Music2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../api/auth'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { loginModalMode, openLoginModal } = useAuthStore()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { setAuth } = useAuthStore()

  useEffect(() => {
    setIsLogin(loginModalMode === 'login')
  }, [loginModalMode, isOpen])

  useEffect(() => {
    if (isOpen) {
      setError('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setName('')
      setIsLogin(loginModalMode === 'login')
    }
  }, [isOpen, loginModalMode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        const response = await authApi.login(email, password)
        setAuth(response.user, response.token)
        onClose()
      } else {
        if (!name || name.trim().length < 2) {
          setError('Имя должно содержать минимум 2 символа')
          setLoading(false)
          return
        }

        if (password.length < 6) {
          setError('Пароль должен содержать минимум 6 символов')
          setLoading(false)
          return
        }

        if (password !== confirmPassword) {
          setError('Пароли не совпадают')
          setLoading(false)
          return
        }

        const response = await authApi.register(email, password, name)
        setAuth(response.user, response.token)
        onClose()
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass border border-dark-border/50 rounded-2xl w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-dark-text-muted hover:text-white transition-colors rounded-lg hover:bg-dark-hover"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-accent mx-auto mb-4 flex items-center justify-center shadow-glow">
            <Music2 className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">
            {isLogin ? 'С возвращением!' : 'Создать аккаунт'}
          </h2>
          <p className="text-dark-text-secondary text-sm">
            {isLogin ? 'Войдите, чтобы продолжить' : 'Присоединяйтесь к Xalava.music'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-1.5 text-dark-text-secondary">Имя</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-xl text-white placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-dark-accent focus:border-transparent transition-all"
                placeholder="Ваше имя"
                required
                minLength={2}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5 text-dark-text-secondary">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-xl text-white placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-dark-accent focus:border-transparent transition-all"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-dark-text-secondary">Пароль</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 pr-12 bg-dark-card border border-dark-border rounded-xl text-white placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-dark-accent focus:border-transparent transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-text-muted hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-1.5 text-dark-text-secondary">Подтвердите пароль</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 pr-12 bg-dark-card border border-dark-border rounded-xl text-white placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-dark-accent focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-text-muted hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-400 text-sm bg-red-400/10 px-4 py-3 rounded-xl border border-red-400/20">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-accent hover:shadow-glow text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>

          <div className="relative my-6">
            <div className="h-px bg-dark-border" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 bg-dark-surface text-dark-text-muted text-xs">или</span>
          </div>

          <button
            type="button"
            onClick={() => {
              const newMode = isLogin ? 'register' : 'login'
              openLoginModal(newMode)
              setIsLogin(!isLogin)
              setError('')
              setConfirmPassword('')
            }}
            className="w-full py-3 border border-dark-border text-dark-text-secondary hover:text-white hover:border-dark-text-secondary rounded-xl transition-all text-sm font-medium"
          >
            {isLogin ? 'Создать аккаунт' : 'У меня уже есть аккаунт'}
          </button>
        </form>
      </div>
    </div>
  )
}
