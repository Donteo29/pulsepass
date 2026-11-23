import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { server } from './mocks/server'

beforeAll(() => {
  server.listen()
  const interceptedFetch = globalThis.fetch
  vi.stubGlobal('fetch', (input: RequestInfo | URL, init?: RequestInit) => {
    const resolvedInput = typeof input === 'string'
      ? new URL(input, window.location.origin)
      : input
    return interceptedFetch(resolvedInput, init)
  })
})

afterEach(() => {
  cleanup()
  server.resetHandlers()
  sessionStorage.clear()
  vi.restoreAllMocks()
})

afterAll(() => {
  server.close()
  vi.unstubAllGlobals()
})
