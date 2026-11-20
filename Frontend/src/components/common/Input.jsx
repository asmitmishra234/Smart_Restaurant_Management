import { forwardRef, useId } from 'react'

const Input = forwardRef(function Input(
  {
    label,
    description,
    error,
    leadingIcon: LeadingIcon,
    trailingContent,
    className = '',
    id: providedId,
    ...props
  },
  ref,
) {
  const generatedId = useId()
  const id = providedId ?? generatedId
  const hintId = description ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        {LeadingIcon && (
          <LeadingIcon
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          />
        )}
        <input
          ref={ref}
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`min-h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-ink-950 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-50 ${LeadingIcon ? 'pl-10' : ''} ${error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-200'} ${className}`}
          {...props}
        />
        {trailingContent && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            {trailingContent}
          </div>
        )}
      </div>
      {description && !error && (
        <p id={hintId} className="text-xs text-slate-500">
          {description}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs text-rose-600">
          {error}
        </p>
      )}
    </div>
  )
})

export default Input
