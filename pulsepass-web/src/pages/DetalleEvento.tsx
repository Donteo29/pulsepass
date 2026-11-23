import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { CalendarDays, MapPin, Music2, ShieldCheck, Ticket, UserRound } from 'lucide-react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { consultarEvento } from '../funcionalidades/eventos/api'
import { comprarTicket as comprarTicketApi } from '../funcionalidades/tickets/api'
import { useAuth } from '../funcionalidades/auth/AuthContext'
import { Aviso, Badge, Button, EstadoCargando, EstadoError, Tarjeta } from '../componentes/ui'
import { Poster } from '../componentes/EventCard'
import { CATEGORIAS, TicketTypeSchema, TIPOS_TICKET } from '../lib/tipos'
import type { TicketType } from '../lib/tipos'
import { RUTAS } from '../lib/rutas'

export default function DetalleEvento() {
  const { eventCode } = useParams<{ eventCode: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const cache = useQueryClient()
  const { sesion } = useAuth()
  const [type, setType] = useState<TicketType>('GENERAL')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const event = useQuery({ queryKey: ['evento', eventCode], queryFn: () => consultarEvento(eventCode ?? ''), enabled: Boolean(eventCode), staleTime: 30_000 })
  const purchase = useMutation({ mutationFn: (ticketType: TicketType) => comprarTicketApi({ userEmail: sesion.estado === 'autenticado' ? sesion.usuario.email : '', eventCode: eventCode ?? '', type: ticketType }), onSuccess: async (ticket) => { await cache.invalidateQueries({ queryKey: ['tickets', 'usuario'] }); setConfirmOpen(false); navigate(RUTAS.confirmacion(ticket.ticketCode)) } })

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (confirmOpen && !dialog.open) dialog.showModal()
    if (!confirmOpen && dialog.open) dialog.close()
  }, [confirmOpen])

  if (!eventCode) return <EstadoError message="No encontramos este evento."/>
  if (event.isPending) return <EstadoCargando label="Cargando evento"/>
  if (event.isError) return <div className="space-y-4"><Aviso>Evento no disponible. Puede que ya no esté publicado.</Aviso><Link to={RUTAS.eventos} className="font-semibold text-marca-700 underline">Volver a la cartelera</Link></div>
  const canBuy = event.data.status === 'PUBLISHED' && sesion.estado === 'autenticado' && sesion.usuario.roles.includes('USER')
  return <div className="space-y-7"><Link to={RUTAS.eventos} className="inline-flex min-h-11 items-center text-sm font-semibold text-marca-700 hover:underline">← Volver a eventos</Link><div className="grid gap-7 lg:grid-cols-[1.55fr_0.85fr]">
    <Tarjeta className="overflow-hidden"><Poster event={event.data}/><div className="space-y-6 p-6 sm:p-8"><div className="flex flex-wrap items-center gap-3"><span className="text-sm font-bold uppercase tracking-wider text-marca-700 dark:text-marca-50">{CATEGORIAS[event.data.category]}</span><Badge status={event.data.status}/></div><h1 className="text-3xl font-black tracking-tight sm:text-4xl">{event.data.name}</h1><div className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2 dark:text-slate-300"><p className="flex items-start gap-3"><CalendarDays aria-hidden="true" className="mt-0.5 size-5 text-marca-600"/><span>{new Date(event.data.eventDate).toLocaleString('es-CO', { dateStyle: 'full', timeStyle: 'short' })}</span></p>{event.data.minimumAge !== null && event.data.minimumAge !== undefined && <p className="flex items-start gap-3"><UserRound aria-hidden="true" className="mt-0.5 size-5 text-marca-600"/><span>Edad mínima: {event.data.minimumAge} años</span></p>}</div><div><h2 className="font-bold">Sobre el evento</h2><p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">{event.data.description || 'Prepárate para vivir una experiencia única. Revisa los detalles y asegura tu lugar.'}</p></div>
      <div><h2 className="flex items-center gap-2 font-bold"><Music2 aria-hidden="true" className="size-5 text-marca-600"/>Artistas</h2>{event.data.artists.length ? <ul className="mt-3 flex flex-wrap gap-2">{event.data.artists.map((artist) => <li key={artist.id}><Link to={RUTAS.artista(artist.id)} className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold hover:text-marca-700 dark:bg-slate-800">{artist.stageName}</Link></li>)}</ul> : <p className="mt-2 text-sm text-slate-500">Artistas por anunciar.</p>}</div>
      <div><h2 className="font-bold">Sede</h2>{event.data.venueCode ? <Link to={RUTAS.sede(event.data.venueCode)} className="mt-3 flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold hover:border-marca-600 dark:border-slate-700"><MapPin aria-hidden="true" className="size-4 text-marca-600"/><span>{event.data.venueName ?? event.data.venueCode}</span></Link> : <p className="mt-2 text-sm text-slate-500">Sede por confirmar.</p>}</div>
    </div></Tarjeta>
    <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"><span className="flex size-12 items-center justify-center rounded-2xl bg-marca-50 text-marca-700 dark:bg-slate-800 dark:text-marca-50"><Ticket aria-hidden="true" className="size-6"/></span><h2 className="mt-4 text-xl font-black">Entradas</h2><fieldset className="mt-4 space-y-2"><legend className="mb-2 text-sm font-medium">Tipo de entrada</legend>{Object.entries(TIPOS_TICKET).map(([value, label]) => <label key={value} className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 text-sm font-medium transition ${type === value ? 'border-marca-600 bg-marca-50 text-marca-700 dark:bg-slate-800 dark:text-marca-50' : 'border-slate-300 hover:border-marca-500 dark:border-slate-700'}`}><input type="radio" name="ticketType" value={value} checked={type === value} onChange={() => { const parsed = TicketTypeSchema.safeParse(value); if (parsed.success) setType(parsed.data) }} className="accent-marca-600"/>{label}</label>)}</fieldset><div className="mt-5 space-y-4">
      {event.data.status !== 'PUBLISHED' ? <Button className="w-full" disabled>{event.data.status === 'SOLD_OUT' ? 'Agotado' : 'Compra no disponible'}</Button> : canBuy ? <Button className="w-full" onClick={() => { purchase.reset(); setConfirmOpen(true) }}><ShieldCheck aria-hidden="true" className="size-4"/>Comprar entrada</Button> : sesion.estado === 'autenticado' ? <p className="text-sm text-slate-500">La compra está disponible para cuentas USER.</p> : <Button className="w-full" onClick={() => navigate(RUTAS.login, { state: { desde: `${location.pathname}${location.search}` } })}>Inicia sesión para comprar</Button>}
      <p className="text-center text-xs leading-5 text-slate-500">El precio lo define el sistema al confirmar. El servidor valida edad y disponibilidad.</p></div></aside>
    <dialog ref={dialogRef} onCancel={(event) => { event.preventDefault(); setConfirmOpen(false) }} onClick={(event) => { if (event.target === event.currentTarget) setConfirmOpen(false) }} aria-labelledby="confirmar-compra-titulo" className="w-[min(92vw,32rem)] rounded-3xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/60 dark:border-slate-800 dark:bg-slate-900 dark:text-white">
      <div className="space-y-5 p-6 sm:p-7"><div><p className="text-sm font-bold uppercase tracking-wider text-marca-600">Confirma tu selección</p><h2 id="confirmar-compra-titulo" className="mt-2 text-2xl font-black">Comprar entrada</h2><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">Vas a solicitar una entrada {TIPOS_TICKET[type].toLowerCase()} para {event.data.name}. El servidor comprobará la edad y la disponibilidad.</p></div>{purchase.isError && <Aviso>{purchase.error.message}</Aviso>}<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button variant="secondary" onClick={() => { setConfirmOpen(false); purchase.reset() }}>Volver</Button><Button loading={purchase.isPending} onClick={() => purchase.mutate(type)}>Confirmar compra</Button></div></div>
    </dialog>
  </div></div>
}
