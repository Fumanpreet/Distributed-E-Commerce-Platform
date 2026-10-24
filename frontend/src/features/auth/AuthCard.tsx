import type { ReactNode } from 'react'

export function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto mt-12 max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-2xl font-semibold">{title}</h1>
      {children}
    </div>
  )
}
