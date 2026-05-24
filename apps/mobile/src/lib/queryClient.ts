// ============================================================
// HEAR ME — TanStack Query Client
// Gestion du cache et des requêtes réseau
// ============================================================

import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Données considérées fraîches pendant 2 minutes
      staleTime: 1000 * 60 * 2,
      // Cache gardé en mémoire pendant 10 minutes
      gcTime: 1000 * 60 * 10,
      // Pas de retry automatique sur les erreurs 4xx
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) return false
        return failureCount < 2
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})
