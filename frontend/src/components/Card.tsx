import { ReactNode } from 'react'
import clsx from 'clsx'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export default function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-dark-card backdrop-blur-sm border border-dark-border rounded-card p-4 hover:bg-dark-hover hover:border-dark-accent/50 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl hover:shadow-dark-accent/20',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}


