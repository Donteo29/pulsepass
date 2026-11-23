import { z } from 'zod'
import { get } from '../../lib/http'
import { VenueSchema } from '../../lib/tipos'

const VenueListSchema = z.array(VenueSchema)
export const listarSedesActivas = () => get('/venues/active', VenueListSchema)
export const consultarSede = (code: string) => get(`/venues/${encodeURIComponent(code)}`, VenueSchema)
