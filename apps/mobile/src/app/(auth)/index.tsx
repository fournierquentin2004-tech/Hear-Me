import { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '@/constants/theme'
import { HearMeLogo } from '@/components/ui/logo'

export default function WelcomeScreen() {
  const router = useRouter()
  const logoAnim  = useRef(new Animated.Value(0)).current
  const titleAnim = useRef(new Animated.Value(0)).current
  const btnAnim   = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.stagger(140, [
      Animated.spring(logoAnim,  { toValue: 1, useNativeDriver: true, damping: 14 }),
      Animated.spring(titleAnim, { toValue: 1, useNativeDriver: true, damping: 15 }),
      Animated.spring(btnAnim,   { toValue: 1, useNativeDriver: true, damping: 15 }),
    ]).start()
  }, [])

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF6B9D', '#FF4757', '#FF6B2D']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Cercle déco en bas */}
      <View style={styles.decoBubbleLarge} />
      <View style={styles.decoBubbleSmall} />

      <SafeAreaView style={styles.safeArea}>
        {/* ── Hero ── */}
        <View style={styles.hero}>
          {/* Logo SVG avec halo blanc */}
          <Animated.View
            style={[
              styles.logoWrap,
              {
                opacity: logoAnim,
                transform: [
                  { scale: logoAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) },
                  { translateY: logoAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
                ],
              },
            ]}>
            {/* Halo blanc derrière le logo */}
            <View style={styles.logoHalo} />
            <HearMeLogo size={110} variant="color" />
          </Animated.View>

          {/* Nom de l'app + tagline */}
          <Animated.View
            style={{
              opacity: titleAnim,
              transform: [{ translateY: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
              alignItems: 'center',
              gap: Spacing.sm,
            }}>
            <Text style={styles.appName}>Hear Me</Text>
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
              transform: [{ translateY: btnAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
            },
          ]}>
          <Pressable
            style={({ pressed }) => [styles.btnPrimary, pressed && styles.pressed]}
            onPress={() => router.push('/(auth)/phone' as any)}>
            <Text style={styles.btnPrimaryText}>Créer un compte</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.btnSecondary, pressed && styles.pressed]}
            onPress={() => router.push('/(auth)/phone' as any)}>
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingBottom: Spacing.xl },

  /* Bulles décoratives de fond */
  decoBubbleLarge: {
    position: 'absolute',
    bottom: -100,
    left: -80,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  decoBubbleSmall: {
    position: 'absolute',
    top: 60,
    right: -60,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  /* Hero centré */
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.xl },

  /* Conteneur logo */
  logoWrap: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
  logoHalo: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  /* Texte */
  appName: {
    fontSize: 54,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -2,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  tagline: {
    fontSize: Typography.base,
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },

  /* Boutons */
  buttons: { gap: Spacing.md },
  btnPrimary: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.full,
    paddingVertical: 17,
    alignItems: 'center',
    ...Shadow.md,
  },
  btnPrimaryText: { fontSize: Typography.md, fontWeight: '800', color: Colors.love.secondary },
  btnSecondary: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: BorderRadius.full,
    paddingVertical: 17,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  btnSecondaryText: { fontSize: Typography.md, fontWeight: '600', color: Colors.white },
  pressed: { opacity: 0.82, transform: [{ scale: 0.97 }] },
  legal: { textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.6)', lineHeight: 17, marginTop: Spacing.xs },
  legalLink: { textDecorationLine: 'underline', fontWeight: '600' },
})
