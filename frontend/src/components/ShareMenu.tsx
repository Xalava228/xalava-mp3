import { useState, useRef, useEffect } from 'react'
import { Copy, Check, X, Facebook, Twitter, Send, Users } from 'lucide-react'

interface ShareMenuProps {
  url: string
  title: string
  description?: string
  onClose: () => void
}

export default function ShareMenu({ url, title, description, onClose }: ShareMenuProps) {
  const [copied, setCopied] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
        onClose()
      }, 1500)
    } catch (err) {
      console.error('Ошибка копирования:', err)
    }
  }

  const shareText = description ? `${title} - ${description}` : title
  const encodedUrl = encodeURIComponent(url)
  const encodedText = encodeURIComponent(shareText)

  const shareLinks = {
    vk: `https://vk.com/share.php?url=${encodedUrl}&title=${encodedText}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  }

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        ref={menuRef}
        className="bg-dark-card rounded-card p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Поделиться</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-dark-text-secondary" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Копировать ссылку */}
          <button
            onClick={handleCopy}
            className="w-full flex items-center gap-3 px-4 py-3 bg-dark-surface hover:bg-dark-hover border border-dark-border rounded-lg transition-all duration-300 group"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-green-400">Скопировано!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 text-dark-text-secondary group-hover:text-white" />
                <span className="text-dark-text-secondary group-hover:text-white">
                  Копировать ссылку
                </span>
              </>
            )}
          </button>

          {/* Социальные сети */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleShare('vk')}
              className="flex flex-col items-center justify-center gap-2 px-4 py-4 bg-dark-surface hover:bg-[#4680C2] border border-dark-border hover:border-[#4680C2] rounded-lg transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-full bg-[#4680C2]/20 group-hover:bg-white/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-[#4680C2] group-hover:text-white" />
              </div>
              <span className="text-sm font-medium text-dark-text-secondary group-hover:text-white">ВКонтакте</span>
            </button>

            <button
              onClick={() => handleShare('telegram')}
              className="flex flex-col items-center justify-center gap-2 px-4 py-4 bg-dark-surface hover:bg-[#0088cc] border border-dark-border hover:border-[#0088cc] rounded-lg transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-full bg-[#0088cc]/20 group-hover:bg-white/20 flex items-center justify-center">
                <Send className="w-6 h-6 text-[#0088cc] group-hover:text-white" />
              </div>
              <span className="text-sm font-medium text-dark-text-secondary group-hover:text-white">Telegram</span>
            </button>

            <button
              onClick={() => handleShare('twitter')}
              className="flex flex-col items-center justify-center gap-2 px-4 py-4 bg-dark-surface hover:bg-[#1DA1F2] border border-dark-border hover:border-[#1DA1F2] rounded-lg transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-full bg-[#1DA1F2]/20 group-hover:bg-white/20 flex items-center justify-center">
                <Twitter className="w-6 h-6 text-[#1DA1F2] group-hover:text-white" />
              </div>
              <span className="text-sm font-medium text-dark-text-secondary group-hover:text-white">Twitter</span>
            </button>

            <button
              onClick={() => handleShare('facebook')}
              className="flex flex-col items-center justify-center gap-2 px-4 py-4 bg-dark-surface hover:bg-[#1877F2] border border-dark-border hover:border-[#1877F2] rounded-lg transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-full bg-[#1877F2]/20 group-hover:bg-white/20 flex items-center justify-center">
                <Facebook className="w-6 h-6 text-[#1877F2] group-hover:text-white" />
              </div>
              <span className="text-sm font-medium text-dark-text-secondary group-hover:text-white">Facebook</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

