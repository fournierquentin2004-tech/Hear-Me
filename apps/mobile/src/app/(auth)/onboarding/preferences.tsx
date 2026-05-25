import { useState } from 'react'
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { Gender } from '@/types/user.types'
import { OnboardingProgress } from '@/components/ui/onboarding-progress'

const GENDERS: { key: Gender; label: string }[] = [
  { key: 'homme', label: 'Hommes' },
  { key: 'femme', label: 'Femmes' },
  { key: 'non-binaire', label: 'Non-binaires' },
  { key: 'trans', label: 'Trans' },
  { key: 'iel', label: 'Iel' },
  { key: 'autre', label: 'Autres' },
]

const DISTANCES = [10, 20, 30, 50, 75, 100, 150, 200]

export default function OnboardingPreferencesScreen() {
  const router = useRouter()
  const { connectionType, setPreferences } = useOnboardingStore()

  const [loveGender, setLoveGender] = useState<Gender[]>([])
  const [loveAgeMin, setLoveAgeMin] = useState(18)
  const [loveAgeMax, setLoveAgeMax] = useState(35)
  const [loveDist, setLoveDist] = useState(50)

  const [friendGender, setFriendGender] = useState<Gender[]>([])
  const [friendAgeMin, setFriendAgeMin] = useState(18)
  const [friendAgeMax, setFriendAgeMax] = useState(35)
  const [friendDist, setFriendDist] = useState(50)

  const showLove = connectionType === 'amour' || connectionType === 'les deux'
  const showFriend = connectionType === 'amitié' || connectionType === 'les deux'

  const isValid = (!showLove || loveGender.length > 0) && (!showFriend || friendGender.length > 0)

  const toggleGender = (arr: Gender[], set: (v: Gender[]) => void, g: Gender) => {
    arr.includes(g) ? set(arr.filter((x) => x !== g)) : set([...arr, g])
  }

  const handleNext = () => {
    if (!isValid) return
    setPreferences({
      loveGender, loveAgeMin, loveAgeMax, loveMaxDistanceKm: loveDist,
      friendshipGender: friendGender, friendshipAgeMin: friendAgeMin, friendshipAgeMax: friendAgeMax, friendshipMaxDistanceKm: friendDist,
    })
    router.push('/(auth)/onboarding/photos')
  }

  const GenderSelector = ({ selected, onToggle, label }: { selected: Gender[]; onToggle: (g: Gender) => void; label: string }) => (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.chips}>
        {GENDERS.map((g) => (
          <Pressable
            key={g.key}
            style={[styles.chip, selected.includes(g.key) && styles.chipActive]}
            onPress={() => onToggle(g.key)}>
            <Text style={[styles.chipText, selected.includes(g.key) && styles.chipTextActive]}>{g.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  )

  const AgeSelector = ({ min, max, setMin, setMax }: { min: number; max: number; setMin: (v: number) => void; setMax: (v: number) => void }) => (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Tranche d'âge : {min}–{max} ans</Text>
      <View style={styles.ageRow}>
        <View style={styles.ageGroup}>
          <Text style={styles.ageLabel}>Min</Text>
          <View style={styles.ageBtns}>
            <Pressable style={styles.ageBtn} onPress={() => min > 18 && setMin(min - 1)}>
              <Text style={styles.ageBtnText}>−</Text>
            </Pressable>
            <Text style={styles.ageValue}>{min}</Text>
            <Pressable style={styles.ageBtn} onPress={() => min < max - 1 && setMin(min + 1)}>
              <Text style={styles.ageBtnText}>+</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.ageSep} />
        <View style={styles.ageGroup}>
          <Text style={styles.ageLabel}>Max</Text>
          <View style={styles.ageBtns}>
            <Pressable style={styles.ageBtn} onPress={() => max > min + 1 && setMax(max - 1)}>
              <Text style={styles.ageBtnText}>−</Text>
            </Pressable>
            <Text style={styles.ageValue}>{max}</Text>
            <Pressable style={styles.ageBtn} onPress={() => max < 80 && setMax(max + 1)}>
              <Text style={styles.ageBtnText}>+</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  )

  const DistanceSelector = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Distance max : {value} km</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.distRow}>
          {DISTANCES.map((d) => (
            <Pressable key={d} style={[styles.distChip, value === d && styles.distChipActive]} onPress={() => onChange(d)}>
              <Text style={[styles.distText, value === d && styles.distTextActive]}>{d} km</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingProgress step={4} total={5} />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Tes préférences</Text>
        <Text style={styles.subtitle}>Tu peux tout modifier depuis ton profil ensuite</Text>

        {showLove && (
          <View style={styles.block}>
            <Text style={styles.blockTitle}>❤️ Pour l'amour</Text>
            <GenderSelector selected={loveGender} onToggle={(g) => toggleGender(loveGender, setLoveGender, g)} label="Je rencontre" />
            <AgeSelector min={loveAgeMin} max={loveAgeMax} setMin={setLoveAgeMin} setMax={setLoveAgeMax} />
            <DistanceSelector value={loveDist} onChange={setLoveDist} />
          </View>
        )}

        {showFriend && (
          <View style={styles.block}>
            <Text style={styles.blockTitle}>🤝 Pour l'amitié</Text>
            <GenderSelector selected={friendGender} onToggle={(g) => toggleGender(friendGender, setFriendGender, g)} label="Je rencontre" />
            <AgeSelector min={friendAgeMin} max={friendAgeMax} setMin={setFriendAgeMin} setMax={setFriendAgeMax} />
            <DistanceSelector value={friendDist} onChange={setFriendDist} />
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={[styles.btn, !isValid && styles.btnDisabled]} onPress={handleNext} disabled={!isValid}>
          <Text style={styles.btnText}>Continuer →</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { flex: 1, paddingHorizontal: Spacing.base },
  title: { fontSize: Typography['2xl'], fontWeight: '800', color: Colors.black, marginTop: Spacing.base, marginBottom: Spacing.xs },
  subtitle: { fontSize: Typography.sm, color: Colors.gray[500], marginBottom: Spacing.lg },
  block: { marginBottom: Spacing.xl, backgroundColor: Colors.gray[50], borderRadius: BorderRadius.lg, padding: Spacing.base, gap: Spacing.base },
  blockTitle: { fontSize: Typography.base, fontWeight: '700', color: Colors.black },
  section: { gap: Spacing.sm },
  sectionLabel: { fontSize: Typography.sm, fontWeight: '600', color: Colors.gray[700] },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  chip: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: Colors.gray[200], backgroundColor: Colors.white },
  chipActive: { borderColor: Colors.love.primary, backgroundColor: Colors.love.light },
  chipText: { fontSize: Typography.sm, color: Colors.gray[600] },
  chipTextActive: { color: Colors.love.secondary, fontWeight: '600' },
  ageRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.base },
  ageGroup: { flex: 1, alignItems: 'center', gap: Spacing.xs },
  ageLabel: { fontSize: 12, color: Colors.gray[500] },
  ageBtns: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  ageBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.love.light, alignItems: 'center', justifyContent: 'center' },
  ageBtnText: { fontSize: 20, color: Colors.love.primary, fontWeight: '700', lineHeight: 24 },
  ageValue: { fontSize: Typography.lg, fontWeight: '700', color: Colors.black, minWidth: 36, textAlign: 'center' },
  ageSep: { width: 1, height: 40, backgroundColor: Colors.gray[200] },
  distRow: { flexDirection: 'row', gap: Spacing.sm, paddingVertical: Spacing.xs },
  distChip: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: Colors.gray[200], backgroundColor: Colors.white },
  distChipActive: { borderColor: Colors.love.primary, backgroundColor: Colors.love.light },
  distText: { fontSize: Typography.sm, color: Colors.gray[500] },
  distTextActive: { color: Colors.love.secondary, fontWeight: '600' },
  footer: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.lg },
  btn: { backgroundColor: Colors.love.primary, borderRadius: BorderRadius.full, paddingVertical: Spacing.base, alignItems: 'center' },
  btnDisabled: { backgroundColor: Colors.gray[200] },
  btnText: { fontSize: Typography.md, fontWeight: '700', color: Colors.white },
})
