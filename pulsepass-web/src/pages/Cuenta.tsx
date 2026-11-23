import { useQueries } from '@tanstack/react-query'
import { Mail, MapPin, UserRound } from 'lucide-react'
import { useAuth } from '../funcionalidades/auth/AuthContext'
import { consultarUsuarioPorEmail, consultarUsuarioPorNombre } from '../funcionalidades/usuarios/api'
import { EstadoCargando, EstadoError, Tarjeta } from '../componentes/ui'

export default function Cuenta() {
  const { sesion } = useAuth()
  const email = sesion.estado === 'autenticado' ? sesion.usuario.email : ''
  const username = sesion.estado === 'autenticado' ? sesion.usuario.username : ''
  const [byEmail, byUsername] = useQueries({ queries: [
    { queryKey: ['usuario', email], queryFn: () => consultarUsuarioPorEmail(email), enabled: Boolean(email), staleTime: 60_000 },
    { queryKey: ['usuario', 'username', username], queryFn: () => consultarUsuarioPorNombre(username), enabled: Boolean(username), staleTime: 60_000 },
  ] })
  const profile = byEmail.data ?? byUsername.data
  if (byEmail.isPending || byUsername.isPending) return <EstadoCargando label="Cargando tu cuenta"/>
  if (byEmail.isError && byUsername.isError) return <EstadoError message={byEmail.error.message} onRetry={() => { void byEmail.refetch(); void byUsername.refetch() }}/>
  return <div className="mx-auto max-w-3xl space-y-7"><header><p className="text-sm font-bold uppercase tracking-wider text-marca-600">Tu perfil</p><h1 className="mt-2 text-3xl font-black">Mi cuenta</h1></header><Tarjeta className="p-6 sm:p-8"><span className="grid size-16 place-items-center rounded-2xl bg-marca-50 text-marca-700 dark:bg-slate-800 dark:text-marca-50"><UserRound aria-hidden="true" className="size-8"/></span><h2 className="mt-5 text-2xl font-bold">{[profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || profile?.username || username}</h2><div className="mt-6 grid gap-4 border-t border-slate-200 pt-5 sm:grid-cols-2 dark:border-slate-800"><p className="flex items-center gap-3 text-sm"><Mail aria-hidden="true" className="size-4 text-marca-600"/>{profile?.email ?? email}</p><p className="flex items-center gap-3 text-sm"><UserRound aria-hidden="true" className="size-4 text-marca-600"/>@{profile?.username ?? username}</p>{profile?.city && <p className="flex items-center gap-3 text-sm"><MapPin aria-hidden="true" className="size-4 text-marca-600"/>{profile.city}</p>}<p className="text-sm text-slate-500 dark:text-slate-400">Rol: {sesion.estado === 'autenticado' ? sesion.usuario.roles.join(', ') : ''}</p></div></Tarjeta></div>
}
