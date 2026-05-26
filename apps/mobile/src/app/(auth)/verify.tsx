import { useState, useRef, useEffect } from 'react'
import { View, Text, StyleSheet, Pressable, TextInput, Animated } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors, Typography, Spacing, BorderRadius, Shadow, nativeDriver } from '@/constants/theme'
import { useAuthStore } from '@/stores/auth.store'

const CODE_LENGTH = 6

export default function VerifyScreen() {
  const router  = useRouter()
  const { phone, mode, setStatus } = useAuthStore()
  const [code, setCode]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [resendTimer, setResendTimer] = useState(30)
  const inputRef  = useRef<TextInput>(null)
  const cellAnims = useRef(Array.from({ length: CODE_LENGTH }, () => new Animated.Value(1))).current

  useEffect(() => {
    if (resendTimer <= 0) return
    const t = setInterval(() => setResendTimer((v) => v - 1), 1000)
    return () => clearInterval(t)
  }, [resendTimer])

  const animateCell = (index: number) => {
    Animated.sequence([
      Animated.spring(cellAnims[index], { toValue: 1.2, useNativeDriver: nativeDriver, damping: 8 }),
      Animated.spring(cellAnims[index], { toValue: 1, useNativeDriver: nativeDriver, damping: 12 }),
    ]).start()
  }

  const handleChange = (val: string) => {
    const d    = val.replace(/\D/g, '').slice(0, CODE_LENGTH)
    const prev = code
    setCode(d)
    setError('')
    if (d.length > prev.length) animateCell(d.length - 1)
    if (d.length === CODE_LENGTH) verify(d)
  }

  const verify = async (_digits: string) => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      if (mode === 'login') {
        setStatus('authenticated')
        router.replace('/(tabs)' as any)
      } else {
        setStatus('onboarding')
        router.replace('/(auth)/onboarding/profile' as any)
      }
    }, 900)
  }

  const resend = () => { setResendTimer(30); setCode('') }

  const displayPhone = phone?.replace('+33', '0').replace(/(\d{2})(?=\d)/g, '$1 ')

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
            {/* Icône graphique SMS — enveloppe minimaliste */}
            <View style={styles.headerIcon}>
              <View style={styles.envelope}>
                <View style={styles.envelopeFlap} />
                <View style={styles.envelopeLine1} />
                <View style={styles.envelopeLine2} />
              </View>
            </View>
            <Text style={styles.headerTitle}>Code reçu ?</Text>
            <Text style={styles.headerSub}>
              Code envoyé au{'\n'}
              <Text style={styles.phoneNum}>{displayPhone}</Text>
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.body}>
        <Pressable onPress={() => inputRef.current?.focus()}>
          <Animated.View style={styles.codeRow}>
            {Array.from({ length: CODE_LENGTH }).map((_, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.cell,
                  code.length > i && styles.cellFilled,
                  code.length === i && styles.cellActive,
                  !!error && styles.cellError,
                  { transform: [{ scale: cellAnims[i] }] },
                ]}>
                <Text style={styles.cellText}>{code[i] ? '●' : ''}</Text>
              </Animated.View>
            ))}
          </Animated.View>
        </Pressable>

        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={handleChange}
          keyboardType="number-pad"
          maxLength={CODE_LENGTH}
          style={styles.hiddenInput}
          autoFocus
        />

        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : loading ? (
          <View style={styles.loadingRow}>
            <Text style={styles.loadingText}>Vérification en cours...</Text>
          </View>
        ) : null}

        <View style={styles.resendBox}>
          {resendTimer > 0 ? (
            <View style={styles.timerRow}>
              <Text style={styles.timerText}>Renvoyer dans </Text>
              <View style={styles.timerBadge}>
                <Text style={styles.timerBadgeText}>{resendTimer}s</Text>
              </View>
            </View>
          ) : (
            <Pressable style={styles.resendBtn} onPress={resend}>
              <Text style={styles.resendBtnText}>↻  Renvoyer le code</Text>
            </Pressable>
          )}
        </View>

        <Text style={styles.hint}>
          Tu n'as pas reçu de SMS ? Vérifie que ton numéro est correct ou réessaie dans quelques secondes.
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { paddingBottom: Spacing['2xl'] },
  back: { paddingHorizontal: Spacing.base, paddingTop: Spacing.sm },
  backText: { fontSize: 26, color: Colors.white },
  headerContent: { alignItems: 'center', paddingHorizontal: Spacing.base, gap: Spacing.sm, paddingTop: Spacing.base, paddingBottom: Spacing.sm },

  /* Icône enveloppe graphique */
  headerIcon: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  envelope: {
    width: 52, height: 38, borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', position: 'relative',
  },
  envelopeFlap: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 20,
    borderBottomWidth: 1.5, borderBottomColor: 'rgba(255,107,157,0.4)',
    borderLeftWidth: 26, borderLeftColor: 'transparent',
    borderRightWidth: 26, borderRightColor: 'transparent',
  },
  envelopeLine1: { width: 28, height: 2, borderRadius: 1, backgroundColor: Colors.love.light, marginBottom: 4 },
  envelopeLine2: { width: 20, height: 2, borderRadius: 1, backgroundColor: Colors.love.light },

  headerTitle: { fontSize: Typography['2xl'], fontWeight: '800', color: Colors.white },
  headerSub: { fontSize: Typography.sm, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 20 },
  phoneNum: { fontWeight: '800', color: Colors.white },

  body: { flex: 1, paddingHorizontal: Spacing.base, paddingTop: Spacing['2xl'], gap: Spacing.xl },
  codeRow: { flexDirection: 'row', gap: Spacing.sm, justifyContent: 'center' },
  cell: {
    width: 48, height: 56, borderRadius: BorderRadius.md,
    borderWidth: 2, borderColor: Colors.gray[200],
    backgroundColor: Colors.gray[50],
    alignItems: 'center', justifyContent: 'center',
    ...Shadow.sm,
  },
  cellActive: { borderColor: Colors.love.primary, backgroundColor: Colors.love.light },
  cellFilled: { borderColor: Colors.love.primary, backgroundColor: Colors.white, ...Shadow.sm },
  cellError: { borderColor: Colors.error, backgroundColor: '#FFF0F0' },
  cellText: { fontSize: 22, color: Colors.love.primary, fontWeight: '700' },
  hiddenInput: { position: 'absolute', opacity: 0, height: 0, width: 0 },
  error: { textAlign: 'center', color: Colors.error, fontSize: Typography.sm, fontWeight: '600' },
  loadingRow: { alignItems: 'center' },
  loadingText: { color: Colors.gray[400], fontSize: Typography.sm },
  resendBox: { alignItems: 'center' },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  timerText: { color: Colors.gray[500], fontSize: Typography.sm },
  timerBadge: { backgroundColor: Colors.gray[100], borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  timerBadgeText: { color: Colors.gray[600], fontWeight: '700', fontSize: Typography.sm },
  resendBtn: { backgroundColor: Colors.love.light, borderRadius: BorderRadius.full, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm },
  resendBtnText: { color: Colors.love.primary, fontWeight: '700', fontSize: Typography.sm },
  hint: { textAlign: 'center', fontSize: 11, color: Colors.gray[300], lineHeight: 16, paddingHorizontal: Spacing.xl },
})
