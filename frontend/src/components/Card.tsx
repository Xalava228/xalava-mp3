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
        'bg-dark-card rounded-xl p-4 hover:bg-dark-hover transition-all cursor-pointer hover-lift border border-transparent hover:border-dark-border/50',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
