import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Link, useLocation, useNavigate } from 'react-router'
import { ArrowRight, TicketCheck } from 'lucide-react'
import { useAuth } from '../funcionalidades/auth/AuthContext'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'
import { Aviso, Button, Campo, Tarjeta } from '../componentes/ui'

const LoginSchema = z.object({ identifier: z.string().trim().min(1, 'Ingresa tu usuario o correo'), password: z.string().min(1, 'Ingresa tu contraseña') })
type LoginValues = z.infer<typeof LoginSchema>
const RedirectStateSchema = z.object({ desde: z.string().optional(), motivo: z.string().optional(), aviso: z.string().optional() }).passthrough()

export default function Login() {
  const { iniciarSesion } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [apiError, setApiError] = useState('')
  const redirectState = RedirectStateSchema.safeParse(location.state)
  const form = useForm<LoginValues>({ resolver: zodResolver(LoginSchema), defaultValues: { identifier: '', password: '' } })
  const onSubmit = form.handleSubmit(async (values) => {
    setApiError('')
    try {
      await iniciarSesion(values.identifier, values.password)
      const target = redirectState.success ? redirectState.data.desde : undefined
      navigate(target?.startsWith('/') && !target.startsWith('//') ? target : RUTAS.inicio, { replace: true })
    } catch (error) {
      setApiError(error instanceof ApiError ? error.message : 'No pudimos iniciar sesión. Inténtalo de nuevo.')
    }
  })
  return <div className="mx-auto max-w-md"><Tarjeta className="p-6 sm:p-8"><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-marca-600 text-white"><TicketCheck aria-hidden="true"/></span><div className="mt-4 text-center"><p className="text-sm font-bold uppercase tracking-wider text-marca-600">Qué bueno verte</p><h1 className="mt-2 text-2xl font-black">Inicia sesión</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Continúa con tu cuenta de PulsePass.</p></div>
    {redirectState.success && redirectState.data.aviso && <div className="mt-5"><Aviso type="success">{redirectState.data.aviso}</Aviso></div>}
    {redirectState.success && redirectState.data.motivo === 'expirada' && <div className="mt-5"><Aviso type="info">Tu sesión expiró. Inicia sesión de nuevo para continuar.</Aviso></div>}
    {apiError && <div className="mt-5"><Aviso>{apiError}</Aviso></div>}
    <form onSubmit={onSubmit} className="mt-6 space-y-4"><Campo label="Usuario o correo" autoComplete="username" placeholder="andrea o correo@ejemplo.com" {...form.register('identifier')} error={form.formState.errors.identifier?.message}/><Campo label="Contraseña" type="password" autoComplete="current-password" placeholder="Tu contraseña" {...form.register('password')} error={form.formState.errors.password?.message}/><Button type="submit" className="w-full" loading={form.formState.isSubmitting}>Entrar<ArrowRight aria-hidden="true" className="size-4"/></Button></form>
    <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">¿Aún no tienes cuenta? <Link to={RUTAS.registro} className="font-bold text-marca-700 hover:underline dark:text-marca-50">Regístrate</Link></p></Tarjeta></div>
}
