import { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Pressable, Animated, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, {
  Path, Rect, Circle, G,
  Defs,
  LinearGradient as SvgLinear,
  RadialGradient as SvgRadial,
  Stop, ClipPath,
} from 'react-native-svg'
import { Spacing, BorderRadius, nativeDriver } from '@/constants/theme'
import { useAuthStore } from '@/stores/auth.store'

/* ── Chemin exact du cœur (repris du SVG de référence) ── */
const HEART =
  'M50,88 C50,74 14,60 14,36 C14,22 25,12 38,12 ' +
  'C44,12 48,16 50,22 C52,16 56,12 62,12 ' +
  'C75,12 86,22 86,36 C86,60 50,74 50,88 Z'

function WelcomeLogo({ size = 180 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        {/* Cœur : orange-rose → rose vif → bordeaux */}
        <SvgLinear
          id="wl-heart"
          x1="24.8" y1="12" x2="64.4" y2="88"
          gradientUnits="userSpaceOnUse">
          <Stop offset="0%"   stopColor="#FF9A6B" />
          <Stop offset="48%"  stopColor="#F0556E" />
          <Stop offset="100%" stopColor="#B42D74" />
        </SvgLinear>

        {/* Reflet nacré sur le cœur */}
        <SvgRadial
          id="wl-sheen"
          cx="39" cy="33" r="52"
          gradientUnits="userSpaceOnUse">
          <Stop offset="0%"   stopColor="#ffffff" stopOpacity="0.28" />
          <Stop offset="45%"  stopColor="#ffffff" stopOpacity="0"    />
        </SvgRadial>

        {/* Barres égaliseur : crème clair → crème doré */}
        <SvgLinear
          id="wl-bars"
          x1="0" y1="30" x2="0" y2="68"
          gradientUnits="userSpaceOnUse">
          <Stop offset="0%"   stopColor="#FFF4E8" />
          <Stop offset="50%"  stopColor="#FCE4CC" />
          <Stop offset="100%" stopColor="#F2C9A0" />
        </SvgLinear>

        {/* Oreillettes : radial crème ivoire */}
        <SvgRadial
          id="wl-cup-l"
          cx="9.5" cy="40.5" r="8"
          gradientUnits="userSpaceOnUse">
          <Stop offset="0%"   stopColor="#FBF1E4" />
          <Stop offset="42%"  stopColor="#EBD8C2" />
          <Stop offset="100%" stopColor="#CBB49A" />
        </SvgRadial>
        <SvgRadial
          id="wl-cup-r"
          cx="85.5" cy="40.5" r="8"
          gradientUnits="userSpaceOnUse">
          <Stop offset="0%"   stopColor="#FBF1E4" />
          <Stop offset="42%"  stopColor="#EBD8C2" />
          <Stop offset="100%" stopColor="#CBB49A" />
        </SvgRadial>

        {/* Masque cœur pour les barres */}
        <ClipPath id="wl-clip">
          <Path d={HEART} />
        </ClipPath>
      </Defs>

      {/* ── Cœur rempli ── */}
      <Path d={HEART} fill="url(#wl-heart)" />
      <Path d={HEART} fill="url(#wl-sheen)" />

      {/* ── 7 barres d'égaliseur clippées dans le cœur ── */}
      <G clipPath="url(#wl-clip)">
        <Rect x="24.8" y="41.4"  width="3.6" height="15.2"  rx="1.8" fill="url(#wl-bars)" />
        <Rect x="32.6" y="36.84" width="3.6" height="24.32" rx="1.8" fill="url(#wl-bars)" />
        <Rect x="40.4" y="32.66" width="3.6" height="32.68" rx="1.8" fill="url(#wl-bars)" />
        <Rect x="48.2" y="30"    width="3.6" height="38"    rx="1.8" fill="url(#wl-bars)" />
        <Rect x="56.0" y="32.66" width="3.6" height="32.68" rx="1.8" fill="url(#wl-bars)" />
        <Rect x="63.8" y="36.84" width="3.6" height="24.32" rx="1.8" fill="url(#wl-bars)" />
        <Rect x="71.6" y="41.4"  width="3.6" height="15.2"  rx="1.8" fill="url(#wl-bars)" />
      </G>

      {/* ── Arceau casque (crème épaisse + liseré bordeaux) ── */}
      <Path
        d="M12,34.5 C7,3.5 93,3.5 88,34.5"
        fill="none" stroke="#FBF1E4"
        strokeWidth={4.4} strokeLinecap="round" />
      <Path
        d="M12,34.5 C7,3.5 93,3.5 88,34.5"
        fill="none" stroke="#7A1F3E"
        strokeWidth={0.9} strokeLinecap="round" opacity={0.55} />

      {/* ── Oreillette gauche ── */}
      <Path d="M12,32.5 L12,36.8"
        stroke="#FBF1E4" strokeWidth={2.9} strokeLinecap="round" />
      <Circle cx="12" cy="34.8" r="1.9"
        fill="#FBF1E4" stroke="#7A1F3E" strokeWidth={0.5} />
      <Circle cx="12" cy="44" r="8.8"
        fill="url(#wl-cup-l)" stroke="#7A1F3E" strokeWidth={1} />
      <Circle cx="12" cy="44" r="5.9"
        fill="#EBD8C2" stroke="#7A1F3E" strokeWidth={0.4} strokeOpacity={0.5} />
      <Circle cx="12" cy="44" r="1.5"
        fill="#7A1F3E" opacity={0.85} />

      {/* ── Oreillette droite ── */}
      <Path d="M88,32.5 L88,36.8"
        stroke="#FBF1E4" strokeWidth={2.9} strokeLinecap="round" />
      <Circle cx="88" cy="34.8" r="1.9"
        fill="#FBF1E4" stroke="#7A1F3E" strokeWidth={0.5} />
      <Circle cx="88" cy="44" r="8.8"
        fill="url(#wl-cup-r)" stroke="#7A1F3E" strokeWidth={1} />
      <Circle cx="88" cy="44" r="5.9"
        fill="#EBD8C2" stroke="#7A1F3E" strokeWidth={0.4} strokeOpacity={0.5} />
      <Circle cx="88" cy="44" r="1.5"
        fill="#7A1F3E" opacity={0.85} />
    </Svg>
  )
}

/* ─────────────────────────────────────────── */

export default function WelcomeScreen() {
  const router  = useRouter()
  const setMode = useAuthStore((s) => s.setMode)
  const logoAnim  = useRef(new Animated.Value(0)).current
  const titleAnim = useRef(new Animated.Value(0)).current
  const btnAnim   = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.stagger(160, [
      Animated.spring(logoAnim,  { toValue: 1, useNativeDriver: nativeDriver, damping: 14 }),
      Animated.spring(titleAnim, { toValue: 1, useNativeDriver: nativeDriver, damping: 15 }),
      Animated.spring(btnAnim,   { toValue: 1, useNativeDriver: nativeDriver, damping: 15 }),
    ]).start()
  }, [])

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#3A1530', '#260C22', '#120410']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.55, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>

        {/* ── Hero ── */}
        <View style={styles.hero}>
          <Animated.View style={{
            opacity: logoAnim,
            transform: [
              { scale: logoAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) },
              { translateY: logoAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
            ],
          }}>
            <WelcomeLogo size={200} />
          </Animated.View>

          <Animated.View style={{
            opacity: titleAnim,
            transform: [{ translateY: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
            alignItems: 'center',
            gap: Spacing.sm,
          }}>
            <Text style={styles.appName}>HearMe</Text>
            <Text style={styles.tagline}>L'AMOUR EST UNE BANDE-SON</Text>
          </Animated.View>
        </View>

        {/* ── Boutons ── */}
        <Animated.View style={[styles.buttons, {
          opacity: btnAnim,
          transform: [{ translateY: btnAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
        }]}>
          <Pressable
            style={({ pressed }) => [styles.btnPrimary, pressed && styles.pressed]}
            onPress={() => { setMode('register'); router.push('/(auth)/phone' as any) }}>
            <Text style={styles.btnPrimaryText}>Créer un compte</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.btnSecondary, pressed && styles.pressed]}
            onPress={() => { setMode('login'); router.push('/(auth)/phone' as any) }}>
            <Text style={styles.btnSecondaryText}>
              Déjà un compte ?{'  '}
              <Text style={styles.btnLink}>Se connecter</Text>
            </Text>
          </Pressable>

          <Text style={styles.legal}>
            En continuant, tu acceptes nos{' '}
            <Text style={styles.legalLink}>Conditions d'utilisation</Text>
            {' '}et notre{' '}
            <Text style={styles.legalLink}>Politique de confidentialité</Text>
          </Text>
        </Animated.View>

      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea:  { flex: 1, justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingBottom: Spacing.xl },

  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.xl },

  /** Cormorant Garamond → fallback Georgia (serif élégant) */
  appName: {
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' }),
    fontSize: 44,
    fontWeight: '500',
    color: '#FCF5EA',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 11,
    fontWeight: '300',
    color: 'rgba(252,245,234,0.8)',
    letterSpacing: 3.6,
    textTransform: 'uppercase' as const,
  },

  buttons: { gap: Spacing.md },

  /** Bouton principal — crème ivoire */
  btnPrimary: {
    backgroundColor: '#FCF5EA',
    borderRadius: BorderRadius.full,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#6E1840',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.6,
  },

  /** Lien connexion */
  btnSecondary: { alignItems: 'center', paddingVertical: Spacing.sm },
  btnSecondaryText: { color: 'rgba(252,245,234,0.78)', fontSize: 11.5 },
  btnLink: { textDecorationLine: 'underline' },

  pressed: { opacity: 0.82, transform: [{ scale: 0.97 }] },

  legal: { textAlign: 'center', fontSize: 10, color: 'rgba(252,245,234,0.4)', lineHeight: 15 },
  legalLink: { textDecorationLine: 'underline' as const },
})
