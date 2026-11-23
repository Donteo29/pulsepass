import { get, post } from '../../lib/http'
import { AuthResponseSchema, AuthUserSchema } from '../../lib/tipos'

export const loginApi = (identifier: string, password: string) =>
  post('/auth/login', { identifier, password }, AuthResponseSchema)

export const consultarSesion = () => get('/auth/me', AuthUserSchema)
