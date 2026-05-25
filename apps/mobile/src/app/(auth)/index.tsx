import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme'

const { height } = Dimensions.get('window')

export default function WelcomeScreen() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF6B9D', '#FF4757', '#FFA94D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Logo & titre */}
        <View style={styles.hero}>
          <Text style={styles.emoji}>🎵</Text>
          <Text style={styles.appName}>Hear Me</Text>
          <Text style={styles.tagline}>
            Trouve l'amour ou l'amitié{'\n'}grâce à la musique
          </Text>
        </View>

        {/* Boutons */}
        <View style={styles.buttons}>
          <Pressable
            style={({ pressed }) => [styles.btnPrimary, pressed && styles.pressed]}
            onPress={() => router.push('/(auth)/phone')}>
            <Text style={styles.btnPrimaryText}>Créer un compte</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.btnSecondary, pressed && styles.pressed]}
            onPress={() => router.push('/(auth)/phone')}>
            <Text style={styles.btnSecondaryText}>Se connecter</Text>
          </Pressable>

          <Text style={styles.legal}>
            En continuant, tu acceptes nos{' '}
            <Text style={styles.legalLink}>CGU</Text> et notre{' '}
            <Text style={styles.legalLink}>politique de confidentialité</Text>
          </Text>
        </View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  emoji: {
    fontSize: 72,
    marginBottom: Spacing.sm,
  },
  appName: {
    fontSize: 52,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: Typography.lg,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '500',
  },
  buttons: {
    gap: Spacing.md,
  },
  btnPrimary: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.base,
    alignItems: 'center',
  },
  btnPrimaryText: {
    fontSize: Typography.md,
    fontWeight: '700',
    color: Colors.love.secondary,
  },
  btnSecondary: {
    backgroundColor: 'transparent',
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.base,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  btnSecondaryText: {
    fontSize: Typography.md,
    fontWeight: '600',
    color: Colors.white,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  legal: {
    textAlign: 'center',
    fontSize: Typography.xs,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 18,
    marginTop: Spacing.xs,
  },
  legalLink: {
    textDecorationLine: 'underline',
  },
})
