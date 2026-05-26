import { useState, useRef, useEffect } from 'react'
import { View, Text, StyleSheet, Pressable, TextInput, KeyboardAvoidingView, Platform, Animated } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors, Typography, Spacing, BorderRadius, Shadow, nativeDriver } from '@/constants/theme'
import { useAuthStore } from '@/stores/auth.store'

export default function PhoneScreen() {
  const router = useRouter()
  const setPhone = useAuthStore((s) => s.setPhone)
  const [phone, setPhoneInput] = useState('')
  const [loading, setLoading] = useState(false)
  const inputAnim = useRef(new Animated.Value(0)).current
  const btnAnim   = useRef(new Animated.Value(0)).current

  const digits  = phone.replace(/\D/g, '')
  const isValid = digits.length === 10 && digits.startsWith('0')

  const formatDisplay = (raw: string) => {
    const d = raw.replace(/\D/g, '').slice(0, 10)
    return d.replace(/(\d{2})(?=\d)/g, '$1 ').trim()
  }

  useEffect(() => {
    Animated.stagger(150, [
      Animated.spring(inputAnim, { toValue: 1, useNativeDriver: nativeDriver, damping: 14 }),
      Animated.spring(btnAnim,   { toValue: 1, useNativeDriver: nativeDriver, damping: 14 }),
    ]).start()
  }, [])

  useEffect(() => {
    Animated.spring(btnAnim, { toValue: isValid ? 1 : 0.95, useNativeDriver: nativeDriver, damping: 12 }).start()
  }, [isValid])

  const handleContinue = async () => {
    if (!isValid) return
    setLoading(true)
    const fullPhone = '+33' + digits.slice(1)
    setPhone(fullPhone)
    setTimeout(() => {
      setLoading(false)
      router.push('/(auth)/verify' as any)
    }, 800)
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF6B9D', '#FF4757']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}>
        <SafeAreaView>
          <Pressable style={styles.back} onPress={() => router.back()}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <View style={styles.headerContent}>
            {/* Icône graphique — cercle + ondes sonores */}
            <View style={styles.headerIcon}>
              <View style={styles.phoneIconBody}>
                <View style={styles.phoneIconDot} />
              </View>
              <View style={[styles.wave, styles.wave1]} />
              <View style={[styles.wave, styles.wave2]} />
            </View>
            <Text style={styles.headerTitle}>Mon numéro</Text>
            <Text style={styles.headerSub}>
              On t'envoie un SMS pour vérifier{'\n'}que c'est bien toi
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.body}>

        <Animated.View
          style={[
            styles.inputSection,
            {
              opacity: inputAnim,
              transform: [{ translateY: inputAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
            },
          ]}>
          <View style={[styles.inputWrapper, isValid && styles.inputWrapperValid]}>
            {/* Badge FR sans emoji */}
            <View style={styles.prefixBox}>
              <View style={styles.frBadge}>
                <Text style={styles.frText}>FR</Text>
              </View>
              <Text style={styles.prefixText}>+33</Text>
            </View>
            <View style={styles.divider} />
            <TextInput
              style={styles.input}
              value={formatDisplay(phone)}
              onChangeText={(t) => setPhoneInput(t.replace(/\s/g, ''))}
              placeholder="06 12 34 56 78"
              placeholderTextColor={Colors.gray[300]}
              keyboardType="phone-pad"
              maxLength={14}
              autoFocus
            />
            {isValid && <Text style={styles.checkmark}>✓</Text>}
          </View>

          <Text style={styles.hint}>Numéro confidentiel · France uniquement</Text>
        </Animated.View>

        <Animated.View style={[styles.footer, { opacity: btnAnim }]}>
          <Pressable
            style={({ pressed }) => [
              styles.btn,
              !isValid && styles.btnDisabled,
              pressed && isValid && styles.btnPressed,
            ]}
            onPress={handleContinue}
            disabled={!isValid || loading}>
            {isValid ? (
              <LinearGradient
                colors={['#FF6B9D', '#FF4757']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.btnGradient}>
                <Text style={styles.btnText}>{loading ? 'Envoi en cours...' : 'Recevoir le code →'}</Text>
              </LinearGradient>
            ) : (
              <View style={styles.btnGradient}>
                <Text style={[styles.btnText, styles.btnTextDisabled]}>Entre ton numéro</Text>
              </View>
            )}
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { paddingBottom: Spacing['2xl'] },
  back: { paddingHorizontal: Spacing.base, paddingTop: Spacing.sm },
  backText: { fontSize: 26, color: Colors.white },
  headerContent: { alignItems: 'center', paddingHorizontal: Spacing.base, gap: Spacing.sm, paddingTop: Spacing.base, paddingBottom: Spacing.sm },

  /* Icône graphique téléphone */
  headerIcon: { position: 'relative', alignItems: 'center', justifyContent: 'center', width: 64, height: 64 },
  phoneIconBody: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.6)',
  },
  phoneIconDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.love.primary },
  wave: {
    position: 'absolute', borderRadius: 100,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
  },
  wave1: { width: 50, height: 50 },
  wave2: { width: 64, height: 64 },

  headerTitle: { fontSize: Typography['2xl'], fontWeight: '800', color: Colors.white },
  headerSub: { fontSize: Typography.sm, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 20 },
  body: { flex: 1, paddingHorizontal: Spacing.base, paddingTop: Spacing.xl, justifyContent: 'space-between', paddingBottom: Spacing.xl },
  inputSection: { gap: Spacing.sm },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 2, borderColor: Colors.gray[200],
    borderRadius: BorderRadius.xl, paddingHorizontal: Spacing.base,
    height: 64, backgroundColor: Colors.gray[50], gap: Spacing.sm,
    // Empêche le débordement sur web
    maxWidth: '100%' as any,
    alignSelf: 'stretch',
  },
  inputWrapperValid: { borderColor: Colors.love.primary, backgroundColor: Colors.love.light, ...Shadow.sm },
  prefixBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  frBadge: {
    backgroundColor: Colors.love.primary, borderRadius: 4,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  frText: { fontSize: 11, fontWeight: '800', color: Colors.white, letterSpacing: 0.5 },
  prefixText: { fontSize: Typography.base, fontWeight: '700', color: Colors.black },
  divider: { width: 1, height: 28, backgroundColor: Colors.gray[200] },
  input: { flex: 1, fontSize: Typography.lg, fontWeight: '600', color: Colors.black, letterSpacing: 2, outlineStyle: 'none' as any },
  checkmark: { fontSize: 20, color: Colors.success, fontWeight: '700' },
  hint: { fontSize: Typography.xs, color: Colors.gray[400], textAlign: 'center' },
  footer: {},
  btn: { borderRadius: BorderRadius.full, overflow: 'hidden', ...Shadow.md },
  btnGradient: { paddingVertical: 18, alignItems: 'center' },
  btnDisabled: { backgroundColor: Colors.gray[200] },
  btnPressed: { opacity: 0.85 },
  btnText: { fontSize: Typography.md, fontWeight: '800', color: Colors.white, letterSpacing: 0.3 },
  btnTextDisabled: { color: Colors.gray[400] },
})
