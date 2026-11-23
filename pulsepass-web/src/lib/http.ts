import { z } from 'zod'
import { ErrorResponseSchema } from './tipos'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'
const StorageSchema = z.object({ token: z.string(), expiresAt: z.number() })

export class ApiError extends Error {
  public status: number
  public details: Record<string, string>
  constructor(status: number, message: string, details: Record<string, string> = {}) {
    super(message)
    this.status = status
    this.details = details
    this.name = 'ApiError'
  }
}

function validarRespuesta<T>(schema: z.ZodType<T>, payload: unknown): T {
  try {
    return schema.parse(payload)
  } catch {
    throw new ApiError(502, 'El servidor devolvió una respuesta con formato inesperado.')
  }
}

export function leerToken(): string | null {
  try {
    const parsed = StorageSchema.safeParse(JSON.parse(sessionStorage.getItem('pulsepass.session') ?? 'null'))
    if (!parsed.success || parsed.data.expiresAt <= Date.now()) return null
    return parsed.data.token
  } catch {
    return null
  }
}

export async function solicitar<T>(path: string, schema: z.ZodType<T>, init: RequestInit = {}): Promise<T> {
  const token = leerToken()
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (init.body) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, { ...init, headers })
  } catch {
    throw new ApiError(0, 'No pudimos conectar con el servidor.')
  }

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null)
    const parsed = ErrorResponseSchema.safeParse(body)
    const message = response.status === 401
      ? 'Credenciales inválidas'
      : response.status >= 500
        ? 'Ocurrió un error inesperado. Inténtalo más tarde.'
        : parsed.success && parsed.data.message
          ? parsed.data.message
          : 'No fue posible completar la solicitud.'
    if (response.status === 401 && token) window.dispatchEvent(new Event('pulsepass:unauthorized'))
    throw new ApiError(response.status, message, parsed.success ? parsed.data.details : {})
  }

  const raw = await response.text()
  if (!raw) return validarRespuesta(schema, undefined)
  try {
    const payload: unknown = JSON.parse(raw)
    return validarRespuesta(schema, payload)
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError(502, 'El servidor devolvió una respuesta con formato inesperado.')
  }
}

export const get = <T,>(path: string, schema: z.ZodType<T>) => solicitar(path, schema)
export const post = <T,>(path: string, body: unknown, schema: z.ZodType<T>) =>
  solicitar(path, schema, { method: 'POST', body: JSON.stringify(body) })
export const patch = <T,>(path: string, body: unknown, schema: z.ZodType<T>) =>
  solicitar(path, schema, { method: 'PATCH', ...(body === undefined ? {} : { body: JSON.stringify(body) }) })
