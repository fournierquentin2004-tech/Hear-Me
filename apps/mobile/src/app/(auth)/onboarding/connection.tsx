import { useState, useRef, useEffect } from 'react'
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Path, Circle } from 'react-native-svg'
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '@/constants/theme'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { ConnectionType } from '@/types/user.types'
import { OnboardingProgress } from '@/components/ui/onboarding-progress'

/* ── Mini-icônes SVG sans emoji ── */
function IconLove({ active }: { active: boolean }) {
  const c = active ? Colors.white : Colors.love.primary
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        fill={active ? 'rgba(255,255,255,0.9)' : Colors.love.light}
        stroke={c}
        strokeWidth={1.5}
      />
    </Svg>
  )
}

function IconFriendship({ active }: { active: boolean }) {
  const c = active ? Colors.white : Colors.friendship.primary
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Circle cx={9}  cy={7} r={3} stroke={c} strokeWidth={1.5} fill={active ? 'rgba(255,255,255,0.9)' : '#EEF2FF'} />
      <Circle cx={15} cy={7} r={3} stroke={c} strokeWidth={1.5} fill={active ? 'rgba(255,255,255,0.9)' : '#EEF2FF'} />
      <Path d="M3 19c0-3.3 2.7-6 6-6" stroke={c} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M21 19c0-3.3-2.7-6-6-6" stroke={c} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  )
}

function IconBoth({ active }: { active: boolean }) {
  const c = active ? Colors.white : '#A855F7'
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"
        fill={active ? 'rgba(255,255,255,0.9)' : '#F3E8FF'}
        stroke={c}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </Svg>
  )
}

const OPTIONS: {
  key: ConnectionType
  label: string
  desc: string
  tagline: string
  accent: [string, string]
}[] = [
  {
    key: 'amour',
    label: 'Amour',
    desc: 'Je cherche une relation amoureuse',
    tagline: 'Trouve ton âme sœur musicale',
    accent: ['#FF6B9D', '#FF4757'],
  },
  {
    key: 'amitié',
    label: 'Amitié',
    desc: "Je cherche des ami·e·s qui partagent mes goûts",
    tagline: 'Agrandis ta tribu musicale',
    accent: ['#5C7CFA', '#7950F2'],
  },
  {
    key: 'les deux',
    label: 'Les deux',
    desc: "Ouvert·e à l'amour et à l'amitié",
    tagline: 'Laisse la musique décider',
    accent: ['#FF6B9D', '#7950F2'],
  },
]

export default function OnboardingConnectionScreen() {
  const router = useRouter()
  const { setConnectionType, connectionType } = useOnboardingStore()
  const [selected, setSelected] = useState<ConnectionType | null>(connectionType)
  const fadeAnim   = useRef(new Animated.Value(0)).current
  const scaleAnims = useRef(OPTIONS.map(() => new Animated.Value(1))).current

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start()
  }, [])

  const handleSelect = (key: ConnectionType, index: number) => {
    setSelected(key)
    Animated.sequence([
      Animated.spring(scaleAnims[index], { toValue: 0.96, useNativeDriver: true, damping: 10 }),
      Animated.spring(scaleAnims[index], { toValue: 1,    useNativeDriver: true, damping: 14 }),
    ]).start()
  }

  const handleNext = () => {
    if (!selected) return
    setConnectionType(selected)
    router.push('/(auth)/onboarding/preferences' as any)
  }

  const selectedOption = OPTIONS.find((o) => o.key === selected)

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={selectedOption ? selectedOption.accent : ['#FF6B9D', '#FF4757']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}>
        <SafeAreaView>
          <OnboardingProgress step={3} total={5} light />
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Tu cherches quoi ?</Text>
            <Text style={styles.headerSub}>
              {selectedOption?.tagline ?? 'Choisis ce qui te correspond le mieux'}
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.hint}>Pas de panique, tu peux changer d'avis plus tard</Text>

        {OPTIONS.map((opt, index) => {
          const isSelected = selected === opt.key
          return (
            <Animated.View key={opt.key} style={{ transform: [{ scale: scaleAnims[index] }] }}>
              <Pressable
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => handleSelect(opt.key, index)}>
                {isSelected && (
                  <LinearGradient
                    colors={[...opt.accent, opt.accent[1] + '22'] as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                )}

                {/* Barre colorée gauche */}
                {!isSelected && (
                  <View style={[styles.accentBar, { backgroundColor: opt.accent[0] }]} />
                )}

                {/* Icône */}
                <View style={[styles.iconBox, isSelected && { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  {opt.key === 'amour'    && <IconLove       active={isSelected} />}
                  {opt.key === 'amitié'   && <IconFriendship active={isSelected} />}
                  {opt.key === 'les deux' && <IconBoth       active={isSelected} />}
                </View>

                <View style={styles.cardBody}>
                  <Text style={[styles.cardLabel, isSelected && styles.cardLabelActive]}>
                    {opt.label}
                  </Text>
                  <Text style={[styles.cardDesc, isSelected && styles.cardDescActive]}>
                    {opt.desc}
                  </Text>
                </View>

                <View style={[styles.radio, isSelected && styles.radioActive]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>
              </Pressable>
            </Animated.View>
          )
        })}
      </Animated.View>

      <View style={styles.footer}>
        <Pressable
          style={[styles.btn, !selected && styles.btnDisabled]}
          onPress={handleNext}
          disabled={!selected}>
          {selected ? (
            <LinearGradient
              colors={selectedOption?.accent ?? ['#FF6B9D', '#FF4757']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btnGradient}>
              <Text style={styles.btnText}>Continuer →</Text>
            </LinearGradient>
          ) : (
            <View style={[styles.btnGradient, { backgroundColor: Colors.gray[200] }]}>
              <Text style={[styles.btnText, { color: Colors.gray[400] }]}>Fais ton choix</Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { paddingBottom: Spacing['2xl'] },
  headerContent: { alignItems: 'center', paddingHorizontal: Spacing.base, gap: Spacing.xs, paddingTop: Spacing.sm, paddingBottom: Spacing.sm },
  headerTitle: { fontSize: Typography.xl, fontWeight: '800', color: Colors.white },
  headerSub: { fontSize: Typography.sm, color: 'rgba(255,255,255,0.9)', textAlign: 'center', fontWeight: '500' },
  content: { flex: 1, paddingHorizontal: Spacing.base, paddingTop: Spacing.lg, gap: Spacing.md },
  hint: { fontSize: Typography.sm, color: Colors.gray[400], textAlign: 'center' },
  card: {
    flexDirection: 'row', alignItems: 'center',
    padding: Spacing.base, borderRadius: BorderRadius.xl,
    borderWidth: 2, borderColor: Colors.gray[200],
    backgroundColor: Colors.gray[50], gap: Spacing.base,
    overflow: 'hidden', ...Shadow.sm,
  },
  cardSelected: { borderColor: 'transparent', ...Shadow.md },
  accentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderTopLeftRadius: BorderRadius.xl, borderBottomLeftRadius: BorderRadius.xl },
  iconBox: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(0,0,0,0.04)',
    alignItems: 'center', justifyContent: 'center',
  },
  cardBody: { flex: 1 },
  cardLabel: { fontSize: Typography.base, fontWeight: '800', color: Colors.black, marginBottom: 3 },
  cardLabelActive: { color: Colors.white },
  cardDesc: { fontSize: Typography.sm, color: Colors.gray[500], lineHeight: 18 },
  cardDescActive: { color: 'rgba(255,255,255,0.85)' },
  radio: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 2,
    borderColor: Colors.gray[300], alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  radioActive: { borderColor: Colors.white, backgroundColor: 'rgba(255,255,255,0.3)' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.white },
  footer: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xl, paddingTop: Spacing.sm },
  btn: { borderRadius: BorderRadius.full, overflow: 'hidden', ...Shadow.md },
  btnGradient: { paddingVertical: 18, alignItems: 'center' },
  btnDisabled: {},
  btnText: { fontSize: Typography.md, fontWeight: '800', color: Colors.white, letterSpacing: 0.3 },
})
