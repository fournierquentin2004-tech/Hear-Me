import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { Colors, Spacing, BorderRadius } from '@/constants/theme'

type Props = { step: number; total: number; light?: boolean }

export function OnboardingProgress({ step, total, light = false }: Props) {
  const router = useRouter()
  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Text style={[styles.backText, light && styles.backTextLight]}>←</Text>
      </Pressable>
      <View style={styles.track}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              light ? styles.dotLight : styles.dotInactive,
              i < step && (light ? styles.dotActiveLightFull : styles.dotActive),
              i === step - 1 && (light ? styles.dotActiveLightFull : styles.dotActive),
            ]}
          />
        ))}
      </View>
      <Text style={[styles.counter, light && styles.counterLight]}>{step}/{total}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
    gap: Spacing.sm,
  },
  back: { paddingRight: Spacing.sm },
  backText: { fontSize: 22, color: Colors.black },
  backTextLight: { color: Colors.white },
  track: { flex: 1, flexDirection: 'row', gap: Spacing.xs },
  dot: {
    flex: 1,
    height: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray[200],
  },
  dotInactive: { backgroundColor: Colors.gray[200] },
  dotLight: { backgroundColor: 'rgba(255,255,255,0.35)' },
  dotActive: { backgroundColor: Colors.love.primary },
  dotActiveLightFull: { backgroundColor: Colors.white },
  counter: { fontSize: 12, color: Colors.gray[400], fontWeight: '600', minWidth: 28, textAlign: 'right' },
  counterLight: { color: 'rgba(255,255,255,0.85)' },
})
