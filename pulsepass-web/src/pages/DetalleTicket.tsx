import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { ArrowLeft, CalendarDays, Ticket } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { useAuth } from '../funcionalidades/auth/AuthContext'
import { cancelarTicket, consultarTicket } from '../funcionalidades/tickets/api'
import { Aviso, Badge, Button, EstadoCargando, EstadoError, PrecioCOP, Tarjeta } from '../componentes/ui'
import { RUTAS } from '../lib/rutas'

export default function DetalleTicket() {
  const { ticketCode } = useParams<{ ticketCode: string }>()
  const { sesion } = useAuth()
  const cache = useQueryClient()
  const [message, setMessage] = useState('')
  const query = useQuery({ queryKey: ['ticket', ticketCode], queryFn: () => consultarTicket(ticketCode ?? ''), enabled: Boolean(ticketCode), staleTime: 15_000 })
  const cancel = useMutation({ mutationFn: cancelarTicket, onSuccess: async () => { setMessage('La entrada se canceló.'); await cache.invalidateQueries({ queryKey: ['ticket', ticketCode] }); await cache.invalidateQueries({ queryKey: ['tickets', 'usuario'] }) }, onError: (error: Error) => setMessage(error.message) })
  if (!ticketCode) return <EstadoError message="No encontramos esta entrada."/>
  if (query.isPending) return <EstadoCargando label="Cargando entrada"/>
  if (query.isError) return <EstadoError message="No encontramos esta entrada." onRetry={() => void query.refetch()}/>
  const ownsTicket = sesion.estado === 'autenticado' && query.data.userEmail === sesion.usuario.email
  if (!ownsTicket) return <EstadoError message="No encontramos esta entrada en tu cuenta."/>
  return <div className="mx-auto max-w-2xl space-y-6"><Link to={RUTAS.misTickets} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-marca-700 hover:underline"><ArrowLeft aria-hidden="true" className="size-4"/>Mis tickets</Link><Tarjeta className="overflow-hidden"><div className="flex items-center gap-4 bg-linear-to-r from-marca-700 to-acento-500 p-6 text-white"><Ticket aria-hidden="true" className="size-8"/><div><p className="text-sm text-white/80">Entrada PulsePass</p><p className="font-mono text-lg font-bold">{query.data.ticketCode}</p></div><div className="ml-auto"><Badge status={query.data.status}/></div></div><div className="space-y-5 p-6"><h1 className="text-2xl font-black">{query.data.eventName ?? query.data.eventCode}</h1><dl className="grid gap-4 sm:grid-cols-2"><div><dt className="text-sm text-slate-500">Tipo de entrada</dt><dd className="mt-1 font-semibold">{query.data.type}</dd></div><div><dt className="text-sm text-slate-500">Precio</dt><dd className="mt-1 font-semibold"><PrecioCOP value={query.data.price}/></dd></div><div><dt className="text-sm text-slate-500">Código del evento</dt><dd className="mt-1 font-semibold">{query.data.eventCode}</dd></div><div><dt className="text-sm text-slate-500">Fecha de compra</dt><dd className="mt-1 flex items-center gap-2 font-semibold"><CalendarDays aria-hidden="true" className="size-4 text-marca-600"/>{query.data.purchaseDate ? new Date(query.data.purchaseDate).toLocaleString('es-CO') : 'No disponible'}</dd></div></dl>{message && <Aviso type={cancel.isError ? 'error' : 'success'}>{message}</Aviso>}{query.data.status === 'PAID' && <Button variant="danger" loading={cancel.isPending} onClick={() => { if (window.confirm('¿Quieres cancelar esta entrada?')) cancel.mutate(query.data.ticketCode) }}>Cancelar entrada</Button>}</div></Tarjeta></div>
}
