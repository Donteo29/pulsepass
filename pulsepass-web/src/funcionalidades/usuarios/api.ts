import { get, post } from '../../lib/http'
import { UserSchema } from '../../lib/tipos'

export const registrarUsuario = (data: unknown) => post('/users', data, UserSchema)
export const consultarUsuarioPorEmail = (email: string) => get(`/users/by-email?email=${encodeURIComponent(email)}`, UserSchema)
export const consultarUsuarioPorNombre = (username: string) => get(`/users/by-username?username=${encodeURIComponent(username)}`, UserSchema)
