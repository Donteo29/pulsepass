import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './http'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => error instanceof ApiError ? (error.status === 0 || error.status >= 500) && failureCount < 1 : failureCount < 1,
    },
    mutations: { retry: false },
  },
})
