import { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, {
  Path, Rect, Defs,
  LinearGradient as SvgGrad, Stop,
  ClipPath, G,
} from 'react-native-svg'
import { Typography, Spacing, BorderRadius, nativeDriver } from '@/constants/theme'
import { useAuthStore } from '@/stores/auth.store'

/*
  Cœur tracé depuis l'image de référence :
  deux demi-cercles en haut (lobes ronds) + corps plein + pointe basse
  Point le plus large à mi-hauteur, lobes hauts et bombés
*/
const HEART_PATH = [
  'M50,90',
  'C83,75 96,60 96,50',
  'C96,25 82,8 67,8',
  'C58,8 50,20 50,28',
  'C50,20 42,8 33,8',
  'C18,8 4,25 4,50',
  'C4,60 17,75 50,90',
  'Z',
].join(' ')

const BARS = [
  { x: 13, h: 30, color: '#FB7185' },
  { x: 29, h: 56, color: '#F472B6' },
  { x: 45, h: 70, color: '#E879F9' },
  { x: 61, h: 56, color: '#F472B6' },
  { x: 77, h: 30, color: '#FB7185' },
]
const BAR_BASE = 86

/**
 * Logo HearMe — musique × amour
 * Barres d'égaliseur clippées dans un cœur → la musique prend la forme de l'amour
 */
function HeartEqualizerLogo({ size = 130 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        {/* Masque = forme du cœur */}
        <ClipPath id="hm-clip">
          <Path d={HEART_PATH} />
        </ClipPath>

        {/* Dégradé vertical pour chaque barre : plein en haut, fondu en bas */}
        {BARS.map((b, i) => (
          <SvgGrad key={i} id={`bg${i}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0"   stopColor={b.color} stopOpacity="1"    />
            <Stop offset="1"   stopColor={b.color} stopOpacity="0.35" />
          </SvgGrad>
        ))}
      </Defs>

      {/* Barres clippées au cœur */}
      <G clipPath="url(#hm-clip)">
        {BARS.map((b, i) => (
          <Rect
            key={i}
            x={b.x}
            y={BAR_BASE - b.h}
            width={10}
            height={b.h + 12}   /* dépasse légèrement pour remplir la pointe du cœur */
            rx={5}
            fill={`url(#bg${i})`}
          />
        ))}
      </G>

      {/* Contour du cœur par-dessus — fin et lumineux */}
      <Path
        d={HEART_PATH}
        fill="none"
        stroke="#FCA5A5"
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </Svg>
  )
}

/* ─────────────────────────────────────────────── */

export default function WelcomeScreen() {
  const router  = useRouter()
  const setMode = useAuthStore((s) => s.setMode)
  const logoAnim  = useRef(new Animated.Value(0)).current
  const titleAnim = useRef(new Animated.Value(0)).current
  const btnAnim   = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.stagger(160, [
      Animated.spring(logoAnim,  { toValue: 1, useNativeDriver: nativeDriver, damping: 12 }),
      Animated.spring(titleAnim, { toValue: 1, useNativeDriver: nativeDriver, damping: 15 }),
      Animated.spring(btnAnim,   { toValue: 1, useNativeDriver: nativeDriver, damping: 15 }),
    ]).start()
  }, [])

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>

        {/* ── Hero ── */}
        <View style={styles.hero}>

          <Animated.View
            style={{
              opacity: logoAnim,
              transform: [
                { scale: logoAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) },
                { translateY: logoAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
              ],
            }}>
            <HeartEqualizerLogo size={150} />
          </Animated.View>

          <Animated.View
            style={{
              opacity: titleAnim,
              transform: [{ translateY: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
              alignItems: 'center',
              gap: Spacing.sm,
            }}>
            <Text style={styles.appName}>HEAR ME</Text>
            <View style={styles.divider} />
            <Text style={styles.tagline}>
              Rencontre des personnes qui{'\n'}partagent tes goûts musicaux
            </Text>
          </Animated.View>
        </View>

        {/* ── Boutons ── */}
        <Animated.View
          style={[
            styles.buttons,
            {
              opacity: btnAnim,
              transform: [{ translateY: btnAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
            },
          ]}>

          <Pressable
            style={({ pressed }) => [styles.btnPrimary, pressed && styles.pressed]}
            onPress={() => { setMode('register'); router.push('/(auth)/phone' as any) }}>
            <Text style={styles.btnPrimaryText}>Créer un compte</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.btnSecondary, pressed && styles.pressed]}
            onPress={() => { setMode('login'); router.push('/(auth)/phone' as any) }}>
            <Text style={styles.btnSecondaryText}>J'ai déjà un compte</Text>
          </Pressable>

          <Text style={styles.legal}>
            En continuant, tu acceptes nos{' '}
            <Text style={styles.legalLink}>CGU</Text>
            {' '}et notre{' '}
            <Text style={styles.legalLink}>Politique de confidentialité</Text>
          </Text>
        </Animated.View>

      </SafeAreaView>
    </View>
  )
}

const ACCENT = '#E879F9'   // mauve électrique — musique + amour

const styles = StyleSheet.create({
  /** Fond sombre concert, légèrement violacé = nuit musicale */
  container: { flex: 1, backgroundColor: '#1C0833' },
  safeArea:  { flex: 1, justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingBottom: Spacing.xl },

  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing['2xl'] },

  appName: {
    fontSize: 44,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 12,
  },

  /** Fine ligne rose — ponctuation entre titre et tagline */
  divider: {
    width: 36,
    height: 1.5,
    backgroundColor: '#F9A8D4',
    opacity: 0.8,
  },

  tagline: {
    fontSize: Typography.sm,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '400',
    letterSpacing: 0.3,
  },

  buttons: { gap: Spacing.md },

  btnPrimary: {
    borderRadius: BorderRadius.full,
    paddingVertical: 17,
    alignItems: 'center',
    backgroundColor: ACCENT,
  },
  btnPrimaryText: {
    fontSize: Typography.base,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  btnSecondary: {
    borderRadius: BorderRadius.full,
    paddingVertical: 17,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${ACCENT}66`,
  },
  btnSecondaryText: {
    fontSize: Typography.base,
    fontWeight: '500',
    color: `${ACCENT}CC`,
    letterSpacing: 0.3,
  },

  pressed:   { opacity: 0.80, transform: [{ scale: 0.97 }] },
  legal:     { textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.28)', lineHeight: 16, marginTop: Spacing.xs },
  legalLink: { textDecorationLine: 'underline', color: 'rgba(255,255,255,0.42)' },
})
