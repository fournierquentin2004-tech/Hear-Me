import { useState } from 'react'
import { View, Text, StyleSheet, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme'
import { useAuthStore } from '@/stores/auth.store'

export default function PhoneScreen() {
  const router = useRouter()
  const setPhone = useAuthStore((s) => s.setPhone)
  const [phone, setPhoneInput] = useState('')
  const [loading, setLoading] = useState(false)

  const formatted = phone.replace(/\D/g, '')
  const isValid = formatted.length === 10 && formatted.startsWith('0')

  const handleContinue = async () => {
    if (!isValid) return
    setLoading(true)
    const fullPhone = '+33' + formatted.slice(1)
    setPhone(fullPhone)
    // TODO: Supabase OTP → supabase.auth.signInWithOtp({ phone: fullPhone })
    setTimeout(() => {
      setLoading(false)
      router.push('/(auth)/verify')
    }, 800)
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}>

        {/* Header */}
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </Pressable>

        <View style={styles.content}>
          <Text style={styles.title}>Mon numéro</Text>
          <Text style={styles.subtitle}>
            On t'envoie un code SMS pour vérifier que c'est bien toi 🔐
          </Text>

          {/* Input */}
          <View style={styles.inputContainer}>
            <View style={styles.prefix}>
              <Text style={styles.flag}>🇫🇷</Text>
              <Text style={styles.prefixText}>+33</Text>
            </View>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhoneInput}
              placeholder="06 12 34 56 78"
              placeholderTextColor={Colors.gray[400]}
              keyboardType="phone-pad"
              maxLength={14}
              autoFocus
            />
          </View>

          <Text style={styles.hint}>France uniquement · Numéro non partagé</Text>
        </View>

        {/* Bouton */}
        <Pressable
          style={({ pressed }) => [
            styles.btn,
            !isValid && styles.btnDisabled,
            pressed && isValid && styles.btnPressed,
          ]}
          onPress={handleContinue}
          disabled={!isValid || loading}>
          <Text style={styles.btnText}>
            {loading ? 'Envoi...' : 'Recevoir le code'}
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  inner: {
    flex: 1,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.love.primary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.base,
    height: 56,
    gap: Spacing.sm,
  },
  prefix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingRight: Spacing.sm,
    borderRightWidth: 1,
    borderRightColor: Colors.gray[200],
  },
  flag: {
    fontSize: 20,
  },
  prefixText: {
    fontSize: Typography.base,
    fontWeight: '600',
    color: Colors.black,
  },
  input: {
    flex: 1,
    fontSize: Typography.md,
    fontWeight: '600',
    color: Colors.black,
    letterSpacing: 1,
  },
  hint: {
    fontSize: Typography.xs,
    color: Colors.gray[400],
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  btn: {
    backgroundColor: Colors.love.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.base,
    alignItems: 'center',
  },
  btnDisabled: {
    backgroundColor: Colors.gray[200],
  },
  btnPressed: {
    opacity: 0.85,
  },
  btnText: {
    fontSize: Typography.md,
    fontWeight: '700',
    color: Colors.white,
  },
})
