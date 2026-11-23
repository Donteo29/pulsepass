import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AuthProvider, useAuth } from '../funcionalidades/auth/AuthContext'
import Login from '../pages/Login'
import Registro from '../pages/Registro'

function SessionHarness() {
  const { sesion, iniciarSesion } = useAuth()
  const logIn = async () => {
    try {
      await iniciarSesion('ana', 'LongPassword2026!')
    } catch {
      // The visible error is asserted by the form tests.
    }
  }
  return <>
    <output data-testid="session-state">{sesion.estado}</output>
    {sesion.estado === 'autenticado'
      && <output data-testid="session-user">{sesion.usuario.username}</output>}
    <button type="button" onClick={() => void logIn()}>Probar login</button>
  </>
}

function renderLogin() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login/>}/>
          <Route path="/" element={<p>Inicio PulsePass</p>}/>
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

function renderRegistration() {
  return render(
    <MemoryRouter initialEntries={['/registro']}>
      <Routes>
        <Route path="/registro" element={<Registro/>}/>
        <Route path="/login" element={<p>Tu cuenta quedó creada. Inicia sesión para continuar.</p>}/>
      </Routes>
    </MemoryRouter>,
  )
}

describe('autenticación y formularios', () => {
  it('inicia sesión, consulta /auth/me y guarda una sesión validada', async () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <SessionHarness/>
        </MemoryRouter>
      </AuthProvider>,
    )

    fireEvent.click(await screen.findByRole('button', { name: 'Probar login' }))

    await waitFor(() => {
      expect(screen.getByTestId('session-state')).toHaveTextContent('autenticado')
    })
    expect(screen.getByTestId('session-user')).toHaveTextContent('ana')
    expect(JSON.parse(sessionStorage.getItem('pulsepass.session') ?? '{}'))
      .toMatchObject({ token: 'test-access-token', usuario: { roles: ['USER'] } })
  })

  it('no envía login cuando faltan las credenciales', async () => {
    renderLogin()
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('Ingresa tu usuario o correo')).toBeInTheDocument()
    expect(await screen.findByText('Ingresa tu contraseña')).toBeInTheDocument()
  })

  it('no envía el registro si la contraseña no alcanza el mínimo', async () => {
    renderRegistration()
    fireEvent.change(screen.getByLabelText('Nombre de usuario'), { target: { value: 'ana' } })
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'ana@example.test' } })
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } })
    fireEvent.change(screen.getByLabelText('Apellido'), { target: { value: 'Perez' } })
    fireEvent.change(screen.getByLabelText('Fecha de nacimiento'), { target: { value: '1995-05-15' } })
    fireEvent.change(screen.getByLabelText(/^Contraseña/), { target: { value: 'corta' } })
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByText('Usa al menos 12 caracteres')).toBeInTheDocument()
  })

  it('registra la cuenta y muestra la confirmación para iniciar sesión', async () => {
    renderRegistration()
    fireEvent.change(screen.getByLabelText('Nombre de usuario'), { target: { value: 'ana' } })
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'ana@example.test' } })
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } })
    fireEvent.change(screen.getByLabelText('Apellido'), { target: { value: 'Perez' } })
    fireEvent.change(screen.getByLabelText('Fecha de nacimiento'), { target: { value: '1995-05-15' } })
    fireEvent.change(screen.getByLabelText(/^Contraseña/), { target: { value: 'LongPassword2026!' } })
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByText(
      'Tu cuenta quedó creada. Inicia sesión para continuar.',
    )).toBeInTheDocument()
  })
})
