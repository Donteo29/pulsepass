import { useQuery } from '@tanstack/react-query'
import { ArrowRight, CalendarDays, Music2, Sparkles, TicketCheck } from 'lucide-react'
import { Link } from 'react-router'
import { listarEventosPublicados } from '../funcionalidades/eventos/api'
import { listarArtistasActivos } from '../funcionalidades/artistas/api'
import { useAuth } from '../funcionalidades/auth/AuthContext'
import { EventCard } from '../componentes/EventCard'
import { EstadoCargando, EstadoError, EstadoVacio } from '../componentes/ui'
import { RUTAS } from '../lib/rutas'

export default function Inicio() {
  const { sesion } = useAuth()
  const eventos = useQuery({ queryKey: ['eventos', 'publicados'], queryFn: listarEventosPublicados, staleTime: 60_000 })
  const artistas = useQuery({ queryKey: ['artistas', 'activos'], queryFn: listarArtistasActivos, staleTime: 300_000 })

  return <div className="space-y-14 sm:space-y-20">
    <section className="relative isolate overflow-hidden rounded-[2rem] bg-linear-to-br from-marca-700 via-marca-600 to-acento-500 px-6 py-12 text-white shadow-xl shadow-indigo-950/10 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
      <div aria-hidden="true" className="absolute -right-16 -top-24 -z-10 size-96 rounded-full border border-white/15"/><div aria-hidden="true" className="absolute -right-4 top-8 -z-10 size-64 rounded-full border border-white/15"/>
      <div className="max-w-2xl"><span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider"><Sparkles aria-hidden="true" className="size-4"/>Tu próximo gran recuerdo</span><h1 className="mt-6 font-titulo text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">Descubre los mejores eventos</h1><p className="mt-5 max-w-xl text-base leading-7 text-white/85 sm:text-lg">Música, cultura, deporte y tecnología en un solo lugar.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link to={RUTAS.eventos} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-marca-700 transition hover:bg-indigo-50">Ver cartelera<ArrowRight aria-hidden="true" className="size-4"/></Link>{sesion.estado !== 'autenticado' && <Link to={RUTAS.registro} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/50 bg-white/10 px-5 text-sm font-bold text-white transition hover:bg-white/20">Crear cuenta</Link>}</div></div>
      <div className="absolute bottom-8 right-10 hidden rotate-6 rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur md:block"><TicketCheck aria-hidden="true" className="size-12"/><p className="mt-3 text-sm font-bold">Vive el momento</p><p className="text-xs text-white/75">Tu entrada, siempre contigo</p></div>
    </section>

    <section aria-labelledby="proximos-eventos" className="space-y-6"><div className="flex items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-wider text-marca-600">Encuentra tu próximo plan</p><h2 id="proximos-eventos" className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Próximos eventos</h2></div><Link to={RUTAS.eventos} className="hidden min-h-11 items-center gap-1 text-sm font-bold text-marca-700 hover:text-marca-600 sm:flex">Toda la cartelera<ArrowRight aria-hidden="true" className="size-4"/></Link></div>
      {eventos.isPending ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <EstadoCargando key={item}/>)}</div> : eventos.isError ? <EstadoError message={eventos.error.message} onRetry={() => void eventos.refetch()}/> : eventos.data.length === 0 ? <EstadoVacio icon={CalendarDays} title="Aún no hay eventos publicados" body="Vuelve pronto para descubrir nuevas experiencias." action={<Link to={RUTAS.eventos} className="font-semibold text-marca-700 underline">Explorar cartelera</Link>}/> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{eventos.data.slice(0, 3).map((event) => <EventCard key={event.eventCode} event={event}/>)}</div>}
    </section>

    <section aria-labelledby="artistas-destacados" className="rounded-3xl bg-slate-100 p-6 sm:p-8 dark:bg-slate-900"><div className="flex items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-wider text-marca-600">En el escenario</p><h2 id="artistas-destacados" className="mt-2 text-2xl font-black tracking-tight">Artistas para descubrir</h2></div><Link to={RUTAS.artistas} className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-marca-700">Ver todos<ArrowRight aria-hidden="true" className="size-4"/></Link></div>
      {artistas.isPending ? <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-white dark:bg-slate-800"/>)}</div> : artistas.isError ? <div className="mt-5"><EstadoError message={artistas.error.message} onRetry={() => void artistas.refetch()}/></div> : artistas.data.length === 0 ? <div className="mt-5"><EstadoVacio icon={Music2} title="Pronto habrá nuevos artistas" body="Estamos preparando la próxima temporada."/></div> : <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{artistas.data.slice(0, 6).map((artist) => <Link key={artist.id} to={RUTAS.artista(artist.id)} className="group flex min-h-20 items-center gap-4 rounded-2xl bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-marca-600 dark:bg-slate-950"><span className="grid size-12 shrink-0 place-items-center rounded-full bg-linear-to-br from-marca-600 to-acento-500 text-white"><Music2 aria-hidden="true" className="size-5"/></span><span className="min-w-0"><span className="block truncate font-bold text-slate-900 group-hover:text-marca-600 dark:text-white">{artist.stageName}</span><span className="mt-1 block truncate text-sm text-slate-500 dark:text-slate-400">{[artist.genre, artist.country].filter(Boolean).join(' · ') || 'Artista PulsePass'}</span></span><ArrowRight aria-hidden="true" className="ml-auto size-4 shrink-0 text-slate-400"/></Link>)}</div>}
    </section>
  </div>
}
