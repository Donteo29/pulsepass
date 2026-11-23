import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { CheckCircle2, Search, TicketCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useSearchParams } from 'react-router'
import { consultarTicket, usarTicket } from '../funcionalidades/tickets/api'
import { ApiError } from '../lib/http'
import { Aviso, Badge, Button, Campo, EstadoCargando, EstadoError, PrecioCOP, Tarjeta } from '../componentes/ui'
import { RUTAS } from '../lib/rutas'

const SearchSchema = z.object({ ticketCode: z.string().trim().min(1, 'Ingresa el código de la entrada') })
type SearchValues = z.infer<typeof SearchSchema>

export default function ValidacionIngreso() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const [eventCode, setEventCode] = useState('')
  const [searchedCode, setSearchedCode] = useState(params.get('codigo') ?? '')
  const [message, setMessage] = useState('')
  const cache = useQueryClient()
  const form = useForm<SearchValues>({ resolver: zodResolver(SearchSchema), defaultValues: { ticketCode: searchedCode } })
  const ticket = useQuery({ queryKey: ['ticket', searchedCode], queryFn: () => consultarTicket(searchedCode), enabled: Boolean(searchedCode), staleTime: 15_000 })
  const markUsed = useMutation({ mutationFn: usarTicket, onSuccess: async () => { setMessage('Entrada validada. El acceso quedó registrado.'); await cache.invalidateQueries({ queryKey: ['ticket', searchedCode] }) }, onError: (error: Error) => setMessage(error.message) })
  const onSubmit = form.handleSubmit(({ ticketCode }) => { setMessage(''); setParams({ codigo: ticketCode }, { replace: true }); setSearchedCode(ticketCode) })

  return <div className="mx-auto max-w-2xl space-y-7"><header><p className="text-sm font-bold uppercase tracking-wider text-marca-600">Operación de ingreso</p><h1 className="mt-2 text-3xl font-black">Validar una entrada</h1><p className="mt-3 text-slate-600 dark:text-slate-400">Busca el código del ticket para confirmar su estado antes del ingreso.</p></header><Tarjeta className="p-5 sm:p-6"><form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end"><Campo label="Código de la entrada" placeholder="PP-2026-0001" autoComplete="off" className="font-mono uppercase" {...form.register('ticketCode')} error={form.formState.errors.ticketCode?.message}/><Button type="submit" className="shrink-0"><Search aria-hidden="true" className="size-4"/>Buscar</Button></form></Tarjeta>
    <form onSubmit={(event) => { event.preventDefault(); if (eventCode.trim()) navigate(RUTAS.ticketsEvento(eventCode.trim())) }} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-end dark:border-slate-800 dark:bg-slate-900"><Campo label="Ver entradas pagadas por evento" placeholder="Código del evento" value={eventCode} onChange={(event) => setEventCode(event.target.value)}/><Button type="submit" variant="secondary" disabled={!eventCode.trim()}>Consultar evento</Button></form>
    {ticket.isFetching && <EstadoCargando label="Buscando entrada"/>}{searchedCode && ticket.isError && <EstadoError message={ticket.error instanceof ApiError && ticket.error.status === 404 ? 'No encontramos una entrada con ese código.' : ticket.error.message} onRetry={() => void ticket.refetch()}/>}
    {ticket.data && <Tarjeta className="space-y-5 p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{ticket.data.ticketCode}</p><h2 className="mt-1 text-xl font-black">{ticket.data.eventName ?? ticket.data.eventCode}</h2></div><Badge status={ticket.data.status}/></div><dl className="grid gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2 dark:border-slate-800"><div><dt className="text-sm text-slate-500">Tipo</dt><dd className="mt-1 font-semibold">{ticket.data.type}</dd></div><div><dt className="text-sm text-slate-500">Precio registrado</dt><dd className="mt-1 font-semibold"><PrecioCOP value={ticket.data.price}/></dd></div></dl>{message && <Aviso type={markUsed.isError ? 'error' : 'success'}>{message}</Aviso>}{ticket.data.status === 'PAID' ? <Button loading={markUsed.isPending} onClick={() => markUsed.mutate(ticket.data.ticketCode)}><CheckCircle2 aria-hidden="true" className="size-4"/>Marcar como usada</Button> : <p className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300"><TicketCheck aria-hidden="true" className="size-4"/>Esta entrada no está disponible para ingreso.</p>}</Tarjeta>}
  </div>
}
