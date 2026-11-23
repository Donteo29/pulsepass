import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, Link } from 'react-router'
import { Search, SlidersHorizontal, SquarePlus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { consultarEvento } from '../funcionalidades/eventos/api'
import { ApiError } from '../lib/http'
import { Badge, Button, Campo, EstadoError, EstadoCargando, EstadoVacio, Tarjeta } from '../componentes/ui'
import { CATEGORIAS } from '../lib/tipos'
import { RUTAS } from '../lib/rutas'

const SearchSchema = z.object({ eventCode: z.string().trim().min(1, 'Ingresa el código de un evento') })
type SearchValues = z.infer<typeof SearchSchema>

export default function AdminEventos() {
  const [params, setParams] = useSearchParams()
  const [submitted, setSubmitted] = useState(params.get('codigo') ?? '')
  const form = useForm<SearchValues>({ resolver: zodResolver(SearchSchema), defaultValues: { eventCode: submitted } })
  const query = useQuery({ queryKey: ['evento', submitted], queryFn: () => consultarEvento(submitted), enabled: Boolean(submitted), staleTime: 30_000 })
  const onSubmit = form.handleSubmit(({ eventCode }) => { setSubmitted(eventCode); setParams({ codigo: eventCode }, { replace: true }) })
  return <div className="mx-auto max-w-3xl space-y-7"><header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-bold uppercase tracking-wider text-marca-600">Panel de administración</p><h1 className="mt-2 text-3xl font-black">Eventos</h1><p className="mt-2 max-w-xl text-slate-600 dark:text-slate-400">Consulta y gestiona eventos por su código.</p></div><Link to={RUTAS.crearEvento} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-marca-600 px-4 text-sm font-semibold text-white hover:bg-marca-700"><SquarePlus aria-hidden="true" className="size-4"/>Crear evento</Link></header>
    <Tarjeta className="p-5 sm:p-6"><form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end"><Campo label="Código del evento" placeholder="CMF-2026" {...form.register('eventCode')} error={form.formState.errors.eventCode?.message}/><Button type="submit"><Search aria-hidden="true" className="size-4"/>Consultar</Button></form></Tarjeta>
    {!submitted && <EstadoVacio icon={SlidersHorizontal} title="Busca un evento para gestionarlo" body="La API todavía no ofrece un listado general de borradores. Ingresa un código para consultar sus opciones."/>}
    {query.isPending && submitted && <EstadoCargando label="Buscando evento"/>}
    {query.isError && submitted && <EstadoError message={query.error instanceof ApiError && (query.error.status === 403 || query.error.status === 404) ? 'Evento no disponible. Comprueba el código e inténtalo de nuevo.' : query.error.message} onRetry={() => void query.refetch()}/>}
    {query.data && <Tarjeta className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-bold">{query.data.name}</h2><Badge status={query.data.status}/></div><p className="mt-1 text-sm text-slate-500">{query.data.eventCode} · {CATEGORIAS[query.data.category]} · {query.data.venueName ?? query.data.venueCode ?? 'Sede pendiente'}</p></div><Link to={RUTAS.gestionarEvento(query.data.eventCode)} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-4 text-sm font-semibold hover:border-marca-600 dark:border-slate-700">Gestionar</Link></Tarjeta>}
  </div>
}
