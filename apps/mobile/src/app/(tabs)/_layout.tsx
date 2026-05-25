import { useEffect } from 'react'
import { Tabs, useRouter } from 'expo-router'
import { Platform, View, StyleSheet } from 'react-native'
import { useAuthStore } from '@/stores/auth.store'
import { Colors } from '@/constants/theme'
import { EventsIcon, LikesIcon, DiscoverIcon, MatchesIcon, ProfileIcon } from '@/components/ui/tab-icons'

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
          fontSize: 10,
          fontWeight: '600',
        },
      }}>

      {/* 1 — Événements */}
      <Tabs.Screen
        name="events"
        options={{
          title: 'Événements',
          tabBarIcon: ({ color, size }) => <EventsIcon color={color as string} size={size} />,
        }}
      />

      {/* 2 — Likes reçus */}
      <Tabs.Screen
        name="likes"
        options={{
          title: 'Likes',
          tabBarIcon: ({ color, size }) => <LikesIcon color={color as string} size={size} />,
        }}
      />

      {/* 3 — Découverte (centre) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Découverte',
          tabBarIcon: ({ focused, size }) => (
            <View style={[styles.discoverWrap, focused && styles.discoverWrapActive]}>
              <DiscoverIcon color={focused ? '#fff' : Colors.gray[400]} size={size - 2} />
            </View>
          ),
          tabBarActiveTintColor: Colors.love.primary,
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopColor: Colors.gray[200],
            height: Platform.select({ ios: 84, android: 64 }),
            paddingBottom: Platform.select({ ios: 28, android: 8 }),
          },
        }}
      />

      {/* 4 — Matchs */}
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Matchs',
          tabBarIcon: ({ color, size }) => <MatchesIcon color={color as string} size={size} />,
        }}
      />

      {/* 5 — Profil */}
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

const styles = StyleSheet.create({
  discoverWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Platform.select({ ios: 6, android: 0 }),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  discoverWrapActive: {
    backgroundColor: Colors.love.primary,
    shadowColor: Colors.love.primary,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
})
