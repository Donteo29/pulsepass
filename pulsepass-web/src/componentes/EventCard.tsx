import { ArrowUpRight, CalendarDays, GraduationCap, Landmark, MapPin, Monitor, Music2, Star, Trophy } from 'lucide-react'
import { Link } from 'react-router'
import type { Event, EventCategory } from '../lib/tipos'
import { CATEGORIAS } from '../lib/tipos'
import { RUTAS } from '../lib/rutas'
import { Badge, Tarjeta } from './ui'

const posterStyles: Record<EventCategory, { fondo: string; icono: string; Icon: typeof Music2 }> = {
  MUSIC: { fondo: 'bg-indigo-100 dark:bg-indigo-950', icono: 'text-indigo-700 dark:text-indigo-300', Icon: Music2 },
  SPORTS: { fondo: 'bg-emerald-100 dark:bg-emerald-950', icono: 'text-emerald-700 dark:text-emerald-300', Icon: Trophy },
  TECHNOLOGY: { fondo: 'bg-sky-100 dark:bg-sky-950', icono: 'text-sky-700 dark:text-sky-300', Icon: Monitor },
  EDUCATION: { fondo: 'bg-amber-100 dark:bg-amber-950', icono: 'text-amber-700 dark:text-amber-300', Icon: GraduationCap },
  CULTURE: { fondo: 'bg-rose-100 dark:bg-rose-950', icono: 'text-rose-700 dark:text-rose-300', Icon: Landmark },
  ENTERTAINMENT: { fondo: 'bg-violet-100 dark:bg-violet-950', icono: 'text-violet-700 dark:text-violet-300', Icon: Star },
}

export function Poster({ event, compact = false }: { event: Event; compact?: boolean }) {
  const { fondo, icono, Icon } = posterStyles[event.category]
  return <div aria-hidden="true" className={`grid ${compact ? 'h-24' : 'h-48'} place-items-center ${fondo}`}><Icon className={`${compact ? 'size-8' : 'size-12'} ${icono}`} strokeWidth={1.8}/></div>
}

export function EventCard({ event }: { event: Event }) {
  return <Tarjeta className="group flex h-full flex-col transition hover:-translate-y-1 hover:shadow-lg">
      <Link to={RUTAS.evento(event.eventCode)} className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"><Poster event={event} compact/></Link>
    <div className="flex flex-1 flex-col p-5">
      <div className="flex items-center justify-between gap-3"><span className="text-xs font-semibold uppercase tracking-wider text-marca-700 dark:text-marca-50">{CATEGORIAS[event.category]}</span><Badge status={event.status}/></div>
      <h3 className="mt-3 text-lg font-bold leading-snug text-slate-950 dark:text-white"><Link className="hover:text-marca-600" to={RUTAS.evento(event.eventCode)}>{event.name}</Link></h3>
      <div className="mt-auto space-y-2 pt-5 text-sm text-slate-600 dark:text-slate-400"><p className="flex items-center gap-2"><CalendarDays aria-hidden="true" className="size-4 text-marca-600"/>{new Date(event.eventDate).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}</p><p className="flex items-center gap-2"><MapPin aria-hidden="true" className="size-4 text-marca-600"/>{event.venueName ?? 'Sede por confirmar'}</p></div>
      <Link to={RUTAS.evento(event.eventCode)} className="mt-5 inline-flex min-h-11 items-center justify-between rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-800 transition hover:border-marca-600 hover:text-marca-700 dark:border-slate-700 dark:text-slate-100 dark:hover:text-marca-50">Ver evento<ArrowUpRight aria-hidden="true" className="size-4"/></Link>
    </div>
  </Tarjeta>
}
