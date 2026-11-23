import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, TicketCheck } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { consultarTicket } from '../funcionalidades/tickets/api'
import { useAuth } from '../funcionalidades/auth/AuthContext'
import { Badge, EstadoCargando, EstadoError, PrecioCOP, Tarjeta } from '../componentes/ui'
import { RUTAS } from '../lib/rutas'

export default function ConfirmacionCompra() {
  const { ticketCode } = useParams<{ ticketCode: string }>()
  const { sesion } = useAuth()
  const query = useQuery({ queryKey: ['ticket', ticketCode], queryFn: () => consultarTicket(ticketCode ?? ''), enabled: Boolean(ticketCode), staleTime: 15_000 })
  if (!ticketCode) return <EstadoError message="No encontramos esta compra."/>
  if (query.isPending) return <EstadoCargando label="Cargando confirmación"/>
  if (query.isError || sesion.estado !== 'autenticado' || query.data.userEmail !== sesion.usuario.email) return <EstadoError message="No encontramos esta compra en tu cuenta."/>
  return <div className="mx-auto max-w-xl space-y-6"><Tarjeta className="p-7 text-center sm:p-9"><span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><CheckCircle2 aria-hidden="true" className="size-9"/></span><p className="mt-5 text-sm font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Compra confirmada</p><h1 className="mt-2 text-3xl font-black">¡Nos vemos en el evento!</h1><p className="mt-3 text-slate-600 dark:text-slate-400">Tu entrada ya está en tu cuenta.</p><div className="mt-7 rounded-2xl border border-dashed border-slate-300 p-5 dark:border-slate-700"><TicketCheck aria-hidden="true" className="mx-auto size-7 text-marca-600"/><p className="mt-3 text-sm text-slate-500">Código de entrada</p><p className="mt-1 font-mono text-xl font-bold">{query.data.ticketCode}</p><div className="mt-4 flex flex-wrap justify-center gap-2"><Badge status={query.data.status}/><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold dark:bg-slate-800">{query.data.type}</span></div><p className="mt-4 font-bold"><PrecioCOP value={query.data.price}/></p><p className="mt-1 text-sm">{query.data.eventName ?? query.data.eventCode}</p></div><div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row"><Link to={RUTAS.ticket(ticketCode)} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-4 text-sm font-semibold dark:border-slate-700">Ver mi entrada</Link><Link to={RUTAS.misTickets} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-marca-600 px-4 text-sm font-semibold text-white hover:bg-marca-700">Mis tickets</Link></div></Tarjeta></div>
}
