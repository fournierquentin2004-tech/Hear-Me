import { useState, useRef, useEffect } from 'react'
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, Animated, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors, Typography, Spacing, BorderRadius, Shadow, nativeDriver } from '@/constants/theme'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { Gender } from '@/types/user.types'
import { OnboardingProgress } from '@/components/ui/onboarding-progress'

const GENDERS: { key: Gender; label: string }[] = [
  { key: 'homme',       label: 'Homme'       },
  { key: 'femme',       label: 'Femme'       },
  { key: 'non-binaire', label: 'Non-binaire' },
  { key: 'trans',       label: 'Trans'       },
  { key: 'iel',         label: 'Iel'         },
  { key: 'autre',       label: 'Autre'       },
]

const DETECTED_CITY = 'Paris'

const calculateAge = (day: string, month: string, year: string): number | null => {
  if (day.length < 1 || month.length < 1 || year.length !== 4) return null
  const d = parseInt(day, 10)
  const m = parseInt(month, 10)
  const y = parseInt(year, 10)
  if (isNaN(d) || isNaN(m) || isNaN(y)) return null
  if (d < 1 || d > 31 || m < 1 || m > 12) return null
  const birth = new Date(y, m - 1, d)
  if (isNaN(birth.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const diff = today.getMonth() - birth.getMonth()
  if (diff < 0 || (diff === 0 && today.getDate() < birth.getDate())) age--
  return age
}

export default function OnboardingProfileScreen() {
  const router = useRouter()
  const { setProfile, firstName, lastName, birthDate, gender, city } = useOnboardingStore()

  const [localFirst,  setFirst]  = useState(firstName)
  const [localLast,   setLast]   = useState(lastName)
  const [localGender, setGender] = useState<Gender | null>(gender)
  const [localCity,   setCity]   = useState(city || DETECTED_CITY)
  const [cityTouched, setCityTouched] = useState(false)
  const [focusedField, setFocused]    = useState<string | null>(null)

  // Date de naissance (3 champs séparés)
  const [localDay,   setDay]   = useState('')
  const [localMonth, setMonth] = useState('')
  const [localYear,  setYear]  = useState('')

  const monthRef = useRef<TextInput>(null)
  const yearRef  = useRef<TextInput>(null)

  const fadeAnim  = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current

  // Initialise depuis le store si déjà rempli (YYYY-MM-DD)
  useEffect(() => {
    if (birthDate) {
      const parts = birthDate.split('-')
      if (parts.length === 3) {
        setYear(parts[0] ?? '')
        setMonth(parts[1] ?? '')
        setDay(parts[2] ?? '')
      }
    }
  }, [])

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 400, useNativeDriver: nativeDriver }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: nativeDriver, damping: 16 }),
    ]).start()
  }, [])

  const age        = calculateAge(localDay, localMonth, localYear)
  const isValidAge = age !== null && age >= 18 && age <= 110

  const isValid = !!(
    localFirst.trim() &&
    localLast.trim()  &&
    localGender       &&
    localCity.trim()  &&
    isValidAge
  )

  const handleNext = () => {
    if (!isValid) return
    setProfile({
      firstName: localFirst.trim(),
      lastName:  localLast.trim(),
      birthDate: `${localYear}-${localMonth.padStart(2, '0')}-${localDay.padStart(2, '0')}`,
      gender:    localGender!,
      city:      localCity.trim(),
    })
    router.push('/(auth)/onboarding/music' as any)
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF6B9D', '#FF4757']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}>
        <SafeAreaView>
          <OnboardingProgress step={1} total={5} light />
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <View style={styles.avatarCircle} />
              <View style={styles.avatarBody} />
            </View>
            <Text style={styles.headerTitle}>Parle-nous de toi</Text>
            <Text style={styles.headerSub}>Ces infos seront visibles sur ton profil</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.form, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

          {/* Prénom + Nom */}
          <View style={styles.row}>
            <View style={[styles.fieldWrap, { flex: 1 }]}>
              <Text style={styles.label}>Prénom</Text>
              <TextInput
                style={[styles.input, focusedField === 'first' && styles.inputFocused]}
                value={localFirst}
                onChangeText={setFirst}
                onFocus={() => setFocused('first')}
                onBlur={() => setFocused(null)}
                placeholder="Léa"
                placeholderTextColor={Colors.gray[300]}
                autoCapitalize="words"
              />
            </View>
            <View style={[styles.fieldWrap, { flex: 1 }]}>
              <Text style={styles.label}>Nom</Text>
              <TextInput
                style={[styles.input, focusedField === 'last' && styles.inputFocused]}
                value={localLast}
                onChangeText={setLast}
                onFocus={() => setFocused('last')}
                onBlur={() => setFocused(null)}
                placeholder="Martin"
                placeholderTextColor={Colors.gray[300]}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Date de naissance */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Date de naissance</Text>
            <View style={styles.dateRow}>
              {/* Jour */}
              <TextInput
                value={localDay}
                onChangeText={(t) => {
                  const v = t.replace(/\D/g, '').slice(0, 2)
                  setDay(v)
                  if (v.length === 2) monthRef.current?.focus()
                }}
                onFocus={() => setFocused('day')}
                onBlur={() => setFocused(null)}
                placeholder="JJ"
                placeholderTextColor={Colors.gray[300]}
                keyboardType="numeric"
                maxLength={2}
                textAlign="center"
                style={[
                  styles.dateSegment,
                  focusedField === 'day' && styles.inputFocused,
                  Platform.OS === 'ios' && { fontSize: 16 },
                ]}
              />
              <Text style={styles.dateSep}>/</Text>
              {/* Mois */}
              <TextInput
                ref={monthRef}
                value={localMonth}
                onChangeText={(t) => {
                  const v = t.replace(/\D/g, '').slice(0, 2)
                  setMonth(v)
                  if (v.length === 2) yearRef.current?.focus()
                }}
                onFocus={() => setFocused('month')}
                onBlur={() => setFocused(null)}
                placeholder="MM"
                placeholderTextColor={Colors.gray[300]}
                keyboardType="numeric"
                maxLength={2}
                textAlign="center"
                style={[
                  styles.dateSegment,
                  focusedField === 'month' && styles.inputFocused,
                  Platform.OS === 'ios' && { fontSize: 16 },
                ]}
              />
              <Text style={styles.dateSep}>/</Text>
              {/* Année */}
              <TextInput
                ref={yearRef}
                value={localYear}
                onChangeText={(t) => {
                  const v = t.replace(/\D/g, '').slice(0, 4)
                  setYear(v)
                }}
                onFocus={() => setFocused('year')}
                onBlur={() => setFocused(null)}
                placeholder="AAAA"
                placeholderTextColor={Colors.gray[300]}
                keyboardType="numeric"
                maxLength={4}
                textAlign="center"
                style={[
                  styles.dateSegmentYear,
                  focusedField === 'year' && styles.inputFocused,
                  Platform.OS === 'ios' && { fontSize: 16 },
                ]}
              />

              {/* Badge âge */}
              {age !== null && (
                <View style={[styles.ageBadge, isValidAge ? styles.ageBadgeOk : styles.ageBadgeErr]}>
                  <Text style={[styles.ageBadgeText, isValidAge ? styles.ageBadgeTextOk : styles.ageBadgeTextErr]}>
                    {isValidAge ? `${age} ans ✓` : age < 18 ? 'Mineur' : '?'}
                  </Text>
                </View>
              )}
            </View>

            {age !== null && !isValidAge && age < 18 && (
              <Text style={styles.ageError}>
                Tu dois avoir 18 ans minimum pour t'inscrire
              </Text>
            )}
          </View>

          {/* Ville */}
          <View style={styles.fieldWrap}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Ville</Text>
              <View style={[styles.detectedBadge, cityTouched && styles.modifiedBadge]}>
                <View style={[styles.badgeDot, cityTouched && styles.badgeDotModified]} />
                <Text style={[styles.detectedText, cityTouched && styles.modifiedText]}>
                  {cityTouched ? 'modifiée' : 'détectée'}
                </Text>
              </View>
            </View>
            <TextInput
              style={[styles.input, focusedField === 'city' && styles.inputFocused]}
              value={localCity}
              onChangeText={(t) => { setCity(t); if (!cityTouched) setCityTouched(true) }}
              onFocus={() => setFocused('city')}
              onBlur={() => setFocused(null)}
              placeholder="Paris"
              placeholderTextColor={Colors.gray[300]}
              autoCapitalize="words"
            />
            {!cityTouched && (
              <Text style={styles.vpnHint}>
                Résultat inattendu ? Tu utilises peut-être un VPN.
              </Text>
            )}
          </View>

          {/* Genre */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Je suis</Text>
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

        </Animated.View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.btn, !isValid && styles.btnDisabled, pressed && isValid && styles.btnPressed]}
          onPress={handleNext}
          disabled={!isValid}>
          {isValid ? (
            <LinearGradient
              colors={['#FF6B9D', '#FF4757']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btnGradient}>
              <Text style={styles.btnText}>Continuer →</Text>
            </LinearGradient>
          ) : (
            <View style={[styles.btnGradient, { backgroundColor: Colors.gray[200] }]}>
              <Text style={[styles.btnText, { color: Colors.gray[400] }]}>
                Quelques notes manquantes...
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { paddingBottom: Spacing.xl },
  headerContent: {
    alignItems: 'center', paddingHorizontal: Spacing.base,
    gap: Spacing.xs, paddingTop: Spacing.xs, paddingBottom: Spacing.sm,
  },

  /* Icône silhouette */
  headerIcon: { width: 56, height: 56, alignItems: 'center' },
  avatarCircle: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarBody: {
    width: 38, height: 18, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.7)',
    marginTop: 3,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
    borderBottomWidth: 0,
  },

  headerTitle: { fontSize: Typography.xl, fontWeight: '800', color: Colors.white },
  headerSub: { fontSize: Typography.sm, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.base, paddingTop: Spacing.lg, paddingBottom: Spacing.xl },
  form: { gap: Spacing.lg },
  row: { flexDirection: 'row', gap: Spacing.sm },

  fieldWrap: { gap: Spacing.xs },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 2 },
  label: { fontSize: Typography.sm, fontWeight: '700', color: Colors.gray[600] },

  /* Champs texte */
  input: {
    borderWidth: 2, borderColor: Colors.gray[200],
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.base, height: 52,
    fontSize: Typography.base, color: Colors.black,
    backgroundColor: Colors.gray[50], fontWeight: '600',
  },
  inputFocused: { borderColor: Colors.love.primary, backgroundColor: Colors.love.light, ...Shadow.sm },

  /* Date de naissance */
  dateRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
  },
  dateSegment: {
    width: 56, height: 52,
    borderWidth: 2, borderColor: Colors.gray[200],
    borderRadius: BorderRadius.lg,
    fontSize: Typography.base, color: Colors.black,
    backgroundColor: Colors.gray[50], fontWeight: '700',
    textAlign: 'center',
  },
  dateSegmentYear: {
    width: 80, height: 52,
    borderWidth: 2, borderColor: Colors.gray[200],
    borderRadius: BorderRadius.lg,
    fontSize: Typography.base, color: Colors.black,
    backgroundColor: Colors.gray[50], fontWeight: '700',
    textAlign: 'center',
  },
  dateSep: {
    fontSize: Typography.lg, color: Colors.gray[300], fontWeight: '700',
    marginHorizontal: 2,
  },

  /* Badge âge */
  ageBadge: {
    marginLeft: Spacing.sm, paddingHorizontal: Spacing.sm, paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  ageBadgeOk:  { backgroundColor: '#E8F5E9' },
  ageBadgeErr: { backgroundColor: Colors.love.light },
  ageBadgeText: { fontSize: 12, fontWeight: '800' },
  ageBadgeTextOk:  { color: '#2E7D32' },
  ageBadgeTextErr: { color: Colors.love.secondary },

  ageError: {
    fontSize: 12, color: Colors.love.secondary, fontWeight: '600', marginTop: 2,
  },

  /* Badge détectée / modifiée */
  detectedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#E8F5E9', borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm, paddingVertical: 2,
  },
  modifiedBadge: { backgroundColor: Colors.love.light },
  badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4CAF50' },
  badgeDotModified: { backgroundColor: Colors.love.primary },
  detectedText: { fontSize: 11, fontWeight: '700', color: '#2E7D32' },
  modifiedText: { color: Colors.love.secondary },
  vpnHint: { fontSize: 11, color: Colors.gray[400], marginTop: 2 },

  /* Genre */
  genderGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  genderBtn: {
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full, borderWidth: 2,
    borderColor: Colors.gray[200], backgroundColor: Colors.gray[50],
  },
  genderBtnActive: { borderColor: Colors.love.primary, backgroundColor: Colors.love.light, ...Shadow.sm },
  genderText: { fontSize: Typography.sm, color: Colors.gray[600], fontWeight: '600' },
  genderTextActive: { color: Colors.love.secondary, fontWeight: '700' },

  /* Footer */
  footer: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xl, paddingTop: Spacing.sm },
  btn: { borderRadius: BorderRadius.full, overflow: 'hidden', ...Shadow.md },
  btnGradient: { paddingVertical: 18, alignItems: 'center' },
  btnDisabled: {},
  btnPressed: { opacity: 0.88 },
  btnText: { fontSize: Typography.md, fontWeight: '800', color: Colors.white, letterSpacing: 0.3 },
})
