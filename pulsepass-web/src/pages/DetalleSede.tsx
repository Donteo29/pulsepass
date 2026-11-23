import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, MapPin, Users } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { consultarSede } from '../funcionalidades/sedes/api'
import { EstadoCargando, EstadoError, Tarjeta } from '../componentes/ui'
import { RUTAS } from '../lib/rutas'

export default function DetalleSede() {
  const { code } = useParams<{ code: string }>()
  const query = useQuery({ queryKey: ['sede', code], queryFn: () => consultarSede(code ?? ''), enabled: Boolean(code), staleTime: 300_000 })
  if (!code) return <EstadoError message="No encontramos esta sede."/>
  if (query.isPending) return <EstadoCargando label="Cargando sede"/>
  if (query.isError) return <div className="space-y-4"><EstadoError message="No encontramos esta sede." onRetry={() => void query.refetch()}/><Link to={RUTAS.sedes} className="font-semibold text-marca-700 underline">Volver a sedes</Link></div>
  return <div className="space-y-7"><Link to={RUTAS.sedes} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-marca-700 hover:underline"><ArrowLeft aria-hidden="true" className="size-4"/>Todas las sedes</Link><Tarjeta className="overflow-hidden"><div className="relative h-48 bg-linear-to-br from-slate-950 via-indigo-900 to-marca-600 sm:h-64"><div aria-hidden="true" className="absolute -right-6 -top-12 size-72 rounded-full border border-white/15"/><MapPin aria-hidden="true" className="absolute bottom-6 left-6 size-9 text-white"/></div><div className="grid gap-8 p-6 sm:grid-cols-[1fr_auto] sm:p-8"><div><p className="text-sm font-bold uppercase tracking-wider text-marca-600">Sede PulsePass</p><h1 className="mt-2 text-3xl font-black">{query.data.name}</h1><p className="mt-3 flex items-center gap-2 text-slate-600 dark:text-slate-400"><MapPin aria-hidden="true" className="size-4"/>{query.data.city} · {query.data.address ?? 'Dirección por confirmar'}</p></div><div className="flex items-center gap-3 rounded-2xl bg-slate-100 px-5 py-4 dark:bg-slate-800"><Users aria-hidden="true" className="size-5 text-marca-600"/><div><p className="text-xs text-slate-500">Capacidad</p><p className="font-bold">{new Intl.NumberFormat('es-CO').format(query.data.capacity)} personas</p></div></div></div></Tarjeta></div>
}
