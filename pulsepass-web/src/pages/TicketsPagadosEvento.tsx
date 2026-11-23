import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router'
import { listarTicketsPagados } from '../funcionalidades/tickets/api'
import { Badge, EstadoCargando, EstadoError, EstadoVacio, PrecioCOP, Tarjeta } from '../componentes/ui'

export default function TicketsPagadosEvento() {
  const { eventCode } = useParams<{ eventCode: string }>()
  const query = useQuery({ queryKey: ['tickets', 'pagados', eventCode], queryFn: () => listarTicketsPagados(eventCode ?? ''), enabled: Boolean(eventCode), staleTime: 15_000 })
  if (!eventCode) return <EstadoError message="Indica el código del evento."/>
  if (query.isPending) return <EstadoCargando label="Cargando entradas pagadas"/>
  if (query.isError) return <EstadoError message={query.error.message} onRetry={() => void query.refetch()}/>
  return <div className="space-y-7"><header><p className="text-sm font-bold uppercase tracking-wider text-marca-600">Control del evento</p><h1 className="mt-2 text-3xl font-black">Entradas pagadas</h1><p className="mt-2 text-slate-600 dark:text-slate-400">Evento <span className="font-mono font-semibold">{eventCode}</span> · {query.data.length} entradas</p></header>{query.data.length === 0 ? <EstadoVacio title="Aún no hay entradas pagadas" body="Las ventas confirmadas aparecerán aquí."/> : <Tarjeta className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-slate-100 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800"><tr><th scope="col" className="px-5 py-4">Código</th><th scope="col" className="px-5 py-4">Correo</th><th scope="col" className="px-5 py-4">Tipo</th><th scope="col" className="px-5 py-4">Precio</th><th scope="col" className="px-5 py-4">Estado</th></tr></thead><tbody className="divide-y divide-slate-200 dark:divide-slate-800">{query.data.map((ticket) => <tr key={ticket.ticketCode}><td className="px-5 py-4 font-mono font-semibold">{ticket.ticketCode}</td><td className="px-5 py-4">{ticket.userEmail ?? '—'}</td><td className="px-5 py-4">{ticket.type}</td><td className="px-5 py-4"><PrecioCOP value={ticket.price}/></td><td className="px-5 py-4"><Badge status={ticket.status}/></td></tr>)}</tbody></table></div></Tarjeta>}</div>
}
