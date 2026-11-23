import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { CalendarDays, Ticket } from 'lucide-react'
import { Link, useSearchParams } from 'react-router'
import { useAuth } from '../funcionalidades/auth/AuthContext'
import { cancelarTicket, listarTicketsUsuario } from '../funcionalidades/tickets/api'
import { Aviso, Badge, Button, EstadoCargando, EstadoError, EstadoVacio, PrecioCOP, Selector, Tarjeta } from '../componentes/ui'
import { ESTADOS_TICKET, TicketStatusSchema } from '../lib/tipos'
import { RUTAS } from '../lib/rutas'

export default function MisTickets() {
  const { sesion } = useAuth()
  const [params, setParams] = useSearchParams()
  const cache = useQueryClient()
  const [message, setMessage] = useState('')
  const email = sesion.estado === 'autenticado' ? sesion.usuario.email : ''
  const query = useQuery({ queryKey: ['tickets', 'usuario', email], queryFn: () => listarTicketsUsuario(email), enabled: Boolean(email), staleTime: 15_000 })
  const cancel = useMutation({ mutationFn: cancelarTicket, onSuccess: async () => { setMessage('La entrada se canceló.'); await cache.invalidateQueries({ queryKey: ['tickets', 'usuario', email] }) }, onError: (error: Error) => setMessage(error.message) })
  const rawStatus = params.get('estado') ?? ''
  const parsedStatus = TicketStatusSchema.safeParse(rawStatus)
  const tickets = query.data?.filter((ticket) => !parsedStatus.success || ticket.status === parsedStatus.data) ?? []
  if (query.isPending) return <EstadoCargando label="Cargando tus tickets"/>
  if (query.isError) return <EstadoError message={query.error.message} onRetry={() => void query.refetch()}/>
  return <div className="space-y-7"><header><p className="text-sm font-bold uppercase tracking-wider text-marca-600">Tu colección de experiencias</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">Mis tickets</h1><p className="mt-3 text-slate-600 dark:text-slate-400">Consulta el estado y los detalles de tus entradas.</p></header>
    {message && <Aviso type={cancel.isError ? 'error' : 'success'}>{message}</Aviso>}
    <div className="max-w-xs"><Selector label="Filtrar por estado" value={rawStatus} onChange={(event) => setParams(event.target.value ? { estado: event.target.value } : {}, { replace: true })}><option value="">Todos los estados</option>{Object.entries(ESTADOS_TICKET).map(([status, label]) => <option key={status} value={status}>{label}</option>)}</Selector></div>
    {tickets.length === 0 ? <EstadoVacio icon={Ticket} title="No hay tickets para mostrar" body="Cuando tengas una entrada, la encontrarás aquí." action={<Link to={RUTAS.eventos} className="font-semibold text-marca-700 underline">Buscar eventos</Link>}/> : <div className="space-y-3">{tickets.map((ticket) => <Tarjeta key={ticket.ticketCode} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"><span className="grid size-12 shrink-0 place-items-center rounded-xl bg-marca-50 text-marca-700 dark:bg-slate-800 dark:text-marca-50"><Ticket aria-hidden="true"/></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold">{ticket.eventName ?? ticket.eventCode}</h2><Badge status={ticket.status}/></div><p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{ticket.ticketCode} · {ticket.type} · <PrecioCOP value={ticket.price}/></p>{ticket.purchaseDate && <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><CalendarDays aria-hidden="true" className="size-3.5"/>{new Date(ticket.purchaseDate).toLocaleDateString('es-CO')}</p>}</div><div className="flex gap-2"><Link to={RUTAS.ticket(ticket.ticketCode)} className="inline-flex min-h-11 items-center rounded-xl border border-slate-300 px-4 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Ver detalle</Link>{ticket.status === 'PAID' && <Button variant="danger" loading={cancel.isPending && cancel.variables === ticket.ticketCode} onClick={() => { if (window.confirm('¿Quieres cancelar esta entrada?')) cancel.mutate(ticket.ticketCode) }}>Cancelar</Button>}</div></Tarjeta>)}</div>}
  </div>
}
