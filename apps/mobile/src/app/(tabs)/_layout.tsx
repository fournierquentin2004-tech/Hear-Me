import { useEffect } from 'react'
import { Tabs, useRouter } from 'expo-router'
import { Platform } from 'react-native'
import { useAuthStore } from '@/stores/auth.store'
import { Colors } from '@/constants/theme'
import { DiscoverIcon, MatchesIcon, EventsIcon, ProfileIcon } from '@/components/ui/tab-icons'

export default function TabsLayout() {
  const { status } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/(auth)' as any)
    }
  }, [status])

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: Colors.gray[200],
          height: Platform.select({ ios: 84, android: 64 }),
          paddingBottom: Platform.select({ ios: 28, android: 8 }),
        },
        tabBarActiveTintColor: Colors.love.primary,
        tabBarInactiveTintColor: Colors.gray[400],
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Découverte',
          tabBarIcon: ({ color, size }) => <DiscoverIcon color={color as string} size={size} />,
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Matches',
          tabBarIcon: ({ color, size }) => <MatchesIcon color={color as string} size={size} />,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Événements',
          tabBarIcon: ({ color, size }) => <EventsIcon color={color as string} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <ProfileIcon color={color as string} size={size} />,
        }}
      />
    </Tabs>
  )
}
