import { useEffect } from 'react'
import { Platform } from 'react-native'
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
    const timer = setTimeout(() => {
      setStatus('unauthenticated')
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  // Désactive l'overscroll natif du navigateur (évite de voir le blanc sur glissement latéral)
  useEffect(() => {
    if (Platform.OS === 'web') {
      document.body.style.overscrollBehavior = 'none'
      document.documentElement.style.overscrollBehavior = 'none'
      document.body.style.overflow = 'hidden'
    }
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#FF6B9D' }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#FFFFFF' },
              gestureEnabled: false,
            }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
