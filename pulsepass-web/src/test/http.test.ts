import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { server } from './mocks/server'
import { ApiError, get } from '../lib/http'
import { AuthUserSchema } from '../lib/tipos'

describe('cliente HTTP', () => {
  afterEach(() => {
    window.removeEventListener('pulsepass:unauthorized', onUnauthorized)
  })

  const onUnauthorized = vi.fn()

  it('envía el Bearer token y valida la respuesta con Zod', async () => {
    sessionStorage.setItem('pulsepass.session', JSON.stringify({
      token: 'token-local',
      expiresAt: Date.now() + 60_000,
    }))
    let authorization: string | null = null
    server.use(http.get('http://localhost/api/auth/me', ({ request }) => {
      authorization = request.headers.get('Authorization')
      return HttpResponse.json({
        identifier: 3,
        username: 'ana',
        email: 'ana@example.test',
        roles: ['USER'],
      })
    }))

    const result = await get('/auth/me', AuthUserSchema)

    expect(authorization).toBe('Bearer token-local')
    expect(result.identifier).toBe(3)
    expect(result.roles).toEqual(['USER'])
  })

  it('convierte ErrorResponse en ApiError conservando status y details', async () => {
    server.use(http.get('http://localhost/api/conflict', () => HttpResponse.json({
      timestamp: '2026-11-21T12:00:00',
      status: 409,
      error: 'Conflict',
      message: 'El evento ya existe.',
      details: { eventCode: 'Código duplicado' },
    }, { status: 409 })))

    await expect(get('/conflict', AuthUserSchema)).rejects.toMatchObject({
      name: 'ApiError',
      status: 409,
      message: 'El evento ya existe.',
      details: { eventCode: 'Código duplicado' },
    })
  })

  it('usa un mensaje seguro cuando el cuerpo de error no cumple el contrato', async () => {
    server.use(http.get('http://localhost/api/malformed-error', () =>
      HttpResponse.json({ internal: 'stack trace' }, { status: 500 })))

    await expect(get('/malformed-error', AuthUserSchema)).rejects.toMatchObject({
      name: 'ApiError',
      status: 500,
      message: 'Ocurrió un error inesperado. Inténtalo más tarde.',
    })
  })

  it('emite el evento de sesión expirada al recibir 401', async () => {
    sessionStorage.setItem('pulsepass.session', JSON.stringify({
      token: 'expired-token',
      expiresAt: Date.now() + 60_000,
    }))
    window.addEventListener('pulsepass:unauthorized', onUnauthorized)
    server.use(http.get('http://localhost/api/auth/me', () => HttpResponse.json({
      status: 401,
      error: 'Unauthorized',
      message: 'Authentication is required.',
      details: {},
    }, { status: 401 })))

    await expect(get('/auth/me', AuthUserSchema)).rejects.toBeInstanceOf(ApiError)
    expect(onUnauthorized).toHaveBeenCalledOnce()
  })
})
