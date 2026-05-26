import { useRef, useEffect } from 'react'
import { View, Text, StyleSheet, Pressable, FlatList, Alert, Animated } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import * as ImagePicker from 'expo-image-picker'
import { Image } from 'expo-image'
import { Colors, Typography, Spacing, BorderRadius, Shadow, nativeDriver } from '@/constants/theme'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { useAuthStore } from '@/stores/auth.store'
import { OnboardingProgress } from '@/components/ui/onboarding-progress'

const MAX_PHOTOS = 9
const MIN_PHOTOS = 2

export default function OnboardingPhotosScreen() {
  const router = useRouter()
  const { photos, addPhoto, removePhoto } = useOnboardingStore()
  const { setStatus } = useAuthStore()
  const fadeAnim = useRef(new Animated.Value(0)).current
  const btnAnim = useRef(new Animated.Value(0.95)).current

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: nativeDriver }).start()
  }, [])

  useEffect(() => {
    Animated.spring(btnAnim, {
      toValue: photos.length >= MIN_PHOTOS ? 1 : 0.95,
      useNativeDriver: nativeDriver,
      damping: 12,
    }).start()
  }, [photos.length])

  const pickImage = async () => {
    if (photos.length >= MAX_PHOTOS) return
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission requise', "Hear Me a besoin d'accéder à ta galerie pour tes photos de profil.")
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.85,
    })
    if (!result.canceled && result.assets[0]) {
      addPhoto(result.assets[0].uri)
    }
  }

  const handleFinish = () => {
    if (photos.length < MIN_PHOTOS) return
    setStatus('authenticated')
    router.replace('/(tabs)' as any)
  }

  const canFinish = photos.length >= MIN_PHOTOS
  const remaining = MIN_PHOTOS - photos.length

  // Build grid: photos + add button (if room) + empty placeholders up to 9
  const cells: Array<{ type: 'photo'; uri: string } | { type: 'add' } | { type: 'empty' }> = [
    ...photos.map((uri) => ({ type: 'photo' as const, uri })),
    ...(photos.length < MAX_PHOTOS ? [{ type: 'add' as const }] : []),
    ...Array(Math.max(0, 9 - photos.length - (photos.length < MAX_PHOTOS ? 1 : 0))).fill({ type: 'empty' as const }),
  ].slice(0, 9)

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#FF6B9D', '#FF4757']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}>
        <SafeAreaView>
          <OnboardingProgress step={5} total={5} light />
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Tes meilleures photos</Text>
            <Text style={styles.headerSub}>
              La première photo est ta photo principale
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Counter */}
      <View style={styles.counterRow}>
        <View style={[styles.counterBadge, canFinish && styles.counterBadgeReady]}>
          <Text style={[styles.counterText, canFinish && styles.counterTextReady]}>
            {canFinish
              ? `✓ ${photos.length} photo${photos.length > 1 ? 's' : ''} ajoutée${photos.length > 1 ? 's' : ''}`
              : `${photos.length}/${MIN_PHOTOS} minimum · encore ${remaining} requise${remaining > 1 ? 's' : ''}`}
          </Text>
        </View>
      </View>

      {/* Grid */}
      <Animated.View style={[styles.gridWrapper, { opacity: fadeAnim }]}>
        <FlatList
          data={cells}
          keyExtractor={(_, i) => String(i)}
          numColumns={3}
          scrollEnabled={false}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          renderItem={({ item, index }) => {
            if (item.type === 'add') {
              return (
                <Pressable style={styles.addCell} onPress={pickImage}>
                  <LinearGradient
                    colors={['#FFF0F5', '#FFE4EF']}
                    style={styles.addCellInner}>
                    <Text style={styles.addIcon}>+</Text>
                    <Text style={styles.addLabel}>Ajouter</Text>
                  </LinearGradient>
                </Pressable>
              )
            }
            if (item.type === 'empty') {
              return <View style={styles.emptyCell} />
            }
            return (
              <View style={styles.photoCell}>
                <Image source={{ uri: item.uri }} style={styles.photo} contentFit="cover" />
                <Pressable style={styles.removeBtn} onPress={() => removePhoto(item.uri)}>
                  <Text style={styles.removeBtnText}>✕</Text>
                </Pressable>
                {index === 0 && (
                  <View style={styles.mainBadge}>
                    <LinearGradient colors={['#FF6B9D', '#FF4757']} style={styles.mainBadgeGradient}>
                      <Text style={styles.mainBadgeText}>Principale</Text>
                    </LinearGradient>
                  </View>
                )}
              </View>
            )
          }}
        />
      </Animated.View>

      <Text style={styles.hint}>
        Format portrait recommandé · Max {MAX_PHOTOS} photos
      </Text>

      {/* Footer */}
      <View style={styles.footer}>
        <Animated.View style={{ transform: [{ scale: btnAnim }] }}>
          <Pressable
            style={[styles.btn, !canFinish && styles.btnDisabled]}
            onPress={handleFinish}
            disabled={!canFinish}>
            {canFinish ? (
              <LinearGradient
                colors={['#FF6B9D', '#FF4757']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.btnGradient}>
                <Text style={styles.btnText}>Commencer l'aventure 🎵</Text>
              </LinearGradient>
            ) : (
              <View style={[styles.btnGradient, { backgroundColor: Colors.gray[200] }]}>
                <Text style={[styles.btnText, { color: Colors.gray[400] }]}>
                  Ajoute encore {remaining} photo{remaining > 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </Pressable>
        </Animated.View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { paddingBottom: Spacing.xl },
  headerContent: { alignItems: 'center', paddingHorizontal: Spacing.base, gap: Spacing.xs, paddingTop: Spacing.sm, paddingBottom: Spacing.sm },
  headerTitle: { fontSize: Typography.xl, fontWeight: '800', color: Colors.white },
  headerSub: { fontSize: Typography.sm, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  counterRow: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, alignItems: 'center' },
  counterBadge: {
    backgroundColor: Colors.gray[100],
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
  },
  counterBadgeReady: { backgroundColor: '#E6F9F0' },
  counterText: { fontSize: Typography.sm, color: Colors.gray[500], fontWeight: '600' },
  counterTextReady: { color: '#2D9D6E', fontWeight: '700' },
  gridWrapper: { paddingHorizontal: Spacing.base },
  grid: { gap: Spacing.sm },
  row: { gap: Spacing.sm },
  photoCell: {
    flex: 1,
    aspectRatio: 3 / 4,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    ...Shadow.sm,
  },
  photo: { width: '100%', height: '100%' },
  removeBtn: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  mainBadge: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  mainBadgeGradient: { paddingVertical: 4, alignItems: 'center' },
  mainBadgeText: { color: Colors.white, fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  addCell: {
    flex: 1,
    aspectRatio: 3 / 4,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.love.primary,
    ...Shadow.sm,
  },
  addCellInner: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.xs },
  addIcon: { fontSize: 30, color: Colors.love.primary },
  addLabel: { fontSize: 12, color: Colors.love.secondary, fontWeight: '700' },
  emptyCell: {
    flex: 1,
    aspectRatio: 3 / 4,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.gray[100],
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderStyle: 'dashed',
  },
  hint: { textAlign: 'center', fontSize: 11, color: Colors.gray[300], marginTop: Spacing.xs, lineHeight: 16 },
  footer: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xl, paddingTop: Spacing.sm },
  btn: { borderRadius: BorderRadius.full, overflow: 'hidden', ...Shadow.md },
  btnGradient: { paddingVertical: 18, alignItems: 'center' },
  btnDisabled: {},
  btnText: { fontSize: Typography.md, fontWeight: '800', color: Colors.white, letterSpacing: 0.3 },
})
