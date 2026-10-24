import type { ReactNode } from 'react'

interface MessageProps {
  title: string
  description?: string
  action?: ReactNode
  tone?: 'neutral' | 'error'
}

// Empty and error states
export function Message({ title, description, action, tone = 'neutral' }: MessageProps) {
  return (
    <div
      role={tone === 'error' ? 'alert' : undefined}
      className="flex flex-col items-center gap-2 py-16 text-center"
    >
      <h2
        className={`text-lg font-semibold ${tone === 'error' ? 'text-red-700' : 'text-slate-800'}`}
      >
        {title}
      </h2>
      {description && <p className="max-w-md text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
