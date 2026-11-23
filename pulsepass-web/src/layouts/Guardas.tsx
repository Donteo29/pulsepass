import { Navigate, Outlet, useLocation } from 'react-router'
import type { Rol } from '../lib/tipos'
import { RUTAS } from '../lib/rutas'
import { useAuth } from '../funcionalidades/auth/AuthContext'
import { EstadoCargando } from '../componentes/ui'

export function RutaProtegida() {
  const { sesion } = useAuth()
  const location = useLocation()
  if (sesion.estado === 'cargando') {
    return <EstadoCargando label="Validando tu sesión"/>
  }
  if (sesion.estado === 'anonimo') {
    const expirada = sessionStorage.getItem('pulsepass.session-expired') === '1'
    if (expirada) sessionStorage.removeItem('pulsepass.session-expired')
    return <Navigate to={RUTAS.login} replace state={{
      desde: location.pathname + location.search,
      ...(expirada ? { motivo: 'expirada' } : {}),
    }}/>
  }
  return <Outlet/>
}

export function RutaPorRol({ roles }: { roles: Rol[] }) {
  const { sesion } = useAuth()
  if (sesion.estado === 'cargando') {
    return <EstadoCargando label="Validando permisos"/>
  }
  if (sesion.estado === 'anonimo') {
    return <Navigate to={RUTAS.login} replace/>
  }
  if (!sesion.usuario.roles.some((role) => roles.includes(role))) {
    return <Navigate to={RUTAS.sinPermisos} replace/>
  }
  return <Outlet/>
}

export function SoloAnonimo() {
  const { sesion } = useAuth()
  if (sesion.estado === 'cargando') return <EstadoCargando label="Cargando"/>
  return sesion.estado === 'autenticado'
    ? <Navigate to={RUTAS.inicio} replace/>
    : <Outlet/>
}
