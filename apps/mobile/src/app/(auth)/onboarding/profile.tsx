import { useState } from 'react'
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { Gender } from '@/types/user.types'
import { OnboardingProgress } from '@/components/ui/onboarding-progress'

const GENDERS: { key: Gender; label: string }[] = [
  { key: 'homme', label: 'Homme' },
  { key: 'femme', label: 'Femme' },
  { key: 'non-binaire', label: 'Non-binaire' },
  { key: 'trans', label: 'Trans' },
  { key: 'iel', label: 'Iel' },
  { key: 'autre', label: 'Autre' },
]

export default function OnboardingProfileScreen() {
  const router = useRouter()
  const { setProfile, firstName, lastName, gender, city } = useOnboardingStore()

  const [localFirst, setFirst] = useState(firstName)
  const [localLast, setLast] = useState(lastName)
  const [localGender, setGender] = useState<Gender | null>(gender)
  const [localCity, setCity] = useState(city)

  const isValid = localFirst.trim() && localLast.trim() && localGender && localCity.trim()

  const handleNext = () => {
    if (!isValid) return
    setProfile({ firstName: localFirst.trim(), lastName: localLast.trim(), gender: localGender!, city: localCity.trim() })
    router.push('/(auth)/onboarding/music')
  }

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingProgress step={1} total={5} />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Parle-nous de toi</Text>
        <Text style={styles.subtitle}>Ces informations sont visibles sur ton profil</Text>

        <View style={styles.form}>
          <View style={styles.row}>
            <View style={[styles.inputWrapper, { flex: 1 }]}>
              <Text style={styles.label}>Prénom</Text>
              <TextInput
                style={styles.input}
                value={localFirst}
                onChangeText={setFirst}
                placeholder="Léa"
                placeholderTextColor={Colors.gray[400]}
                autoCapitalize="words"
              />
            </View>
            <View style={[styles.inputWrapper, { flex: 1 }]}>
              <Text style={styles.label}>Nom</Text>
              <TextInput
                style={styles.input}
                value={localLast}
                onChangeText={setLast}
                placeholder="Martin"
                placeholderTextColor={Colors.gray[400]}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Ville</Text>
            <TextInput
              style={styles.input}
              value={localCity}
              onChangeText={setCity}
              placeholder="Paris"
              placeholderTextColor={Colors.gray[400]}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Genre</Text>
            <View style={styles.genderGrid}>
              {GENDERS.map((g) => (
                <Pressable
                  key={g.key}
                  style={[styles.genderBtn, localGender === g.key && styles.genderBtnActive]}
                  onPress={() => setGender(g.key)}>
                  <Text style={[styles.genderText, localGender === g.key && styles.genderTextActive]}>
                    {g.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.btn, !isValid && styles.btnDisabled]}
          onPress={handleNext}
          disabled={!isValid}>
          <Text style={styles.btnText}>Continuer →</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { flex: 1, paddingHorizontal: Spacing.base },
  title: { fontSize: Typography['2xl'], fontWeight: '800', color: Colors.black, marginTop: Spacing.xl, marginBottom: Spacing.xs },
  subtitle: { fontSize: Typography.sm, color: Colors.gray[500], marginBottom: Spacing.xl },
  form: { gap: Spacing.lg },
  row: { flexDirection: 'row', gap: Spacing.sm },
  inputWrapper: { gap: Spacing.xs },
  label: { fontSize: Typography.sm, fontWeight: '600', color: Colors.gray[700] },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.gray[200],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.base,
    height: 48,
    fontSize: Typography.base,
    color: Colors.black,
    backgroundColor: Colors.gray[50],
  },
  genderGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  genderBtn: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.gray[200],
    backgroundColor: Colors.gray[50],
  },
  genderBtnActive: { borderColor: Colors.love.primary, backgroundColor: Colors.love.light },
  genderText: { fontSize: Typography.sm, color: Colors.gray[600], fontWeight: '500' },
  genderTextActive: { color: Colors.love.secondary, fontWeight: '700' },
  footer: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.lg },
  btn: { backgroundColor: Colors.love.primary, borderRadius: BorderRadius.full, paddingVertical: Spacing.base, alignItems: 'center' },
  btnDisabled: { backgroundColor: Colors.gray[200] },
  btnText: { fontSize: Typography.md, fontWeight: '700', color: Colors.white },
})
