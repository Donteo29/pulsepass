import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, MapPin, Music2 } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { consultarArtista } from '../funcionalidades/artistas/api'
import { consultarEventosPorArtista } from '../funcionalidades/eventos/api'
import { EventCard } from '../componentes/EventCard'
import { EstadoCargando, EstadoError, EstadoVacio, Tarjeta } from '../componentes/ui'
import { RUTAS } from '../lib/rutas'

export default function DetalleArtista() {
  const { id } = useParams<{ id: string }>()
  const artistId = Number(id)
  const validId = Boolean(id) && Number.isSafeInteger(artistId) && artistId > 0
  const artist = useQuery({ queryKey: ['artista', artistId], queryFn: () => consultarArtista(artistId), enabled: validId, staleTime: 300_000 })
  const events = useQuery({ queryKey: ['eventos', 'artista', artist.data?.stageName], queryFn: () => consultarEventosPorArtista(artist.data?.stageName ?? ''), enabled: Boolean(artist.data?.stageName), staleTime: 60_000 })
  if (!validId) return <EstadoError message="No encontramos este perfil de artista."/>
  if (artist.isPending) return <EstadoCargando label="Cargando artista"/>
  if (artist.isError) return <EstadoError message="No encontramos este perfil de artista." onRetry={() => void artist.refetch()}/>
  return <div className="space-y-9"><Link to={RUTAS.artistas} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-marca-700 hover:underline"><ArrowLeft aria-hidden="true" className="size-4"/>Todos los artistas</Link>
    <Tarjeta className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8"><span className="grid size-24 shrink-0 place-items-center rounded-3xl bg-linear-to-br from-marca-600 to-acento-500 text-white"><Music2 aria-hidden="true" className="size-10"/></span><div><p className="text-sm font-bold uppercase tracking-wider text-marca-600">Artista</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">{artist.data.stageName}</h1><p className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-400">{artist.data.genre && <span className="flex items-center gap-1"><Music2 aria-hidden="true" className="size-4"/>{artist.data.genre}</span>}{artist.data.country && <span className="flex items-center gap-1"><MapPin aria-hidden="true" className="size-4"/>{artist.data.country}</span>}</p></div></Tarjeta>
    <section className="space-y-5"><h2 className="text-2xl font-black">Eventos con {artist.data.stageName}</h2>{events.isPending ? <EstadoCargando/> : events.isError ? <EstadoError message={events.error.message} onRetry={() => void events.refetch()}/> : events.data.length === 0 ? <EstadoVacio title="Sin eventos próximos" body="Todavía no hay eventos publicados con este artista."/> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{events.data.map((event) => <EventCard key={event.eventCode} event={event}/>)}</div>}</section>
  </div>
}
