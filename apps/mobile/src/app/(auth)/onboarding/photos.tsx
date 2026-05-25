import { View, Text, StyleSheet, Pressable, FlatList, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { Image } from 'expo-image'
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { useAuthStore } from '@/stores/auth.store'
import { OnboardingProgress } from '@/components/ui/onboarding-progress'

const MAX_PHOTOS = 9
const MIN_PHOTOS = 2

export default function OnboardingPhotosScreen() {
  const router = useRouter()
  const { photos, addPhoto, removePhoto } = useOnboardingStore()
  const { setStatus } = useAuthStore()

  const pickImage = async () => {
    if (photos.length >= MAX_PHOTOS) return
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Hear Me a besoin d\'accéder à ta galerie pour tes photos de profil.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    })
    if (!result.canceled && result.assets[0]) {
      addPhoto(result.assets[0].uri)
    }
  }

  const handleFinish = () => {
    if (photos.length < MIN_PHOTOS) return
    // TODO: upload photos + create user in Supabase
    setStatus('authenticated')
    router.replace('/(tabs)' as any)
  }

  const cells = [...photos, ...(photos.length < MAX_PHOTOS ? ['add'] : []), ...Array(Math.max(0, 9 - photos.length - 1)).fill('empty')]

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingProgress step={5} total={5} />

      <View style={styles.content}>
        <Text style={styles.title}>Tes photos 📸</Text>
        <Text style={styles.subtitle}>
          Minimum {MIN_PHOTOS} · Maximum {MAX_PHOTOS} · Ratio portrait recommandé
        </Text>

        <FlatList
          data={cells.slice(0, 9)}
          keyExtractor={(item, i) => `${item}-${i}`}
          numColumns={3}
          scrollEnabled={false}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          renderItem={({ item, index }) => {
            if (item === 'add') {
              return (
                <Pressable style={styles.addCell} onPress={pickImage}>
                  <Text style={styles.addIcon}>+</Text>
                  {index === 0 && <Text style={styles.addLabel}>Ajouter</Text>}
                </Pressable>
              )
            }
            if (item === 'empty') {
              return <View style={styles.emptyCell} />
            }
            return (
              <View style={styles.photoCell}>
                <Image source={{ uri: item }} style={styles.photo} contentFit="cover" />
                <Pressable style={styles.removeBtn} onPress={() => removePhoto(item)}>
                  <Text style={styles.removeBtnText}>✕</Text>
                </Pressable>
                {index === 0 && (
                  <View style={styles.mainBadge}>
                    <Text style={styles.mainBadgeText}>Principale</Text>
                  </View>
                )}
              </View>
            )
          }}
        />

        <Text style={styles.hint}>
          {photos.length}/{MAX_PHOTOS} photos · {photos.length < MIN_PHOTOS
            ? `Encore ${MIN_PHOTOS - photos.length} photo${MIN_PHOTOS - photos.length > 1 ? 's' : ''} requise${MIN_PHOTOS - photos.length > 1 ? 's' : ''}`
            : '✓ Tu peux continuer'}
        </Text>
      </View>

      <View style={styles.footer}>
        <Pressable
          style={[styles.btn, photos.length < MIN_PHOTOS && styles.btnDisabled]}
          onPress={handleFinish}
          disabled={photos.length < MIN_PHOTOS}>
          <Text style={styles.btnText}>Commencer l'aventure 🎵</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  content: { flex: 1, paddingHorizontal: Spacing.base },
  title: { fontSize: Typography['2xl'], fontWeight: '800', color: Colors.black, marginTop: Spacing.base, marginBottom: Spacing.xs },
  subtitle: { fontSize: Typography.sm, color: Colors.gray[500], marginBottom: Spacing.lg },
  grid: { gap: Spacing.sm },
  row: { gap: Spacing.sm },
  photoCell: { flex: 1, aspectRatio: 3 / 4, borderRadius: BorderRadius.md, overflow: 'hidden', position: 'relative' },
  photo: { width: '100%', height: '100%' },
  removeBtn: { position: 'absolute', top: Spacing.xs, right: Spacing.xs, backgroundColor: 'rgba(0,0,0,0.55)', width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  removeBtnText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  mainBadge: { position: 'absolute', bottom: Spacing.xs, left: Spacing.xs, backgroundColor: Colors.love.primary, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.xs, paddingVertical: 2 },
  mainBadgeText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
  addCell: { flex: 1, aspectRatio: 3 / 4, borderRadius: BorderRadius.md, borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.love.primary, backgroundColor: Colors.love.light, alignItems: 'center', justifyContent: 'center', gap: Spacing.xs },
  addIcon: { fontSize: 28, color: Colors.love.primary },
  addLabel: { fontSize: 12, color: Colors.love.primary, fontWeight: '600' },
  emptyCell: { flex: 1, aspectRatio: 3 / 4, borderRadius: BorderRadius.md, backgroundColor: Colors.gray[100] },
  hint: { textAlign: 'center', fontSize: Typography.sm, color: Colors.gray[500], marginTop: Spacing.base },
  footer: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.lg },
  btn: { backgroundColor: Colors.love.primary, borderRadius: BorderRadius.full, paddingVertical: Spacing.base, alignItems: 'center' },
  btnDisabled: { backgroundColor: Colors.gray[200] },
  btnText: { fontSize: Typography.md, fontWeight: '700', color: Colors.white },
})
