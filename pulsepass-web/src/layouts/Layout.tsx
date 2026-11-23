import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { ArrowRight, LogOut, Menu, Moon, Sun, TicketCheck, X } from 'lucide-react'
import { useAuth } from '../funcionalidades/auth/AuthContext'
import { RUTAS } from '../lib/rutas'
import { Button } from '../componentes/ui'

export default function Layout() {
  const { sesion, cerrarSesion } = useAuth()
  const location = useLocation()
  const [menu, setMenu] = useState({ path: location.pathname, abierto: false })
  const menuAbierto = menu.path === location.pathname && menu.abierto
  const [tema, setTema] = useState<'claro' | 'oscuro'>(() => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro')
  const navigate = useNavigate()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', tema === 'oscuro')
  }, [tema])

  const cambiarTema = () => setTema((actual) => actual === 'oscuro' ? 'claro' : 'oscuro')

  useEffect(() => {
    const onExpired = () => {
      navigate(RUTAS.login, { replace: true, state: { motivo: 'expirada' } })
    }
    window.addEventListener('pulsepass:unauthorized', onExpired)
    return () => window.removeEventListener('pulsepass:unauthorized', onExpired)
  }, [navigate])

  const isAuthed = sesion.estado === 'autenticado'
  const roles = isAuthed ? sesion.usuario.roles : []
  const links = [
    { to: RUTAS.eventos, label: 'Eventos' }, { to: RUTAS.artistas, label: 'Artistas' }, { to: RUTAS.sedes, label: 'Sedes' },
    ...(roles.includes('USER') ? [{ to: RUTAS.misTickets, label: 'Mis tickets' }] : []),
    ...(roles.includes('STAFF') || roles.includes('ADMIN') ? [{ to: RUTAS.validacion, label: 'Validar ingreso' }] : []),
    ...(roles.includes('ADMIN') ? [{ to: RUTAS.adminEventos, label: 'Administrar' }] : []),
  ]

  return <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <a href="#contenido" className="sr-only z-50 rounded bg-white p-3 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Saltar al contenido</a>
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex min-h-[4.5rem] max-w-6xl items-center justify-between gap-4 px-4">
        <Link to={RUTAS.inicio} className="flex shrink-0 items-center gap-2 text-xl font-black tracking-tight text-slate-950 focus-visible:outline-2 focus-visible:outline-marca-600 dark:text-white"><span className="grid size-9 place-items-center rounded-xl bg-marca-600 text-white"><TicketCheck aria-hidden="true" className="size-5"/></span>Pulse<span className="text-marca-600">Pass</span></Link>
        <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
          {links.map(({ to, label }) => <NavLink key={to} to={to} className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-marca-600 ${isActive ? 'bg-marca-50 text-marca-700 dark:bg-slate-800 dark:text-marca-50' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'}`}>{label}</NavLink>)}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <button type="button" aria-label={tema === 'oscuro' ? 'Activar modo claro' : 'Activar modo oscuro'} aria-pressed={tema === 'oscuro'} onClick={cambiarTema} className="grid size-10 place-items-center rounded-xl text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-marca-600 dark:text-slate-300 dark:hover:bg-slate-800">{tema === 'oscuro' ? <Sun aria-hidden="true" className="size-4"/> : <Moon aria-hidden="true" className="size-4"/>}</button>
          {isAuthed ? <><Link to={RUTAS.cuenta} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">{sesion.usuario.username}</Link><Button variant="ghost" className="min-h-10 px-3" onClick={() => { cerrarSesion(); navigate(RUTAS.inicio) }}><LogOut aria-hidden="true" className="size-4"/>Salir</Button></> : <><Link to={RUTAS.login} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">Ingresar</Link><Link to={RUTAS.registro} className="inline-flex min-h-10 items-center gap-1 rounded-xl bg-marca-600 px-4 text-sm font-semibold text-white hover:bg-marca-700">Crear cuenta<ArrowRight aria-hidden="true" className="size-4"/></Link></>}
        </div>
        <button type="button" aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menuAbierto} onClick={() => setMenu({ path: location.pathname, abierto: !menuAbierto })} className="grid size-11 place-items-center rounded-xl text-slate-800 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-marca-600 md:hidden dark:text-white dark:hover:bg-slate-800">{menuAbierto ? <X aria-hidden="true"/> : <Menu aria-hidden="true"/>}</button>
      </div>
      {menuAbierto && <nav aria-label="Navegación móvil" className="border-t border-slate-200 px-4 py-3 md:hidden dark:border-slate-800"><div className="mx-auto grid max-w-6xl gap-1"><button type="button" onClick={cambiarTema} className="flex min-h-11 items-center gap-2 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">{tema === 'oscuro' ? <Sun aria-hidden="true" className="size-4"/> : <Moon aria-hidden="true" className="size-4"/>}{tema === 'oscuro' ? 'Modo claro' : 'Modo oscuro'}</button>{links.map(({ to, label }) => <NavLink key={to} to={to} className={({ isActive }) => `min-h-11 rounded-xl px-3 py-3 text-sm font-semibold ${isActive ? 'bg-marca-50 text-marca-700 dark:bg-slate-800 dark:text-marca-50' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'}`}>{label}</NavLink>)}<div className="mt-2 flex gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">{isAuthed ? <><Link className="min-h-11 flex-1 rounded-xl px-3 py-3 text-sm font-semibold" to={RUTAS.cuenta}>Mi cuenta</Link><button className="min-h-11 rounded-xl px-3 py-3 text-sm font-semibold" onClick={() => { cerrarSesion(); navigate(RUTAS.inicio) }}>Salir</button></> : <><Link className="min-h-11 flex-1 rounded-xl bg-slate-100 px-3 py-3 text-center text-sm font-semibold dark:bg-slate-800" to={RUTAS.login}>Ingresar</Link><Link className="min-h-11 flex-1 rounded-xl bg-marca-600 px-3 py-3 text-center text-sm font-semibold text-white" to={RUTAS.registro}>Crear cuenta</Link></>}</div></div></nav>}
    </header>
    <main id="contenido" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-10"><Outlet/></main>
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"><div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between dark:text-slate-400"><p>© 2026 PulsePass · Caso de estudio académico</p><div className="flex gap-4"><Link className="hover:text-marca-600" to={RUTAS.sedes}>Sedes</Link><Link className="hover:text-marca-600" to={RUTAS.artistas}>Artistas</Link></div></div></footer>
  </div>
}
