import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useNavigate } from 'react-router'
import { ArrowLeft, CalendarPlus } from 'lucide-react'
import { crearEvento } from '../funcionalidades/eventos/api'
import { listarSedesActivas } from '../funcionalidades/sedes/api'
import { ApiError } from '../lib/http'
import { Aviso, Button, Campo, EstadoCargando, EstadoError, Selector, Tarjeta } from '../componentes/ui'
import { EventCategorySchema, CATEGORIAS } from '../lib/tipos'
import { RUTAS } from '../lib/rutas'

const CreateEventSchema = z.object({
  eventCode: z.string().trim().min(1, 'Ingresa el código del evento'),
  name: z.string().trim().min(1, 'Ingresa el nombre del evento'),
  description: z.string().trim().min(1, 'Agrega una descripción'),
  category: EventCategorySchema,
  eventDate: z.string().min(1, 'Selecciona una fecha'),
  minimumAge: z.coerce.number().int().min(0, 'La edad mínima no puede ser negativa'),
  venueCode: z.string().min(1, 'Selecciona una sede'),
})
type CreateEventInput = z.input<typeof CreateEventSchema>
type CreateEventValues = z.output<typeof CreateEventSchema>

export default function AdminCrearEvento() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const venues = useQuery({ queryKey: ['sedes', 'activas'], queryFn: listarSedesActivas, staleTime: 300_000 })
  const form = useForm<CreateEventInput, unknown, CreateEventValues>({ resolver: zodResolver(CreateEventSchema), defaultValues: { eventCode: '', name: '', description: '', category: 'MUSIC', eventDate: '', minimumAge: 0, venueCode: '' } })
  const create = useMutation({ mutationFn: crearEvento, onSuccess: (event) => navigate(RUTAS.gestionarEvento(event.eventCode)) })
  const onSubmit = form.handleSubmit(async (values) => {
    setError('')
    try { await create.mutateAsync({ ...values, eventDate: `${values.eventDate}:00` }) }
    catch (issue) {
      if (issue instanceof ApiError) {
        let mapped = false
        for (const [field, message] of Object.entries(issue.details)) if (field in form.getValues()) { form.setError(field as keyof CreateEventValues, { message }); mapped = true }
        setError(mapped ? '' : issue.message)
      } else setError('No pudimos crear el evento. Inténtalo de nuevo.')
    }
  })
  if (venues.isPending) return <EstadoCargando label="Cargando sedes disponibles"/>
  if (venues.isError) return <EstadoError message={venues.error.message} onRetry={() => void venues.refetch()}/>
  return <div className="mx-auto max-w-3xl space-y-6"><button onClick={() => navigate(RUTAS.adminEventos)} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-marca-700 hover:underline"><ArrowLeft aria-hidden="true" className="size-4"/>Eventos</button><Tarjeta className="p-6 sm:p-8"><div className="flex items-center gap-4"><span className="grid size-12 place-items-center rounded-2xl bg-marca-50 text-marca-700 dark:bg-slate-800 dark:text-marca-50"><CalendarPlus aria-hidden="true"/></span><div><p className="text-sm font-bold uppercase tracking-wider text-marca-600">Administración</p><h1 className="mt-1 text-2xl font-black">Crear evento</h1></div></div><p className="mt-3 text-sm text-slate-600 dark:text-slate-400">El servidor valida la sede y el código; podrás publicar el evento después de crearlo.</p>{venues.data.length === 0 && <div className="mt-5"><Aviso>No hay sedes activas disponibles. Agrega una sede antes de crear el evento.</Aviso></div>}{error && <div className="mt-5"><Aviso>{error}</Aviso></div>}
    <form onSubmit={onSubmit} className="mt-6 grid gap-4 sm:grid-cols-2"><Campo label="Código del evento" placeholder="CMF-2026" {...form.register('eventCode')} error={form.formState.errors.eventCode?.message}/><Campo label="Nombre" placeholder="Caribbean Music Fest" {...form.register('name')} error={form.formState.errors.name?.message}/><Selector label="Categoría" {...form.register('category')}>{Object.entries(CATEGORIAS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Selector><Selector label="Sede" {...form.register('venueCode')} error={form.formState.errors.venueCode?.message}><option value="">Selecciona una sede</option>{venues.data.map((venue) => <option key={venue.code} value={venue.code}>{venue.name} · {venue.city}</option>)}</Selector><Campo label="Fecha y hora" type="datetime-local" {...form.register('eventDate')} error={form.formState.errors.eventDate?.message}/><Campo label="Edad mínima" type="number" min="0" {...form.register('minimumAge')} error={form.formState.errors.minimumAge?.message}/><div className="space-y-1.5 sm:col-span-2"><label htmlFor="descripcion-evento" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Descripción</label><textarea id="descripcion-evento" aria-invalid={Boolean(form.formState.errors.description)} aria-describedby={form.formState.errors.description ? 'descripcion-evento-error' : undefined} rows={5} className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 outline-none focus-visible:border-marca-600 focus-visible:outline-2 focus-visible:outline-marca-600/25 dark:border-slate-700 dark:bg-slate-950" {...form.register('description')}/>{form.formState.errors.description?.message && <span id="descripcion-evento-error" className="block text-sm text-red-600">{form.formState.errors.description.message}</span>}</div><Button type="submit" className="sm:col-span-2" loading={create.isPending} disabled={venues.data.length === 0}>Crear evento</Button></form>
  </Tarjeta></div>
}
