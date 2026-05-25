import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { Colors, Spacing, BorderRadius } from '@/constants/theme'

type Props = { step: number; total: number }

export function OnboardingProgress({ step, total }: Props) {
  const router = useRouter()
  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>←</Text>
      </Pressable>
      <View style={styles.track}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i < step && styles.dotActive, i === step - 1 && styles.dotCurrent]}
          />
        ))}
      </View>
      <Text style={styles.counter}>{step}/{total}</Text>
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
  track: { flex: 1, flexDirection: 'row', gap: Spacing.xs },
  dot: {
    flex: 1,
    height: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray[200],
  },
  dotActive: { backgroundColor: Colors.love.primary },
  dotCurrent: { backgroundColor: Colors.love.primary },
  counter: { fontSize: 12, color: Colors.gray[400], fontWeight: '600', minWidth: 28, textAlign: 'right' },
})
