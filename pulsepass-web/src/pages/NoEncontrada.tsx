import { ArrowLeft, SearchX } from 'lucide-react'
import { Link } from 'react-router'
import { RUTAS } from '../lib/rutas'

export default function NoEncontrada() {
  return <section className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"><span className="mx-auto grid size-16 place-items-center rounded-full bg-marca-50 text-marca-700 dark:bg-slate-800 dark:text-marca-50"><SearchX aria-hidden="true" className="size-8"/></span><p className="mt-5 text-sm font-black uppercase tracking-widest text-marca-600">404</p><h1 className="mt-2 text-2xl font-black">No encontramos esta página</h1><p className="mt-2 text-slate-600 dark:text-slate-400">Puede que el enlace haya cambiado o que la dirección no exista.</p><Link to={RUTAS.inicio} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-marca-600 px-4 font-semibold text-white hover:bg-marca-700"><ArrowLeft aria-hidden="true" className="size-4"/>Volver al inicio</Link></section>
}
