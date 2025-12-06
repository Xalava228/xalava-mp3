interface ProgressBarProps {
  progress: number // 0-100
  className?: string
}

export default function ProgressBar({ progress, className = '' }: ProgressBarProps) {
  return (
    <div className={`h-1 bg-dark-border rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full bg-gradient-to-r from-dark-accent to-dark-accent-secondary transition-all"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  )
}


