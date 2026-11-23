import { z } from 'zod'
import { get, patch, post } from '../../lib/http'
import { TicketSchema } from '../../lib/tipos'

const TicketListSchema = z.array(TicketSchema)
const TicketActionSchema = z.union([TicketSchema, z.undefined()])
export const comprarTicket = (data: unknown) => post('/tickets', data, TicketSchema)
export const consultarTicket = (code: string) => get(`/tickets/${encodeURIComponent(code)}`, TicketSchema)
export const listarTicketsUsuario = (email: string) => get(`/tickets/by-user?email=${encodeURIComponent(email)}`, TicketListSchema)
export const listarTicketsPagados = (eventCode: string) => get(`/events/${encodeURIComponent(eventCode)}/tickets/paid`, TicketListSchema)
export const cancelarTicket = (code: string) => patch(`/tickets/${encodeURIComponent(code)}/cancel`, undefined, TicketActionSchema)
export const usarTicket = (code: string) => patch(`/tickets/${encodeURIComponent(code)}/use`, undefined, TicketActionSchema)
