import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Badge, PrecioCOP } from '../componentes/ui'

describe('componentes visuales comunes', () => {
  it('formatea precios en pesos colombianos sin decimales', () => {
    render(<PrecioCOP value={250_000}/>)
    expect(screen.getByText(/250\.000/)).toBeInTheDocument()
  })

  it('muestra la etiqueta legible de un estado del evento', () => {
    render(<Badge status="PUBLISHED"/>)
    expect(screen.getByText('Publicado')).toBeInTheDocument()
  })
})
