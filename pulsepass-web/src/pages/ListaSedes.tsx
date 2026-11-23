import { useQuery } from '@tanstack/react-query'
import { ArrowUpRight, MapPin, Users } from 'lucide-react'
import { Link } from 'react-router'
import { listarSedesActivas } from '../funcionalidades/sedes/api'
import { EstadoCargando, EstadoError, EstadoVacio, Tarjeta } from '../componentes/ui'
import { RUTAS } from '../lib/rutas'

export default function ListaSedes() {
  const query = useQuery({ queryKey: ['sedes', 'activas'], queryFn: listarSedesActivas, staleTime: 300_000 })
  return <div className="space-y-8"><header><p className="text-sm font-bold uppercase tracking-wider text-marca-600">Lugares que se viven</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">Sedes</h1><p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400">Explora los espacios donde suceden las experiencias PulsePass.</p></header>
    {query.isPending ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((i) => <EstadoCargando key={i}/>)}</div> : query.isError ? <EstadoError message={query.error.message} onRetry={() => void query.refetch()}/> : query.data.length === 0 ? <EstadoVacio icon={MapPin} title="No hay sedes activas" body="Estamos sumando nuevos lugares. Vuelve a consultar pronto."/> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{query.data.map((venue) => <Tarjeta key={venue.code} className="p-5"><span className="grid size-12 place-items-center rounded-2xl bg-marca-50 text-marca-700 dark:bg-slate-800 dark:text-marca-50"><MapPin aria-hidden="true" className="size-6"/></span><h2 className="mt-4 text-lg font-bold">{venue.name}</h2><p className="mt-1 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"><MapPin aria-hidden="true" className="size-4"/>{venue.city}</p><p className="mt-3 flex items-center gap-2 text-sm text-slate-500"><Users aria-hidden="true" className="size-4"/>Capacidad {new Intl.NumberFormat('es-CO').format(venue.capacity)}</p><Link to={RUTAS.sede(venue.code)} className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-marca-700 hover:underline dark:text-marca-50">Conocer sede<ArrowUpRight aria-hidden="true" className="size-4"/></Link></Tarjeta>)}</div>}
  </div>
}
