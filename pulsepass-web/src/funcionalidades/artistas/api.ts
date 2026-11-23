import { z } from 'zod'
import { get } from '../../lib/http'
import { ArtistSchema } from '../../lib/tipos'

const ArtistListSchema = z.array(ArtistSchema)
export const listarArtistasActivos = () => get('/artists/active', ArtistListSchema)
export const consultarArtista = (id: number) => get(`/artists/${id}`, ArtistSchema)
export const consultarArtistaPorNombre = (name: string) => get(`/artists/by-stage-name?stageName=${encodeURIComponent(name)}`, ArtistSchema)
