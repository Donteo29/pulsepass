import clsx from 'clsx'
import { AlertCircle, CheckCircle2, LoaderCircle, Ticket, type LucideIcon } from 'lucide-react'
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import type { EventStatus, TicketStatus } from '../lib/tipos'
import { ESTADOS_EVENTO, ESTADOS_TICKET } from '../lib/tipos'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-marca-600 text-white shadow-sm hover:bg-marca-700',
  secondary: 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
}
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: ButtonVariant; loading?: boolean }
export function Button({ variant = 'primary', loading = false, className, children, disabled, ...props }: ButtonProps) {
  return <button className={clsx('inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:cursor-not-allowed disabled:opacity-55', buttonVariants[variant], className)} disabled={disabled || loading} {...props}>
    {loading && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}{children}
  </button>
}

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> { label: string; error?: string; hint?: string }
export function Campo({ label, error, hint, id, className, ...props }: FieldProps) {
  const fieldId = id ?? props.name ?? label.trim().toLocaleLowerCase().replaceAll(' ', '-')
  const messageId = `${fieldId}-message`
  return <label htmlFor={fieldId} className="block space-y-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
    <span>{label}</span>
    <input id={fieldId} aria-invalid={Boolean(error)} aria-describedby={error || hint ? messageId : undefined} className={clsx('min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 outline-none placeholder:text-slate-400 focus-visible:border-marca-600 focus-visible:outline-2 focus-visible:outline-marca-600/25 dark:border-slate-700 dark:bg-slate-900 dark:text-white', error && 'border-red-500 focus-visible:border-red-500 focus-visible:outline-red-500/25', className)} {...props} />
    {error && <span id={messageId} className="block text-sm font-normal text-red-600 dark:text-red-400">{error}</span>}
    {!error && hint && <span id={messageId} className="block text-xs font-normal text-slate-500 dark:text-slate-400">{hint}</span>}
  </label>
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> { label: string; error?: string; children: ReactNode }
export function Selector({ label, error, id, className, children, ...props }: SelectProps) {
  const fieldId = id ?? props.name ?? label.trim().toLocaleLowerCase().replaceAll(' ', '-')
  const errorId = `${fieldId}-error`
  return <label htmlFor={fieldId} className="block space-y-1.5 text-sm font-medium text-slate-700 dark:text-slate-200"><span>{label}</span>
    <select id={fieldId} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} className={clsx('min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 outline-none focus-visible:border-marca-600 focus-visible:outline-2 focus-visible:outline-marca-600/25 dark:border-slate-700 dark:bg-slate-900 dark:text-white', className)} {...props}>{children}</select>
    {error && <span id={errorId} className="block text-sm font-normal text-red-600">{error}</span>}
  </label>
}

const eventBadgeClasses: Record<EventStatus, string> = {
  DRAFT: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  PUBLISHED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  SOLD_OUT: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
  FINISHED: 'bg-slate-300 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
}
const ticketBadgeClasses: Record<TicketStatus, string> = {
  RESERVED: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200',
  PAID: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  USED: 'bg-slate-300 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
}
export function Badge({ status }: { status: EventStatus | TicketStatus }) {
  const isEvent = status in ESTADOS_EVENTO
  const label = isEvent ? ESTADOS_EVENTO[status as EventStatus] : ESTADOS_TICKET[status as TicketStatus]
  return <span className={clsx('inline-flex rounded-full px-2.5 py-1 text-xs font-semibold', isEvent ? eventBadgeClasses[status as EventStatus] : ticketBadgeClasses[status as TicketStatus])}>{label}</span>
}

export function Tarjeta({ children, className }: { children: ReactNode; className?: string }) {
  return <article className={clsx('overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900', className)}>{children}</article>
}
export function EstadoCargando({ label = 'Cargando información' }: { label?: string }) {
  return <div aria-busy="true" className="space-y-4" role="status"><span className="sr-only">{label}</span><div className="h-40 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800"/><div className="h-5 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800"/><div className="h-4 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-800"/></div>
}
export function EstadoError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100"><p className="flex items-center gap-2 font-semibold"><AlertCircle aria-hidden="true" className="size-5"/>{message}</p>{onRetry && <button onClick={onRetry} className="mt-3 min-h-11 underline underline-offset-4">Intentar de nuevo</button>}</div>
}
export function EstadoVacio({ icon: Icon = Ticket, title, body, action }: { icon?: LucideIcon; title: string; body: string; action?: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900/60"><Icon aria-hidden="true" className="mx-auto size-9 text-marca-600"/><h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">{title}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">{body}</p>{action && <div className="mt-5">{action}</div>}</div>
}
export function PrecioCOP({ value }: { value: number }) {
  return <>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)}</>
}
export function Aviso({ children, type = 'error' }: { children: ReactNode; type?: 'success' | 'error' | 'info' }) {
  const Icon = type === 'success' ? CheckCircle2 : AlertCircle
  const classes = type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100' : type === 'error' ? 'border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100' : 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-100'
  return <div role={type === 'error' ? 'alert' : 'status'} aria-live="polite" className={clsx('flex items-start gap-2 rounded-xl border px-4 py-3 text-sm', classes)}><Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0"/>{children}</div>
}
