import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { QueryClientProvider } from '@tanstack/react-query'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { queryClient } from '@/lib/queryClient'
import { useAuthStore } from '@/stores/auth.store'

export default function RootLayout() {
  const setStatus = useAuthStore((s) => s.setStatus)

  useEffect(() => {
    // Vérifie la session Supabase au démarrage
    // Pour l'instant on simule : pas de session = non connecté
    const timer = setTimeout(() => {
      setStatus('unauthenticated')
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="conversation/[id]" options={{ presentation: 'card' }} />
            <Stack.Screen name="event/[id]" options={{ presentation: 'card' }} />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
