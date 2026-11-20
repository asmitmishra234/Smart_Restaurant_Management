import { createElement, useEffect, useId } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}) {
  const titleId = useId()
  const descriptionId = useId()
  const width = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }[size] ?? 'max-w-lg'

  useEffect(() => {
    if (!isOpen) return undefined

    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen &&
        createElement(
          motion.div,
          {
            className:
              'fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4 sm:p-6',
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            transition: { duration: 0.16 },
            onMouseDown: (event) => {
              if (event.target === event.currentTarget) onClose()
            },
          },
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px]" />,
          createElement(
            motion.section,
            {
              role: 'dialog',
              'aria-modal': true,
              'aria-labelledby': titleId,
              'aria-describedby': description ? descriptionId : undefined,
              className: `relative my-auto w-full ${width} overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl`,
              initial: { opacity: 0, y: 12, scale: 0.98 },
              animate: { opacity: 1, y: 0, scale: 1 },
              exit: { opacity: 0, y: 8, scale: 0.98 },
              transition: { duration: 0.18, ease: 'easeOut' },
            },
            <>
              <header className="flex items-start justify-between gap-5 border-b border-slate-100 px-5 py-4 sm:px-6">
                <div>
                  <h2 id={titleId} className="text-lg font-semibold text-ink-950">
                    {title}
                  </h2>
                  {description && (
                    <p id={descriptionId} className="mt-1 text-sm text-slate-500">
                      {description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  aria-label="Close dialog"
                  onClick={onClose}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <X aria-hidden="true" className="size-4" />
                </button>
              </header>
              {children && (
                <div className="max-h-[min(70vh,42rem)] overflow-y-auto px-5 py-5 sm:px-6">
                  {children}
                </div>
              )}
              {footer && (
                <footer className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                  {footer}
                </footer>
              )}
            </>,
          ),
        )}
    </AnimatePresence>
  )
}
