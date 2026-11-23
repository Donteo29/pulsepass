import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router'
import { Link } from 'react-router'
import { ArrowLeft, Check, Megaphone, Music2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { asociarArtista, consultarEvento, publicarEvento } from '../funcionalidades/eventos/api'
import { listarArtistasActivos } from '../funcionalidades/artistas/api'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'
import { Aviso, Badge, Button, EstadoCargando, EstadoError, Selector, Tarjeta } from '../componentes/ui'
import { CATEGORIAS } from '../lib/tipos'

const AssociateSchema = z.object({ artistId: z.coerce.number().int().positive('Selecciona un artista') })
type AssociateInput = z.input<typeof AssociateSchema>
type AssociateValues = z.output<typeof AssociateSchema>

export default function AdminGestionEvento() {
  const { eventCode } = useParams<{ eventCode: string }>()
  const [message, setMessage] = useState('')
  const cache = useQueryClient()
  const query = useQuery({ queryKey: ['evento', eventCode], queryFn: () => consultarEvento(eventCode ?? ''), enabled: Boolean(eventCode), staleTime: 30_000 })
  const artists = useQuery({ queryKey: ['artistas', 'activos'], queryFn: listarArtistasActivos, staleTime: 300_000 })
  const form = useForm<AssociateInput, unknown, AssociateValues>({ resolver: zodResolver(AssociateSchema), defaultValues: { artistId: 0 } })
  const publish = useMutation({ mutationFn: () => publicarEvento(eventCode ?? ''), onSuccess: async () => { setMessage('El evento quedó publicado.'); await cache.invalidateQueries({ queryKey: ['evento', eventCode] }); await cache.invalidateQueries({ queryKey: ['eventos', 'publicados'] }) }, onError: (error: Error) => setMessage(error.message) })
  const associate = useMutation({ mutationFn: (artistId: number) => asociarArtista(eventCode ?? '', artistId), onSuccess: async () => { setMessage('El artista quedó asociado al evento.'); await cache.invalidateQueries({ queryKey: ['evento', eventCode] }); form.reset({ artistId: 0 }) }, onError: (error: Error) => setMessage(error.message) })
  const onSubmit = form.handleSubmit(({ artistId }) => { setMessage(''); associate.mutate(artistId) })
  if (!eventCode) return <EstadoError message="Indica un código de evento."/>
  if (query.isPending || artists.isPending) return <EstadoCargando label="Cargando datos del evento"/>
  if (query.isError) return <EstadoError message={query.error instanceof ApiError && query.error.status === 404 ? 'Evento no disponible.' : query.error.message} onRetry={() => void query.refetch()}/>
  if (artists.isError) return <EstadoError message={artists.error.message} onRetry={() => void artists.refetch()}/>
  return <div className="mx-auto max-w-3xl space-y-6"><Link to={RUTAS.adminEventos} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-marca-700 hover:underline"><ArrowLeft aria-hidden="true" className="size-4"/>Administración de eventos</Link><Tarjeta className="p-6 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-bold uppercase tracking-wider text-marca-600">{query.data.eventCode}</p><h1 className="mt-2 text-3xl font-black">{query.data.name}</h1></div><Badge status={query.data.status}/></div><p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{CATEGORIAS[query.data.category]} · {query.data.venueName ?? query.data.venueCode ?? 'Sede pendiente'} · {new Date(query.data.eventDate).toLocaleString('es-CO')}</p>
    {message && <div className="mt-5"><Aviso type={publish.isError || associate.isError ? 'error' : 'success'}>{message}</Aviso></div>}
    <section className="mt-7 border-t border-slate-200 pt-6 dark:border-slate-800"><h2 className="flex items-center gap-2 text-lg font-bold"><Music2 aria-hidden="true" className="size-5 text-marca-600"/>Artistas asociados</h2>{query.data.artists.length === 0 ? <p className="mt-3 text-sm text-slate-500">Aún no se han asociado artistas.</p> : <ul className="mt-3 flex flex-wrap gap-2">{query.data.artists.map((artist) => <li key={artist.id} className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold dark:bg-slate-800">{artist.stageName}</li>)}</ul>}
      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"><Selector label="Asociar artista" className="flex-1" {...form.register('artistId')}><option value={0}>Selecciona un artista</option>{artists.data.filter((artist) => !query.data.artists.some((linked) => linked.id === artist.id)).map((artist) => <option key={artist.id} value={artist.id}>{artist.stageName}</option>)}</Selector><Button type="submit" variant="secondary" loading={associate.isPending}><Check aria-hidden="true" className="size-4"/>Asociar artista</Button></form>{form.formState.errors.artistId && <p className="mt-1 text-sm text-red-600">{form.formState.errors.artistId.message}</p>}
    </section><section className="mt-7 border-t border-slate-200 pt-6 dark:border-slate-800"><h2 className="text-lg font-bold">Publicación</h2><p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Al publicar, el evento quedará disponible en la cartelera pública.</p>{query.data.status === 'DRAFT' ? <Button className="mt-4" loading={publish.isPending} onClick={() => { if (window.confirm('¿Publicar este evento?')) { setMessage(''); publish.mutate() } }}><Megaphone aria-hidden="true" className="size-4"/>Publicar evento</Button> : <p className="mt-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300">Este evento ya está publicado o cerrado.</p>}</section>
  </Tarjeta></div>
}
