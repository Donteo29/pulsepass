export const RUTAS = {
  inicio: '/', eventos: '/eventos', evento: (code: string) => `/eventos/${encodeURIComponent(code)}`,
  artistas: '/artistas', artista: (id: number) => `/artistas/${id}`, sedes: '/sedes', sede: (code: string) => `/sedes/${encodeURIComponent(code)}`,
  login: '/login', registro: '/registro', cuenta: '/cuenta', misTickets: '/mis-tickets', ticket: (code: string) => `/mis-tickets/${encodeURIComponent(code)}`,
  confirmacion: (code: string) => `/compra/confirmacion/${encodeURIComponent(code)}`, validacion: '/staff/validacion',
  ticketsEvento: (code: string) => `/staff/eventos/${encodeURIComponent(code)}/tickets`, adminEventos: '/admin/eventos',
  crearEvento: '/admin/eventos/nuevo', gestionarEvento: (code: string) => `/admin/eventos/${encodeURIComponent(code)}`,
  sinPermisos: '/403',
} as const

export function construirQuery(values: Record<string, string | undefined>): string {
  const params = new URLSearchParams()
  Object.entries(values).forEach(([key, value]) => { if (value) params.set(key, value) })
  const query = params.toString()
  return query ? `?${query}` : ''
}
