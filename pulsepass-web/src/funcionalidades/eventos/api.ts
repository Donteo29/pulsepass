import { z } from 'zod'
import { get, patch, post } from '../../lib/http'
import { ArtistSchema, EventSchema } from '../../lib/tipos'

const EventListSchema = z.array(EventSchema)
const EventActionSchema = z.union([EventSchema, z.undefined()])
export const listarEventosPublicados = () => get('/events/published', EventListSchema)
export const consultarEvento = (code: string) => get(`/events/${encodeURIComponent(code)}`, EventSchema)
export const consultarEventosPorArtista = (stageName: string) => get(`/events/by-artist?stageName=${encodeURIComponent(stageName)}`, EventListSchema)
export const crearEvento = (data: unknown) => post('/events', data, EventSchema)
export const publicarEvento = (code: string) => patch(`/events/${encodeURIComponent(code)}/publish`, undefined, EventActionSchema)
export const asociarArtista = (code: string, artistId: number) => post(`/events/${encodeURIComponent(code)}/artists/${artistId}`, undefined, EventActionSchema)
export const ArtistaRespuestaSchema = ArtistSchema
