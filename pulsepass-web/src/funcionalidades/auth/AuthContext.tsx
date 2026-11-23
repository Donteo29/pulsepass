import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { z } from 'zod'
import { consultarSesion, loginApi } from './api'
import { queryClient } from '../../lib/queryClient'
import { AuthUserSchema } from '../../lib/tipos'
import type { AuthUser, Rol } from '../../lib/tipos'

const StoredSessionSchema = z.object({
  token: z.string().min(1),
  expiresAt: z.number().positive(),
  usuario: AuthUserSchema,
})

type Sesion =
  | { estado: 'cargando' }
  | { estado: 'anonimo' }
  | { estado: 'autenticado'; token: string; expiraEn: number; usuario: AuthUser }

interface AuthContextValue {
  sesion: Sesion
  iniciarSesion: (identifier: string, password: string) => Promise<void>
  cerrarSesion: () => void
  tieneRol: (...roles: Rol[]) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion>({ estado: 'cargando' })

  const cerrarSesion = () => {
    sessionStorage.removeItem('pulsepass.session')
    queryClient.clear()
    setSesion({ estado: 'anonimo' })
  }

  useEffect(() => {
    let cancelled = false
    const onUnauthorized = () => {
      sessionStorage.setItem('pulsepass.session-expired', '1')
      cerrarSesion()
    }
    window.addEventListener('pulsepass:unauthorized', onUnauthorized)

    const restoreSession = async () => {
      try {
        const stored = StoredSessionSchema.safeParse(
          JSON.parse(sessionStorage.getItem('pulsepass.session') ?? 'null'),
        )
        if (!stored.success || stored.data.expiresAt <= Date.now()) {
          sessionStorage.removeItem('pulsepass.session')
          if (!cancelled) setSesion({ estado: 'anonimo' })
          return
        }

        const usuario = await consultarSesion()
        if (cancelled) return
        const session = {
          token: stored.data.token,
          expiresAt: stored.data.expiresAt,
          usuario,
        }
        sessionStorage.setItem('pulsepass.session', JSON.stringify(session))
        setSesion({
          estado: 'autenticado',
          token: session.token,
          expiraEn: session.expiresAt,
          usuario,
        })
      } catch {
        sessionStorage.removeItem('pulsepass.session')
        if (!cancelled) setSesion({ estado: 'anonimo' })
      }
    }

    void restoreSession()
    return () => {
      cancelled = true
      window.removeEventListener('pulsepass:unauthorized', onUnauthorized)
    }
  }, [])

  useEffect(() => {
    if (sesion.estado !== 'autenticado') return
    const timeout = window.setTimeout(
      () => window.dispatchEvent(new Event('pulsepass:unauthorized')),
      Math.max(0, sesion.expiraEn - Date.now()),
    )
    return () => window.clearTimeout(timeout)
  }, [sesion])

  const iniciarSesion = async (identifier: string, password: string) => {
    const response = await loginApi(identifier, password)
    const expiraEn = Date.now() + response.expiresIn * 1000
    sessionStorage.setItem('pulsepass.session', JSON.stringify({
      token: response.accessToken,
      expiresAt: expiraEn,
    }))
    try {
      const usuario = await consultarSesion()
      sessionStorage.setItem('pulsepass.session', JSON.stringify({
        token: response.accessToken,
        expiresAt: expiraEn,
        usuario,
      }))
      sessionStorage.removeItem('pulsepass.session-expired')
      setSesion({
        estado: 'autenticado',
        token: response.accessToken,
        expiraEn,
        usuario,
      })
    } catch (error) {
      sessionStorage.removeItem('pulsepass.session')
      throw error
    }
  }

  const value = useMemo<AuthContextValue>(() => ({
    sesion,
    iniciarSesion,
    cerrarSesion,
    tieneRol: (...roles) => sesion.estado === 'autenticado'
      && roles.some((rol) => sesion.usuario.roles.includes(rol)),
  }), [sesion])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// oxlint-disable-next-line react/only-export-components
export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return value
}
