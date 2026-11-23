import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router'
import { UserRoundPlus } from 'lucide-react'
import { registrarUsuario } from '../funcionalidades/usuarios/api'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'
import { Aviso, Button, Campo, Tarjeta } from '../componentes/ui'

const RegistroSchema = z.object({
  username: z.string().trim().min(1, 'Ingresa un nombre de usuario'),
  email: z.email('Ingresa un correo válido'),
  firstName: z.string().trim().min(1, 'Ingresa tu nombre'),
  lastName: z.string().trim().min(1, 'Ingresa tu apellido'),
  birthDate: z.string().min(1, 'Ingresa tu fecha de nacimiento').refine((value) => value <= new Date().toISOString().slice(0, 10), 'La fecha no puede ser futura'),
  password: z.string().min(12, 'Usa al menos 12 caracteres').refine((value) => new TextEncoder().encode(value).length <= 72, 'La contraseña no puede superar 72 bytes'),
})
type RegistroValues = z.infer<typeof RegistroSchema>
const fields = ['username', 'email', 'firstName', 'lastName', 'birthDate', 'password'] as const

export default function Registro() {
  const navigate = useNavigate()
  const [apiError, setApiError] = useState('')
  const form = useForm<RegistroValues>({ resolver: zodResolver(RegistroSchema), defaultValues: { username: '', email: '', firstName: '', lastName: '', birthDate: '', password: '' } })
  const onSubmit = form.handleSubmit(async (values) => {
    setApiError('')
    try {
      await registrarUsuario(values)
      navigate(RUTAS.login, { replace: true, state: { aviso: 'Tu cuenta quedó creada. Inicia sesión para continuar.' } })
    } catch (error) {
      if (error instanceof ApiError) {
        let asignado = false
        for (const [field, message] of Object.entries(error.details)) {
          if (fields.some((name) => name === field)) { form.setError(field as keyof RegistroValues, { message }); asignado = true }
        }
        setApiError(asignado ? '' : error.message)
      } else setApiError('No pudimos crear la cuenta. Inténtalo de nuevo.')
    }
  })
  return <div className="mx-auto max-w-2xl"><Tarjeta className="p-6 sm:p-8"><div className="flex items-center gap-4"><span className="grid size-12 place-items-center rounded-2xl bg-marca-50 text-marca-700 dark:bg-slate-800 dark:text-marca-50"><UserRoundPlus aria-hidden="true"/></span><div><p className="text-sm font-bold uppercase tracking-wider text-marca-600">Únete a la experiencia</p><h1 className="mt-1 text-2xl font-black">Crea tu cuenta</h1></div></div><p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Completa tus datos para descubrir eventos y guardar tus entradas.</p>{apiError && <div className="mt-5"><Aviso>{apiError}</Aviso></div>}
    <form onSubmit={onSubmit} className="mt-6 grid gap-4 sm:grid-cols-2"><Campo label="Nombre de usuario" autoComplete="username" {...form.register('username')} error={form.formState.errors.username?.message}/><Campo label="Correo electrónico" type="email" autoComplete="email" {...form.register('email')} error={form.formState.errors.email?.message}/><Campo label="Nombre" autoComplete="given-name" {...form.register('firstName')} error={form.formState.errors.firstName?.message}/><Campo label="Apellido" autoComplete="family-name" {...form.register('lastName')} error={form.formState.errors.lastName?.message}/><Campo label="Fecha de nacimiento" type="date" {...form.register('birthDate')} error={form.formState.errors.birthDate?.message}/><Campo label="Contraseña" type="password" autoComplete="new-password" hint="Mínimo 12 caracteres." {...form.register('password')} error={form.formState.errors.password?.message}/><Button type="submit" className="sm:col-span-2" loading={form.formState.isSubmitting}>Crear cuenta</Button></form>
    <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-400">¿Ya tienes cuenta? <Link to={RUTAS.login} className="font-bold text-marca-700 hover:underline dark:text-marca-50">Inicia sesión</Link></p></Tarjeta></div>
}
