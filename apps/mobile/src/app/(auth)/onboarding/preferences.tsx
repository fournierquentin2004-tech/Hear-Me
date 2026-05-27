import { useState } from 'react'
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '@/constants/theme'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { Gender } from '@/types/user.types'
import { OnboardingProgress } from '@/components/ui/onboarding-progress'
import { RangeSlider } from '@/components/ui/range-slider'

const GENDERS: { key: Gender; label: string }[] = [
  { key: 'homme',       label: 'Hommes'    },
  { key: 'femme',       label: 'Femmes'    },
  { key: 'non-binaire', label: 'Non-bin.'  },
  { key: 'trans',       label: 'Trans'     },
  { key: 'iel',         label: 'Iel'       },
  { key: 'autre',       label: 'Autres'    },
]

const ALL_GENDER_KEYS = GENDERS.map((g) => g.key)
const isAllSelected   = (arr: Gender[]) => ALL_GENDER_KEYS.every((k) => arr.includes(k))

export default function OnboardingPreferencesScreen() {
  const router = useRouter()
  const { connectionType, setPreferences } = useOnboardingStore()

  const [loveGender, setLoveGender] = useState<Gender[]>([])
  const [loveAgeMin, setLoveAgeMin] = useState(20)
  const [loveAgeMax, setLoveAgeMax] = useState(35)
  const [loveDistMin, setLoveDistMin] = useState(0)
  const [loveDistMax, setLoveDistMax] = useState(50)

  const [friendGender, setFriendGender] = useState<Gender[]>([])
  const [friendAgeMin, setFriendAgeMin] = useState(20)
  const [friendAgeMax, setFriendAgeMax] = useState(35)
  const [friendDistMin, setFriendDistMin] = useState(0)
  const [friendDistMax, setFriendDistMax] = useState(50)

  const showLove = connectionType === 'amour' || connectionType === 'les deux'
  const showFriend = connectionType === 'amitié' || connectionType === 'les deux'

  const isValid = (!showLove || loveGender.length > 0) && (!showFriend || friendGender.length > 0)

  const toggleGender = (arr: Gender[], set: (v: Gender[]) => void, g: Gender) => {
    arr.includes(g) ? set(arr.filter((x) => x !== g)) : set([...arr, g])
  }

  // "Tous" : sélectionne tout le monde — cliquer à nouveau désélectionne tout
  const toggleAll = (arr: Gender[], set: (v: Gender[]) => void) => {
    isAllSelected(arr) ? set([]) : set([...ALL_GENDER_KEYS])
  }

  const handleNext = () => {
    if (!isValid) return
    setPreferences({
      loveGender,
      loveAgeMin,
      loveAgeMax,
      loveMaxDistanceKm: loveDistMax,
      friendshipGender: friendGender,
      friendshipAgeMin: friendAgeMin,
      friendshipAgeMax: friendAgeMax,
      friendshipMaxDistanceKm: friendDistMax,
    })
    router.push('/(auth)/onboarding/photos' as any)
  }

  const loveColors: [string, string] = ['#FF6B9D', '#FF4757']
  const friendColors: [string, string] = ['#5C7CFA', '#7950F2']

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={
          showLove && showFriend
            ? ['#FF6B9D', '#7950F2']
            : showLove
            ? loveColors
            : friendColors
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}>
        <SafeAreaView>
          <OnboardingProgress step={4} total={5} light />
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Tes préférences</Text>
            <Text style={styles.headerSub}>Tu peux tout modifier depuis ton profil</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Bloc Amour */}
        {showLove && (
          <View style={styles.block}>
            <LinearGradient colors={['#FFF0F5', '#FFE4EF']} style={styles.blockHeader}>
              <View style={[styles.blockDot, { backgroundColor: Colors.love.primary }]} />
              <Text style={[styles.blockTitle, { color: Colors.love.secondary }]}>Pour l'amour</Text>
            </LinearGradient>

            {/* Genre */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Je rencontre</Text>
              <View style={styles.genderChips}>
                {GENDERS.map((g) => (
                  <Pressable
                    key={g.key}
                    style={[styles.chip, loveGender.includes(g.key) && styles.chipLoveActive]}
                    onPress={() => toggleGender(loveGender, setLoveGender, g.key)}>
                    <Text style={[styles.chipText, loveGender.includes(g.key) && styles.chipTextLoveActive]}>
                      {g.label}
                    </Text>
                  </Pressable>
                ))}
                <Pressable
                  style={[styles.chip, isAllSelected(loveGender) && styles.chipLoveActive]}
                  onPress={() => toggleAll(loveGender, setLoveGender)}>
                  <Text style={[styles.chipText, isAllSelected(loveGender) && styles.chipTextLoveActive]}>
                    Tous
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Âge */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Tranche d'âge</Text>
              <RangeSlider
                min={18} max={80}
                low={loveAgeMin} high={loveAgeMax}
                step={1} unit=" ans"
                color={Colors.love.primary}
                onValueChange={(lo, hi) => { setLoveAgeMin(lo); setLoveAgeMax(hi) }}
              />
            </View>

            {/* Distance */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Distance maximale</Text>
              <RangeSlider
                min={0} max={200}
                low={loveDistMin} high={loveDistMax}
                step={1} unit=" km"
                color={Colors.love.primary}
                onValueChange={(lo, hi) => { setLoveDistMin(lo); setLoveDistMax(hi) }}
              />
            </View>
          </View>
        )}

        {/* Bloc Amitié */}
        {showFriend && (
          <View style={styles.block}>
            <LinearGradient colors={['#EEF2FF', '#E0E7FF']} style={styles.blockHeader}>
              <View style={[styles.blockDot, { backgroundColor: Colors.friendship.primary }]} />
              <Text style={[styles.blockTitle, { color: Colors.friendship.secondary }]}>Pour l'amitié</Text>
            </LinearGradient>

            {/* Genre */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Je rencontre</Text>
              <View style={styles.genderChips}>
                {GENDERS.map((g) => (
                  <Pressable
                    key={g.key}
                    style={[styles.chip, friendGender.includes(g.key) && styles.chipFriendActive]}
                    onPress={() => toggleGender(friendGender, setFriendGender, g.key)}>
                    <Text style={[styles.chipText, friendGender.includes(g.key) && styles.chipTextFriendActive]}>
                      {g.label}
                    </Text>
                  </Pressable>
                ))}
                <Pressable
                  style={[styles.chip, isAllSelected(friendGender) && styles.chipFriendActive]}
                  onPress={() => toggleAll(friendGender, setFriendGender)}>
                  <Text style={[styles.chipText, isAllSelected(friendGender) && styles.chipTextFriendActive]}>
                    Tous
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Âge */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Tranche d'âge</Text>
              <RangeSlider
                min={18} max={80}
                low={friendAgeMin} high={friendAgeMax}
                step={1} unit=" ans"
                color={Colors.friendship.primary}
                onValueChange={(lo, hi) => { setFriendAgeMin(lo); setFriendAgeMax(hi) }}
              />
            </View>

            {/* Distance */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Distance maximale</Text>
              <RangeSlider
                min={0} max={200}
                low={friendDistMin} high={friendDistMax}
                step={1} unit=" km"
                color={Colors.friendship.primary}
                onValueChange={(lo, hi) => { setFriendDistMin(lo); setFriendDistMax(hi) }}
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable
          style={[styles.btn, !isValid && styles.btnDisabled]}
          onPress={handleNext}
          disabled={!isValid}>
          {isValid ? (
            <LinearGradient
              colors={showLove && showFriend ? ['#FF6B9D', '#7950F2'] : showLove ? loveColors : friendColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btnGradient}>
              <Text style={styles.btnText}>Continuer →</Text>
            </LinearGradient>
          ) : (
            <View style={[styles.btnGradient, { backgroundColor: Colors.gray[200] }]}>
              <Text style={[styles.btnText, { color: Colors.gray[400] }]}>Sélectionne au moins un genre</Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { paddingBottom: Spacing['2xl'] },
  headerContent: { alignItems: 'center', paddingHorizontal: Spacing.base, gap: Spacing.xs, paddingTop: Spacing.sm, paddingBottom: Spacing.sm },
  headerTitle: { fontSize: Typography.xl, fontWeight: '800', color: Colors.white },
  headerSub: { fontSize: Typography.sm, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.base, paddingTop: Spacing.lg, paddingBottom: Spacing.xl, gap: Spacing.lg },
  block: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.gray[100],
    ...Shadow.sm,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  blockDot: { width: 12, height: 12, borderRadius: 6 },
  blockTitle: { fontSize: Typography.base, fontWeight: '800' },
  section: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.base, gap: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.gray[100] },
  sectionLabel: { fontSize: Typography.sm, fontWeight: '700', color: Colors.gray[600] },
  genderChips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.gray[200],
    backgroundColor: Colors.white,
  },
  chipLoveActive: { borderColor: Colors.love.primary, backgroundColor: Colors.love.light },
  chipFriendActive: { borderColor: Colors.friendship.primary, backgroundColor: '#EEF2FF' },
  chipText: { fontSize: 12, color: Colors.gray[600], fontWeight: '600' },
  chipTextLoveActive: { color: Colors.love.secondary, fontWeight: '700' },
  chipTextFriendActive: { color: Colors.friendship.secondary, fontWeight: '700' },
  footer: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xl, paddingTop: Spacing.sm },
  btn: { borderRadius: BorderRadius.full, overflow: 'hidden', ...Shadow.md },
  btnGradient: { paddingVertical: 18, alignItems: 'center' },
  btnDisabled: {},
  btnText: { fontSize: Typography.md, fontWeight: '800', color: Colors.white, letterSpacing: 0.3 },
})
