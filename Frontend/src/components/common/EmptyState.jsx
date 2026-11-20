import { createElement } from 'react'
import { Inbox } from 'lucide-react'

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description = 'When there is something to show, it will appear here.',
  action,
}) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
      <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        {createElement(Icon, { 'aria-hidden': true, className: 'size-5' })}
      </div>
      <h3 className="text-sm font-semibold text-ink-950">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-6 text-slate-500">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
