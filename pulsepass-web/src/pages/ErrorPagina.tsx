import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import { Home, TriangleAlert } from 'lucide-react'
import { RUTAS } from '../lib/rutas'

export default function ErrorPagina() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error) && error.status >= 500
    ? 'Ocurrió un error inesperado. Inténtalo más tarde.'
    : 'No pudimos cargar esta página. Vuelve al inicio e inténtalo de nuevo.'
  return <section className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"><TriangleAlert aria-hidden="true" className="mx-auto size-10 text-amber-500"/><h1 className="mt-4 text-2xl font-black">¡Ups! Algo salió mal.</h1><p className="mt-2 text-slate-600 dark:text-slate-400">{message}</p><Link to={RUTAS.inicio} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-marca-600 px-4 font-semibold text-white hover:bg-marca-700"><Home aria-hidden="true" className="size-4"/>Volver al inicio</Link></section>
}
