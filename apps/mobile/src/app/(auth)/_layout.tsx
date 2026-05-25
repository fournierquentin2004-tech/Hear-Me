import { useEffect } from 'react'
import { Stack, useRouter } from 'expo-router'
import { useAuthStore } from '@/stores/auth.store'

export default function AuthLayout() {
  const { status } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/(tabs)' as any)
    }
  }, [status])

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="phone" />
      <Stack.Screen name="verify" />
      <Stack.Screen name="onboarding/profile" />
      <Stack.Screen name="onboarding/music" />
      <Stack.Screen name="onboarding/connection" />
      <Stack.Screen name="onboarding/preferences" />
      <Stack.Screen name="onboarding/photos" />
    </Stack>
  )
}
