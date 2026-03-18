import { cn } from './cn.js'

export function Card({ className, ...props }) {
  return <div className={cn('rounded-xl border border-border bg-card shadow-soft', className)} {...props} />
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('border-b border-border px-5 py-4', className)} {...props} />
}

export function CardBody({ className, ...props }) {
  return <div className={cn('px-5 py-4', className)} {...props} />
}

export function Button({ className, variant = 'default', size = 'md', ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-md border text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-bg disabled:opacity-60 disabled:pointer-events-none'
  const variants = {
    default: 'border-border bg-card hover:bg-card/80',
    primary: 'border-transparent bg-primary text-primary-fg hover:opacity-95',
    ghost: 'border-transparent bg-transparent hover:bg-card/70',
    destructive: 'border-transparent bg-destructive text-destructive-fg hover:opacity-95',
  }
  const sizes = {
    sm: 'h-9 px-3',
    md: 'h-10 px-4',
    lg: 'h-11 px-5',
  }
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />
}

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none placeholder:text-muted focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-bg',
        className,
      )}
      {...props}
    />
  )
}

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        'w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none placeholder:text-muted focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-bg',
        className,
      )}
      {...props}
    />
  )
}

export function Select({ className, ...props }) {
  return (
    <select
      className={cn(
        'h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-bg',
        className,
      )}
      {...props}
    />
  )
}

export function Badge({ className, variant = 'default', ...props }) {
  const variants = {
    default: 'border-border bg-card text-muted',
    ok: 'border-success/30 bg-success/15 text-success-fg',
    warn: 'border-yellow-500/30 bg-yellow-500/15 text-yellow-200',
    bad: 'border-destructive/30 bg-destructive/15 text-destructive-fg',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}

export function Label({ className, ...props }) {
  return <label className={cn('text-xs font-medium text-muted', className)} {...props} />
}

