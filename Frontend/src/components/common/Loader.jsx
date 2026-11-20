import { LoaderCircle } from 'lucide-react'

export function LoadingSkeleton({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`}
    />
  )
}

export default function Loader({ label = 'Loading', fullScreen = false }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center justify-center gap-2 text-sm text-slate-500 ${fullScreen ? 'min-h-screen' : 'min-h-32'}`}
    >
      <LoaderCircle aria-hidden="true" className="size-5 animate-spin text-brand-600" />
      <span>{label}…</span>
    </div>
  )
}
