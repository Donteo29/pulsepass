import { createBrowserRouter } from 'react-router'
import type { ComponentType } from 'react'
import Layout from './layouts/Layout'
import { RutaPorRol, RutaProtegida, SoloAnonimo } from './layouts/Guardas'
import Inicio from './pages/Inicio'
import ErrorPagina from './pages/ErrorPagina'

const lazyPage = (load: () => Promise<{ default: ComponentType }>) => async () => ({ Component: (await load()).default })

export const router = createBrowserRouter([{
  path: '/', Component: Layout, errorElement: <ErrorPagina/>, children: [
    { index: true, Component: Inicio },
    { path: 'eventos', lazy: lazyPage(() => import('./pages/CatalogoEventos')) },
    { path: 'eventos/:eventCode', lazy: lazyPage(() => import('./pages/DetalleEvento')) },
    { path: 'artistas', lazy: lazyPage(() => import('./pages/ListaArtistas')) },
    { path: 'artistas/:id', lazy: lazyPage(() => import('./pages/DetalleArtista')) },
    { path: 'sedes', lazy: lazyPage(() => import('./pages/ListaSedes')) },
    { path: 'sedes/:code', lazy: lazyPage(() => import('./pages/DetalleSede')) },
    { element: <SoloAnonimo/>, children: [
      { path: 'login', lazy: lazyPage(() => import('./pages/Login')) },
      { path: 'registro', lazy: lazyPage(() => import('./pages/Registro')) },
    ] },
    { element: <RutaProtegida/>, children: [
      { path: 'cuenta', lazy: lazyPage(() => import('./pages/Cuenta')) },
      { element: <RutaPorRol roles={['USER']}/>, children: [
        { path: 'mis-tickets', lazy: lazyPage(() => import('./pages/MisTickets')) },
        { path: 'mis-tickets/:ticketCode', lazy: lazyPage(() => import('./pages/DetalleTicket')) },
        { path: 'compra/confirmacion/:ticketCode', lazy: lazyPage(() => import('./pages/ConfirmacionCompra')) },
      ] },
      { element: <RutaPorRol roles={['STAFF', 'ADMIN']}/>, children: [
        { path: 'staff/validacion', lazy: lazyPage(() => import('./pages/ValidacionIngreso')) },
        { path: 'staff/eventos/:eventCode/tickets', lazy: lazyPage(() => import('./pages/TicketsPagadosEvento')) },
      ] },
      { element: <RutaPorRol roles={['ADMIN']}/>, children: [
        { path: 'admin/eventos', lazy: lazyPage(() => import('./pages/AdminEventos')) },
        { path: 'admin/eventos/nuevo', lazy: lazyPage(() => import('./pages/AdminCrearEvento')) },
        { path: 'admin/eventos/:eventCode', lazy: lazyPage(() => import('./pages/AdminGestionEvento')) },
      ] },
    ] },
    { path: '403', lazy: lazyPage(() => import('./pages/SinPermisos')) },
    { path: '*', lazy: lazyPage(() => import('./pages/NoEncontrada')) },
  ],
}])
