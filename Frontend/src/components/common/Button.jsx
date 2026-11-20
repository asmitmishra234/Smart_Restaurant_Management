import { createElement } from 'react'
import { motion } from 'motion/react'
import { LoaderCircle } from 'lucide-react'

const variants = {
  primary:
    'bg-brand-600 text-white shadow-sm hover:bg-brand-700 focus-visible:ring-brand-500',
  secondary:
    'bg-brand-50 text-brand-700 hover:bg-brand-100 focus-visible:ring-brand-500',
  outline:
    'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-brand-500',
  ghost:
    'text-slate-600 hover:bg-slate-100 hover:text-ink-950 focus-visible:ring-brand-500',
  danger:
    'bg-rose-600 text-white shadow-sm hover:bg-rose-700 focus-visible:ring-rose-500',
}

const sizes = {
  sm: 'min-h-9 px-3 text-sm',
  md: 'min-h-10 px-4 text-sm',
  lg: 'min-h-11 px-5 text-base',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  children,
  type = 'button',
  ...props
}) {
  const isDisabled = disabled || loading

  return createElement(
    motion.button,
    {
      ...props,
      type,
      disabled: isDisabled,
      whileHover: isDisabled ? undefined : { y: -1 },
      whileTap: isDisabled ? undefined : { scale: 0.98 },
      transition: { duration: 0.15 },
      className: `inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-55 ${variants[variant] ?? variants.primary} ${sizes[size] ?? sizes.md} ${className}`,
    },
    loading && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />,
    children,
  )
}
