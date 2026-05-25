import { useState } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { ConnectionType } from '@/types/user.types'
import { OnboardingProgress } from '@/components/ui/onboarding-progress'

const OPTIONS: { key: ConnectionType; emoji: string; label: string; desc: string; color: string[] }[] = [
  { key: 'amour', emoji: '❤️', label: 'Amour', desc: 'Je cherche une relation amoureuse', color: ['#FF6B9D', '#FF4757'] },
  { key: 'amitié', emoji: '🤝', label: 'Amitié', desc: 'Je cherche des ami·e·s musicaux', color: ['#5C7CFA', '#7950F2'] },
  { key: 'les deux', emoji: '✨', label: 'Les deux', desc: 'Ouvert·e à l\'amour et à l\'amitié', color: ['#FF6B9D', '#7950F2'] },
]

export default function OnboardingConnectionScreen() {
  const router = useRouter()
  const { setConnectionType, connectionType } = useOnboardingStore()
  const [selected, setSelected] = useState<ConnectionType | null>(connectionType)

  const handleNext = () => {
    if (!selected) return
    setConnectionType(selected)
    router.push('/(auth)/onboarding/preferences')
  }

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingProgress step={3} total={5} />

      <View style={styles.content}>
        <Text style={styles.title}>Tu cherches quoi ?</Text>
        <Text style={styles.subtitle}>Pas de panique, tu pourras changer d'avis plus tard</Text>

        <View style={styles.options}>
          {OPTIONS.map((opt) => (
            <Pressable
              key={opt.key}
              style={[styles.card, selected === opt.key && styles.cardActive]}
              onPress={() => setSelected(opt.key)}>
              <Text style={styles.emoji}>{opt.emoji}</Text>
              <View style={styles.cardText}>
                <Text style={[styles.cardLabel, selected === opt.key && styles.cardLabelActive]}>
                  {opt.label}
                </Text>
                <Text style={styles.cardDesc}>{opt.desc}</Text>
              </View>
              <View style={[styles.radio, selected === opt.key && styles.radioActive]}>
                {selected === opt.key && <View style={styles.radioDot} />}
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          style={[styles.btn, !selected && styles.btnDisabled]}
          onPress={handleNext}
          disabled={!selected}>
          <Text style={styles.btnText}>Continuer →</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  content: { flex: 1, paddingHorizontal: Spacing.base, paddingTop: Spacing.xl },
  title: { fontSize: Typography['2xl'], fontWeight: '800', color: Colors.black, marginBottom: Spacing.xs },
  subtitle: { fontSize: Typography.sm, color: Colors.gray[500], marginBottom: Spacing['2xl'] },
  options: { gap: Spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.gray[200],
    backgroundColor: Colors.gray[50],
    gap: Spacing.base,
  },
  cardActive: { borderColor: Colors.love.primary, backgroundColor: Colors.love.light },
  emoji: { fontSize: 32 },
  cardText: { flex: 1 },
  cardLabel: { fontSize: Typography.base, fontWeight: '700', color: Colors.black },
  cardLabelActive: { color: Colors.love.secondary },
  cardDesc: { fontSize: Typography.sm, color: Colors.gray[500], marginTop: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.gray[300], alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: Colors.love.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.love.primary },
  footer: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.lg },
  btn: { backgroundColor: Colors.love.primary, borderRadius: BorderRadius.full, paddingVertical: Spacing.base, alignItems: 'center' },
  btnDisabled: { backgroundColor: Colors.gray[200] },
  btnText: { fontSize: Typography.md, fontWeight: '700', color: Colors.white },
})
