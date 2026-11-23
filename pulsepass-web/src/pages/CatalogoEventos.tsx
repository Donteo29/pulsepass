import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'
import { CalendarDays, Search } from 'lucide-react'
import { listarEventosPublicados } from '../funcionalidades/eventos/api'
import { listarArtistasActivos } from '../funcionalidades/artistas/api'
import { consultarArtistaPorNombre } from '../funcionalidades/artistas/api'
import { EventCard } from '../componentes/EventCard'
import { EstadoError, EstadoVacio, Selector } from '../componentes/ui'
import { EventCategorySchema, CATEGORIAS } from '../lib/tipos'

export default function CatalogoEventos() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const category = params.get('categoria') ?? ''
  const artist = params.get('artista') ?? ''
  const events = useQuery({ queryKey: ['eventos', 'publicados'], queryFn: listarEventosPublicados, staleTime: 60_000 })
  const artists = useQuery({ queryKey: ['artistas', 'activos'], queryFn: listarArtistasActivos, staleTime: 300_000 })
  const selectedCategory = EventCategorySchema.safeParse(category)
  const artistName = artists.data?.find((item) => String(item.id) === artist)?.stageName
  const artistLookup = useQuery({ queryKey: ['artista', 'nombre', artistName], queryFn: () => consultarArtistaPorNombre(artistName ?? ''), enabled: Boolean(artistName), staleTime: 300_000 })
  const filtered = events.data?.filter((event) => {
    const matchesText = `${event.name} ${event.description ?? ''} ${event.venueName ?? ''}`.toLocaleLowerCase('es').includes(query.toLocaleLowerCase('es'))
    const matchesCategory = !selectedCategory.success || event.category === selectedCategory.data
    const matchesArtist = !artistName || event.artists.some((item) => item.stageName === artistName || item.id === artistLookup.data?.id)
    return matchesText && matchesCategory && matchesArtist
  }) ?? []
  const changeFilter = (key: string, value: string) => setParams((current) => {
    const next = new URLSearchParams(current)
    if (value) next.set(key, value)
    else next.delete(key)
    return next
  }, { replace: true })

  return <div className="space-y-8"><header><p className="text-sm font-bold uppercase tracking-wider text-marca-600">Vive algo nuevo</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Cartelera de eventos</h1><p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400">Busca tu siguiente experiencia y encuentra el plan que va contigo.</p></header>
    <section aria-label="Filtros de eventos" className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_auto] dark:border-slate-800 dark:bg-slate-900">
      <label className="relative block"><span className="sr-only">Buscar eventos por nombre</span><Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"/><input value={query} onChange={(event) => changeFilter('q', event.target.value)} placeholder="Buscar por nombre…" className="min-h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm outline-none focus-visible:border-marca-600 focus-visible:outline-2 focus-visible:outline-marca-600/25 dark:border-slate-700 dark:bg-slate-950"/></label>
      <Selector label="Categoría" value={category} onChange={(event) => changeFilter('categoria', event.target.value)}><option value="">Todas las categorías</option>{Object.entries(CATEGORIAS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Selector>
      <Selector label="Artista" value={artist} onChange={(event) => changeFilter('artista', event.target.value)}><option value="">Todos los artistas</option>{artists.data?.map((item) => <option key={item.id} value={item.id}>{item.stageName}</option>)}</Selector>
      <button type="button" onClick={() => setParams({}, { replace: true })} className="min-h-11 self-end rounded-xl px-4 text-sm font-semibold text-slate-600 underline underline-offset-4 hover:text-marca-700 dark:text-slate-300">Limpiar</button>
    </section>
    {events.isPending ? <div className="rounded-2xl bg-slate-100 p-8 text-center text-slate-600 dark:bg-slate-900 dark:text-slate-300">Cargando cartelera…</div> : events.isError ? <EstadoError message={events.error.message} onRetry={() => void events.refetch()}/> : filtered.length === 0 ? <EstadoVacio icon={CalendarDays} title="No encontramos eventos" body="Prueba con otros filtros o vuelve a limpiar la búsqueda." action={<button onClick={() => setParams({})} className="min-h-11 font-semibold text-marca-700 underline">Quitar filtros</button>}/> : <><p className="text-sm text-slate-500 dark:text-slate-400">{filtered.length} {filtered.length === 1 ? 'evento' : 'eventos'}</p><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((event) => <EventCard key={event.eventCode} event={event}/>)}</div></>}
  </div>
}
