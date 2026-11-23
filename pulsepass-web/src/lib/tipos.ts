import { z } from 'zod'

export const EventCategorySchema = z.enum([
  'MUSIC', 'SPORTS', 'TECHNOLOGY', 'EDUCATION', 'CULTURE', 'ENTERTAINMENT',
])
export const EventStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'SOLD_OUT', 'CANCELLED', 'FINISHED'])
export const TicketTypeSchema = z.enum(['GENERAL', 'VIP', 'BACKSTAGE', 'STUDENT'])
export const TicketStatusSchema = z.enum(['RESERVED', 'PAID', 'CANCELLED', 'USED'])
export const RolSchema = z.enum(['USER', 'STAFF', 'ADMIN'])

export const ArtistSchema = z.object({
  id: z.number(), stageName: z.string(), country: z.string().nullish(), genre: z.string().nullish(), active: z.boolean().nullish(),
}).passthrough()
export const VenueSchema = z.object({
  id: z.number().optional(), code: z.string(), name: z.string(), city: z.string(), address: z.string().nullish(), capacity: z.number(), active: z.boolean().nullish(),
}).passthrough()
export const EventSchema = z.object({
  id: z.number().optional(), eventCode: z.string(), name: z.string(), description: z.string().nullish(),
  category: EventCategorySchema, status: EventStatusSchema, eventDate: z.string(), minimumAge: z.number().nullish(),
  venueCode: z.string().nullish(), venueName: z.string().nullish(), artists: z.array(ArtistSchema).optional().default([]),
}).passthrough()
export const UserSchema = z.object({
  id: z.number().optional(), username: z.string(), email: z.string(), active: z.boolean().nullish(),
  firstName: z.string().nullish(), lastName: z.string().nullish(), phone: z.string().nullish(), city: z.string().nullish(), birthDate: z.string().nullish(),
}).passthrough()
export const TicketSchema = z.object({
  id: z.number().optional(), ticketCode: z.string(), type: TicketTypeSchema,
  price: z.union([z.number(), z.string()]).transform(Number).pipe(z.number().finite().nonnegative()), status: TicketStatusSchema,
  purchaseDate: z.string().nullish(), userEmail: z.string().nullish(), eventCode: z.string(), eventName: z.string().nullish(),
}).passthrough()
export const AuthUserSchema = z.object({
  identifier: z.number().int().positive(),
  username: z.string(),
  email: z.string().email(),
  roles: z.array(RolSchema).min(1),
})
export const AuthResponseSchema = z.object({
  accessToken: z.string().min(1),
  tokenType: z.literal('Bearer'),
  expiresIn: z.number().int().positive(),
})
export const ErrorResponseSchema = z.object({
  timestamp: z.string().optional(), status: z.number().optional(), error: z.string().optional(),
  message: z.string().optional(), details: z.record(z.string(), z.string()).optional(),
}).passthrough()

export type Artist = z.infer<typeof ArtistSchema>
export type Venue = z.infer<typeof VenueSchema>
export type Event = z.infer<typeof EventSchema>
export type User = z.infer<typeof UserSchema>
export type Ticket = z.infer<typeof TicketSchema>
export type Rol = z.infer<typeof RolSchema>
export type EventCategory = z.infer<typeof EventCategorySchema>
export type EventStatus = z.infer<typeof EventStatusSchema>
export type TicketType = z.infer<typeof TicketTypeSchema>
export type TicketStatus = z.infer<typeof TicketStatusSchema>
export type AuthUser = z.infer<typeof AuthUserSchema>

export const CATEGORIAS: Record<EventCategory, string> = {
  MUSIC: 'Música', SPORTS: 'Deporte', TECHNOLOGY: 'Tecnología', EDUCATION: 'Educación', CULTURE: 'Cultura', ENTERTAINMENT: 'Entretenimiento',
}
export const TIPOS_TICKET: Record<TicketType, string> = {
  GENERAL: 'General', VIP: 'VIP', BACKSTAGE: 'Backstage', STUDENT: 'Estudiante',
}
export const ESTADOS_EVENTO: Record<EventStatus, string> = {
  DRAFT: 'Borrador', PUBLISHED: 'Publicado', SOLD_OUT: 'Agotado', CANCELLED: 'Cancelado', FINISHED: 'Finalizado',
}
export const ESTADOS_TICKET: Record<TicketStatus, string> = {
  RESERVED: 'Reservado', PAID: 'Pagado', CANCELLED: 'Cancelado', USED: 'Usado',
}
