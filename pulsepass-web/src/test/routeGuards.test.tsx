import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AuthProvider } from '../funcionalidades/auth/AuthContext'
import { RutaPorRol, RutaProtegida } from '../layouts/Guardas'

function saveSession() {
  sessionStorage.setItem('pulsepass.session', JSON.stringify({
    token: 'token-local',
    expiresAt: Date.now() + 60_000,
    usuario: {
      identifier: 1,
      username: 'ana',
      email: 'ana@example.test',
      roles: ['USER'],
    },
  }))
}

describe('guardas de rutas', () => {
  it('redirige una sesión anónima a login y conserva la ruta solicitada', async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/privado']}>
          <Routes>
            <Route element={<RutaProtegida/>}>
              <Route path="/privado" element={<p>Contenido privado</p>}/>
            </Route>
            <Route path="/login" element={<p>Login protegido</p>}/>
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    )

    expect(await screen.findByText('Login protegido')).toBeInTheDocument()
    expect(sessionStorage.getItem('pulsepass.session')).toBeNull()
  })

  it('rechaza USER en una ruta ADMIN', async () => {
    saveSession()
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route element={<RutaProtegida/>}>
              <Route element={<RutaPorRol roles={['ADMIN']}/>}>
                <Route path="/admin" element={<p>Administración</p>}/>
              </Route>
            </Route>
            <Route path="/403" element={<p>Sin permisos</p>}/>
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    )

    expect(await screen.findByText('Sin permisos')).toBeInTheDocument()
  })
})
