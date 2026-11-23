import { useQuery } from '@tanstack/react-query'
import { ArrowUpRight, Music2 } from 'lucide-react'
import { Link } from 'react-router'
import { listarArtistasActivos } from '../funcionalidades/artistas/api'
import { EstadoCargando, EstadoError, EstadoVacio, Tarjeta } from '../componentes/ui'
import { RUTAS } from '../lib/rutas'

export default function ListaArtistas() {
  const query = useQuery({ queryKey: ['artistas', 'activos'], queryFn: listarArtistasActivos, staleTime: 300_000 })
  return <div className="space-y-8"><header><p className="text-sm font-bold uppercase tracking-wider text-marca-600">Talento en vivo</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">Artistas</h1><p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400">Conoce a quienes hacen de cada evento una experiencia inolvidable.</p></header>
    {query.isPending ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((i) => <EstadoCargando key={i}/>)}</div> : query.isError ? <EstadoError message={query.error.message} onRetry={() => void query.refetch()}/> : query.data.length === 0 ? <EstadoVacio icon={Music2} title="No hay artistas activos" body="Regresa pronto para conocer a los próximos artistas de PulsePass."/> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{query.data.map((artist) => <Tarjeta key={artist.id} className="p-5"><div className="flex items-start gap-4"><span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-marca-600 to-acento-500 text-white"><Music2 aria-hidden="true" className="size-6"/></span><div className="min-w-0 flex-1"><h2 className="truncate text-lg font-bold">{artist.stageName}</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{[artist.genre, artist.country].filter(Boolean).join(' · ') || 'Artista PulsePass'}</p><Link to={RUTAS.artista(artist.id)} className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-marca-700 hover:underline dark:text-marca-50">Ver perfil<ArrowUpRight aria-hidden="true" className="size-4"/></Link></div></div></Tarjeta>)}</div>}
  </div>
}
