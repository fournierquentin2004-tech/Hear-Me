import { useState, useRef, useEffect } from 'react'
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme'
import { useAuthStore } from '@/stores/auth.store'

const CODE_LENGTH = 6

export default function VerifyScreen() {
  const router = useRouter()
  const { phone, setStatus } = useAuthStore()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(30)
  const inputRef = useRef<TextInput>(null)

  useEffect(() => {
    if (resendTimer <= 0) return
    const t = setInterval(() => setResendTimer((v) => v - 1), 1000)
    return () => clearInterval(t)
  }, [resendTimer])

  const handleChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, CODE_LENGTH)
    setCode(digits)
    setError('')
    if (digits.length === CODE_LENGTH) verify(digits)
  }

  const verify = async (_digits: string) => {
    setLoading(true)
    // TODO: supabase.auth.verifyOtp({ phone, token: digits, type: 'sms' })
    setTimeout(() => {
      setLoading(false)
      // Simule : nouvel utilisateur → onboarding
      setStatus('onboarding')
      router.replace('/(auth)/onboarding/profile' as any)
    }, 800)
  }

  const resend = () => {
    setResendTimer(30)
    // TODO: supabase.auth.signInWithOtp({ phone })
  }

  const displayPhone = phone?.replace('+33', '0').replace(/(\d{2})(?=\d)/g, '$1 ')

  return (
    <SafeAreaView style={styles.container}>
      <Pressable style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>←</Text>
      </Pressable>

      <View style={styles.content}>
        <Text style={styles.title}>Code de vérification</Text>
        <Text style={styles.subtitle}>
          Entrez le code à 6 chiffres envoyé au{'\n'}
          <Text style={styles.phone}>{displayPhone}</Text>
        </Text>

        {/* Cellules du code */}
        <Pressable style={styles.codeContainer} onPress={() => inputRef.current?.focus()}>
          {Array.from({ length: CODE_LENGTH }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.cell,
                code.length === i && styles.cellActive,
                code.length > i && styles.cellFilled,
                !!error && styles.cellError,
              ]}>
              <Text style={styles.cellText}>{code[i] ?? ''}</Text>
            </View>
          ))}
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

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {loading && <Text style={styles.loading}>Vérification...</Text>}

        {/* Renvoyer */}
        <View style={styles.resendRow}>
          {resendTimer > 0 ? (
            <Text style={styles.resendTimer}>Renvoyer dans {resendTimer}s</Text>
          ) : (
            <Pressable onPress={resend}>
              <Text style={styles.resendBtn}>Renvoyer le code</Text>
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.base,
  },
  back: {
    paddingVertical: Spacing.base,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 24,
    color: Colors.black,
  },
  content: {
    flex: 1,
    paddingTop: Spacing['2xl'],
  },
  title: {
    fontSize: Typography['2xl'],
    fontWeight: '800',
    color: Colors.black,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.base,
    color: Colors.gray[500],
    lineHeight: 22,
    marginBottom: Spacing['2xl'],
  },
  phone: {
    fontWeight: '700',
    color: Colors.black,
  },
  codeContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  cell: {
    width: 48,
    height: 56,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gray[50],
  },
  cellActive: {
    borderColor: Colors.love.primary,
    backgroundColor: Colors.love.light,
  },
  cellFilled: {
    borderColor: Colors.love.primary,
    backgroundColor: Colors.white,
  },
  cellError: {
    borderColor: Colors.error,
  },
  cellText: {
    fontSize: Typography.xl,
    fontWeight: '700',
    color: Colors.black,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },
  error: {
    textAlign: 'center',
    color: Colors.error,
    fontSize: Typography.sm,
    marginTop: Spacing.base,
  },
  loading: {
    textAlign: 'center',
    color: Colors.gray[400],
    fontSize: Typography.sm,
    marginTop: Spacing.base,
  },
  resendRow: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  resendTimer: {
    color: Colors.gray[400],
    fontSize: Typography.sm,
  },
  resendBtn: {
    color: Colors.love.primary,
    fontSize: Typography.sm,
    fontWeight: '600',
  },
})
