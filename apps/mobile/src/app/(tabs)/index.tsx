import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Dimensions, StyleSheet, Text, View, Pressable, Platform, Modal, ScrollView, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated'
import { scheduleOnRN, scheduleOnUI } from 'react-native-worklets'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { Spacing, BorderRadius } from '@/constants/theme'
import { MOCK_PROFILES, MockProfile } from '@/data/mock-profiles'
import { useOnboardingStore } from '@/stores/onboarding.store'

const MOCK_MY_PHOTO  = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=faces&q=80'
const MOCK_MY_STYLES = ['R&B', 'Pop', 'Hip-Hop', 'Électro']

const { width: SW, height: SH } = Dimensions.get('window')
const CARD_W             = SW - 32
const CARD_H             = SH * 0.72
const SWIPE_THRESHOLD    = SW * 0.28
const SWIPE_UP_THRESHOLD = SH * 0.20

// ── Equalizer bars ─────────────────────────────────────────

function EqBars({ value, color }: { value: number; color: string }) {
  const filled  = Math.round((value / 100) * 5)
  const heights = [10, 14, 18, 14, 10]
  return (
    <View style={eq.wrap}>
      {heights.map((h, i) => (
        <View
          key={i}
          style={[eq.bar, { height: h },
            i < filled
              ? { backgroundColor: color }
              : { backgroundColor: 'rgba(252,245,234,0.22)' },
          ]}
        />
      ))}
    </View>
  )
}
const eq = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  bar:  { width: 4, borderRadius: 2 },
})

// ── SwipeCard ──────────────────────────────────────────────

export type SwipeCardRef = { like: () => void; pass: () => void; superLike: () => void }

type CardProps = {
  profile:      MockProfile
  onLike:       () => void
  onPass:       () => void
  onSuperLike:  () => void
  onInfo:       () => void
}

const SwipeCard = forwardRef<SwipeCardRef, CardProps>(({ profile, onLike, onPass, onSuperLike, onInfo }, ref) => {
  const tx = useSharedValue(0)
  const ty = useSharedValue(0)
  const [photoIdx, setPhotoIdx] = useState(0)
  const photos = profile.photos

  const prevPhoto = useCallback(() => setPhotoIdx(i => Math.max(0, i - 1)), [])
  const nextPhoto = useCallback(() => setPhotoIdx(i => Math.min(photos.length - 1, i + 1)), [photos.length])

  const animateLike = useCallback(() => {
    scheduleOnUI(() => {
      'worklet'
      tx.value = withTiming(SW * 1.6, { duration: 280 }, (finished) => {
        'worklet'
        if (finished) scheduleOnRN(onLike)
      })
    })
  }, [onLike, tx])

  const animatePass = useCallback(() => {
    scheduleOnUI(() => {
      'worklet'
      tx.value = withTiming(-SW * 1.6, { duration: 280 }, (finished) => {
        'worklet'
        if (finished) scheduleOnRN(onPass)
      })
    })
  }, [onPass, tx])

  const animateSuperLike = useCallback(() => {
    scheduleOnUI(() => {
      'worklet'
      ty.value = withTiming(-SH * 1.6, { duration: 280 }, (finished) => {
        'worklet'
        if (finished) scheduleOnRN(onSuperLike)
      })
    })
  }, [onSuperLike, ty])

  useImperativeHandle(ref, () => ({ like: animateLike, pass: animatePass, superLike: animateSuperLike }))

  const panGesture = Gesture.Pan()
    .minDistance(8)
    .onUpdate((e) => {
      tx.value = e.translationX
      const goingUp = e.translationY < -20 && Math.abs(e.translationY) > Math.abs(e.translationX)
      ty.value = goingUp ? e.translationY * 0.55 : e.translationY * 0.10
    })
    .onEnd((e) => {
      const isUpSwipe = e.translationY < -SWIPE_UP_THRESHOLD && Math.abs(e.translationY) > Math.abs(e.translationX)
      if (isUpSwipe) {
        ty.value = withTiming(-SH * 1.6, { duration: 280 }, (finished) => {
          'worklet'
          if (finished) scheduleOnRN(onSuperLike)
        })
      } else if (e.translationX > SWIPE_THRESHOLD) {
        tx.value = withTiming(SW * 1.6, { duration: 280 }, (finished) => {
          'worklet'
          if (finished) scheduleOnRN(onLike)
        })
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        tx.value = withTiming(-SW * 1.6, { duration: 280 }, (finished) => {
          'worklet'
          if (finished) scheduleOnRN(onPass)
        })
      } else {
        tx.value = withSpring(0, { damping: 15 })
        ty.value = withSpring(0, { damping: 15 })
      }
    })

  const tapGesture = Gesture.Tap()
    .maxDuration(250)
    .onEnd((e) => {
      'worklet'
      if (e.x < CARD_W / 2) scheduleOnRN(prevPhoto)
      else scheduleOnRN(nextPhoto)
    })

  const gesture = Gesture.Race(panGesture, tapGesture)

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      {
        rotate: `${interpolate(
          tx.value,
          [-SW / 2, 0, SW / 2],
          [-10, 0, 10],
          Extrapolation.CLAMP
        )}deg`,
      },
    ],
  }))

  const likeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(tx.value, [0, SWIPE_THRESHOLD * 0.5], [0, 1], Extrapolation.CLAMP),
  }))
  const passOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(tx.value, [-SWIPE_THRESHOLD * 0.5, 0], [1, 0], Extrapolation.CLAMP),
  }))
  const superLikeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(ty.value, [-80, -20], [1, 0], Extrapolation.CLAMP),
  }))

  const connColor  =
    profile.connectionType === 'amour'    ? '#F0556E'
    : profile.connectionType === 'amitié' ? '#60A5FA'
    : '#C084FC'

  const compatColor =
    profile.compatibility >= 80 ? '#34D399'
    : profile.compatibility >= 60 ? '#FBBF24'
    : '#F87171'

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, cardStyle]}>

        {/* Toutes les photos empilées — celle active est visible, les autres cachées (préchargées) */}
        {photos.map((photo, i) => (
          <Image
            key={photo}
            source={{ uri: photo }}
            style={[StyleSheet.absoluteFill, { opacity: i === photoIdx ? 1 : 0 }]}
            contentFit="cover"
            transition={0}
          />
        ))}

        {/* Dots indicateurs en haut */}
        {photos.length > 1 && (
          <View style={styles.dots}>
            {photos.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === photoIdx ? styles.dotActive : styles.dotInactive]}
              />
            ))}
          </View>
        )}

        {/* Gradient fort du bas */}
        <LinearGradient
          colors={['transparent', 'rgba(10,2,8,0.55)', 'rgba(10,2,8,0.92)', '#0A0208']}
          locations={[0.30, 0.58, 0.80, 1]}
          style={[StyleSheet.absoluteFill, { top: '25%' }]}
          pointerEvents="none"
        />

        {/* LIKE badge */}
        <Animated.View style={[styles.likeBadge, likeOpacity]}>
          <Text style={styles.likeText}>LIKE</Text>
        </Animated.View>

        {/* PASS badge */}
        <Animated.View style={[styles.passBadge, passOpacity]}>
          <Text style={styles.passText}>PASS</Text>
        </Animated.View>

        {/* SUPER LIKE badge */}
        <Animated.View style={[styles.superLikeBadge, superLikeOpacity]}>
          <Text style={styles.superLikeText}>★  SUPER LIKE</Text>
        </Animated.View>

        {/* Infos en bas de la card */}
        <View style={styles.overlay}>

          {/* Ligne 1 : nom + compatibilité */}
          <View style={styles.nameRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{profile.name}, {profile.age}</Text>
              <Text style={styles.city}>{profile.city}  ·  {profile.distanceKm} km</Text>
            </View>
            <View style={styles.compatBox}>
              <EqBars value={profile.compatibility} color={compatColor} />
              <Text style={[styles.compatNum, { color: compatColor }]}>
                {profile.compatibility}%
              </Text>
            </View>
          </View>

          {/* Ligne 2 : styles musicaux + connexion */}
          <View style={styles.tagsRow}>
            {profile.musicStyles.map((s) => (
              <View key={s} style={styles.styleChip}>
                <Text style={styles.styleText}>♪  {s}</Text>
              </View>
            ))}
            <View style={[styles.connChip, { borderColor: connColor + '80', backgroundColor: connColor + '22' }]}>
              <Text style={[styles.connText, { color: connColor }]}>
                {profile.connectionType === 'amour' ? '♥  Amour'
                  : profile.connectionType === 'amitié' ? 'Amitié'
                  : '♥  Amour & Amitié'}
              </Text>
            </View>
          </View>

          {/* Ligne 3 : artistes + bouton profil */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={[styles.artists, { flex: 1 }]} numberOfLines={1}>
              {profile.topArtists.slice(0, 3).join('  ·  ')}
            </Text>
            <Pressable
              onPress={onInfo}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 4,
                backgroundColor: 'rgba(252,245,234,0.08)',
                borderRadius: 20,
                paddingHorizontal: 10, paddingVertical: 5,
                borderWidth: 1, borderColor: 'rgba(252,245,234,0.18)',
                marginLeft: 8,
              }}>
              <Text style={{
                fontSize: 11, color: 'rgba(252,245,234,0.75)',
                fontWeight: '600', letterSpacing: 0.3,
              }}>Profil</Text>
            </Pressable>
          </View>
        </View>

      </Animated.View>
    </GestureDetector>
  )
})

// ── Match Overlay ──────────────────────────────────────────

type MatchOverlayProps = {
  profile: MockProfile
  onMessage: () => void
  onContinue: () => void
}

function MatchOverlay({ profile, onMessage, onContinue }: MatchOverlayProps) {
  const bgOpacity    = useSharedValue(0)
  const photosScale  = useSharedValue(0.6)
  const contentOpacity = useSharedValue(0)
  const contentY     = useSharedValue(24)

  useEffect(() => {
    bgOpacity.value      = withTiming(1, { duration: 380 })
    photosScale.value    = withDelay(180, withSpring(1, { damping: 13 }))
    contentOpacity.value = withDelay(320, withTiming(1, { duration: 400 }))
    contentY.value       = withDelay(320, withTiming(0, { duration: 400 }))
  }, [])

  const bgStyle      = useAnimatedStyle(() => ({ opacity: bgOpacity.value }))
  const photosStyle  = useAnimatedStyle(() => ({ transform: [{ scale: photosScale.value }] }))
  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }))

  const commonStyles  = profile.musicStyles.filter(s => MOCK_MY_STYLES.includes(s))
  const commonArtists = profile.topArtists.filter(a =>
    ['Aya Nakamura', 'Beyoncé', 'Drake', 'Daft Punk'].includes(a)
  )

  return (
    <Animated.View style={[match.container, bgStyle]}>
      <LinearGradient
        colors={['#3A1530', '#1A0818', '#0A0208']}
        style={StyleSheet.absoluteFill}
      />

      {/* Titre */}
      <Text style={match.title}>C'est un match !</Text>
      <Text style={match.subtitle}>L'AMOUR EST UNE BANDE-SON</Text>

      {/* Photos */}
      <Animated.View style={[match.photos, photosStyle]}>
        <View style={match.photoWrap}>
          <Image source={{ uri: MOCK_MY_PHOTO }} style={match.photo} contentFit="cover" />
        </View>
        <View style={match.heartBetween}>
          <Text style={match.heartIcon}>♥</Text>
        </View>
        <View style={match.photoWrap}>
          <Image source={{ uri: profile.photos[0] }} style={match.photo} contentFit="cover" />
        </View>
      </Animated.View>

      {/* Musique en commun */}
      <Animated.View style={[match.musicSection, contentStyle]}>
        {(commonStyles.length > 0 || commonArtists.length > 0) && (
          <>
            <Text style={match.musicLabel}>En commun</Text>
            <View style={match.chips}>
              {commonStyles.map(s => (
                <View key={s} style={match.chip}>
                  <Text style={match.chipText}>♪  {s}</Text>
                </View>
              ))}
              {commonArtists.map(a => (
                <View key={a} style={match.chip}>
                  <Text style={match.chipText}>{a}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </Animated.View>

      {/* Boutons */}
      <Animated.View style={[match.buttons, contentStyle]}>
        <Pressable onPress={onMessage}>
          <LinearGradient
            colors={['#FF9A6B', '#F0556E', '#B42D74']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={match.btnPrimary}>
            <Text style={match.btnPrimaryText}>Envoyer un message</Text>
          </LinearGradient>
        </Pressable>

        <Pressable style={match.btnSecondary} onPress={onContinue}>
          <Text style={match.btnSecondaryText}>Continuer à explorer</Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  )
}

const match = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.xl,
  },
  title: {
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' }),
    fontSize: 36,
    fontWeight: '500',
    color: '#FCF5EA',
    letterSpacing: 1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '300',
    color: 'rgba(252,245,234,0.55)',
    letterSpacing: 3.5,
    textTransform: 'uppercase',
    marginTop: -16,
  },
  photos: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
  },
  photoWrap: {
    width: 130,
    height: 130,
    borderRadius: 65,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(252,245,234,0.2)',
  },
  photo: { width: '100%', height: '100%' },
  heartBetween: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0556E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartIcon: { fontSize: 20, color: '#fff' },
  musicSection: { alignItems: 'center', gap: Spacing.sm, minHeight: 60 },
  musicLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(252,245,234,0.5)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  chips: { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap', justifyContent: 'center' },
  chip: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: 'rgba(252,245,234,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(252,245,234,0.2)',
  },
  chipText: { fontSize: 12, fontWeight: '600', color: '#FCF5EA' },
  buttons: { width: '100%', gap: Spacing.md },
  btnPrimary: {
    borderRadius: BorderRadius.full,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnPrimaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.4,
  },
  btnSecondary: { alignItems: 'center', paddingVertical: Spacing.sm },
  btnSecondaryText: {
    fontSize: 13,
    color: 'rgba(252,245,234,0.5)',
  },
})

// ── Profile Sheet ─────────────────────────────────────────

function ProfileSheet({ profile, onClose }: { profile: MockProfile; onClose: () => void }) {
  const [photoIdx, setPhotoIdx] = useState(0)

  const connColor =
    profile.connectionType === 'amour'    ? '#F0556E'
    : profile.connectionType === 'amitié' ? '#60A5FA'
    : '#C084FC'

  const compatColor =
    profile.compatibility >= 80 ? '#34D399'
    : profile.compatibility >= 60 ? '#FBBF24'
    : '#F87171'

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={sheet.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={sheet.container}>
          {/* Drag handle */}
          <View style={sheet.handle} />

          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>

            {/* Photos */}
            <View style={sheet.photoWrap}>
              <Image
                source={{ uri: profile.photos[photoIdx] }}
                style={sheet.photo}
                contentFit="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(10,2,8,0.7)']}
                style={[StyleSheet.absoluteFill, { top: '50%' }]}
                pointerEvents="none"
              />
              {/* Dots */}
              {profile.photos.length > 1 && (
                <View style={sheet.dots}>
                  {profile.photos.map((_, i) => (
                    <Pressable key={i} onPress={() => setPhotoIdx(i)}>
                      <View style={[sheet.dot, i === photoIdx ? sheet.dotOn : sheet.dotOff]} />
                    </Pressable>
                  ))}
                </View>
              )}
              {/* Fermer */}
              <Pressable style={sheet.closeBtn} onPress={onClose}>
                <Text style={sheet.closeIcon}>✕</Text>
              </Pressable>
            </View>

            {/* Infos */}
            <View style={sheet.body}>

              {/* Nom + compat */}
              <View style={sheet.nameRow}>
                <View style={{ flex: 1 }}>
                  <Text style={sheet.name}>{profile.name}, {profile.age}</Text>
                  <Text style={sheet.sub}>{profile.city}  ·  {profile.distanceKm} km</Text>
                </View>
                <View style={[sheet.compatBadge, { borderColor: compatColor, backgroundColor: compatColor + '18' }]}>
                  <EqBars value={profile.compatibility} color={compatColor} />
                  <Text style={[sheet.compatNum, { color: compatColor }]}>{profile.compatibility}%</Text>
                </View>
              </View>

              {/* Bio */}
              <Text style={sheet.bio}>{profile.bio}</Text>

              {/* Connexion */}
              <View style={[sheet.connChip, { borderColor: connColor + '70', backgroundColor: connColor + '18' }]}>
                <Text style={[sheet.connText, { color: connColor }]}>
                  {profile.connectionType === 'amour' ? '♥  Amour'
                    : profile.connectionType === 'amitié' ? 'Amitié'
                    : '♥  Amour & Amitié'}
                </Text>
              </View>

              {/* Séparateur */}
              <View style={sheet.separator} />

              {/* Musique */}
              <Text style={sheet.sectionLabel}>STYLES MUSICAUX</Text>
              <View style={sheet.chips}>
                {profile.musicStyles.map(s => (
                  <View key={s} style={sheet.chip}>
                    <Text style={sheet.chipText}>♪  {s}</Text>
                  </View>
                ))}
              </View>

              <Text style={[sheet.sectionLabel, { marginTop: Spacing.base }]}>ARTISTES FAVORIS</Text>
              <View style={sheet.chips}>
                {profile.topArtists.map(a => (
                  <View key={a} style={sheet.chip}>
                    <Text style={sheet.chipText}>{a}</Text>
                  </View>
                ))}
              </View>

              {/* Actions */}
              <View style={sheet.actions}>
                <Pressable style={sheet.passBtn} onPress={onClose}>
                  <Text style={sheet.passIcon}>✕</Text>
                </Pressable>
                <Pressable style={sheet.likeBtn} onPress={onClose}>
                  <LinearGradient
                    colors={['#FF9A6B', '#F0556E', '#B42D74']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={sheet.likeBtnInner}>
                    <Text style={sheet.likeIcon}>♥</Text>
                  </LinearGradient>
                </Pressable>
              </View>

            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

const sheet = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  container: {
    backgroundColor: '#120410',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: SH * 0.92,
    overflow: 'hidden',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(252,245,234,0.2)',
    alignSelf: 'center',
    marginTop: 12, marginBottom: 4,
  },
  photoWrap: { width: '100%', height: SH * 0.48 },
  photo: { width: '100%', height: '100%' },
  dots: {
    position: 'absolute', bottom: 12,
    flexDirection: 'row', gap: 6,
    alignSelf: 'center',
  },
  dot:    { width: 6, height: 6, borderRadius: 3 },
  dotOn:  { backgroundColor: '#FCF5EA' },
  dotOff: { backgroundColor: 'rgba(252,245,234,0.35)' },
  closeBtn: {
    position: 'absolute', top: 14, right: 14,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(10,2,8,0.55)',
    alignItems: 'center', justifyContent: 'center',
  },
  closeIcon: { fontSize: 14, color: '#FCF5EA' },
  body: { padding: Spacing.base, gap: Spacing.base },
  nameRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  name: { fontSize: 24, fontWeight: '800', color: '#FCF5EA' },
  sub:  { fontSize: 13, color: 'rgba(252,245,234,0.55)', marginTop: 2 },
  compatBadge: {
    alignItems: 'center', borderWidth: 1.5,
    borderRadius: BorderRadius.md, paddingHorizontal: 10, paddingVertical: 6, minWidth: 62,
  },
  compatNum: { fontSize: 16, fontWeight: '800', marginTop: 3 },
  bio: { fontSize: 14, color: 'rgba(252,245,234,0.78)', lineHeight: 21 },
  connChip: {
    alignSelf: 'flex-start', borderWidth: 1,
    borderRadius: BorderRadius.full, paddingHorizontal: 12, paddingVertical: 4,
  },
  connText: { fontSize: 12, fontWeight: '700' },
  separator: { height: 1, backgroundColor: 'rgba(252,245,234,0.08)' },
  sectionLabel: {
    fontSize: 10, fontWeight: '700',
    color: 'rgba(252,245,234,0.4)', letterSpacing: 2,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  chip: {
    borderRadius: BorderRadius.full, paddingHorizontal: 12, paddingVertical: 5,
    backgroundColor: 'rgba(252,245,234,0.08)',
    borderWidth: 1, borderColor: 'rgba(252,245,234,0.15)',
  },
  chipText: { fontSize: 12, fontWeight: '600', color: '#FCF5EA' },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: 32, paddingVertical: Spacing.sm },
  passBtn: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1.5, borderColor: 'rgba(248,113,113,0.55)',
    alignItems: 'center', justifyContent: 'center',
  },
  passIcon: { fontSize: 20, color: '#F87171' },
  likeBtn: { width: 60, height: 60, borderRadius: 30, overflow: 'hidden' },
  likeBtnInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  likeIcon: { fontSize: 24, color: '#fff' },
})

// ── Boost ─────────────────────────────────────────────────

const BOOST_DURATION_BY_PLAN: Record<string, number> = {
  or:      2  * 60 * 60,   // 2h/semaine
  platine: 5  * 60 * 60,   // 5h/semaine
  diamant: 24 * 60 * 60,   // 24h/semaine
}
const MOCK_USER_PLAN = 'or'

function formatBoostTime(s: number) {
  const m   = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

// ── Discovery Screen ───────────────────────────────────────

type DiscoveryMode = 'amour' | 'amitié'

const GRADIENT: Record<DiscoveryMode, readonly [string, string, string]> = {
  amour:  ['#6B0F30', '#3A0A1C', '#130408'],
  amitié: ['#4A3205', '#281C02', '#0A0800'],
}

const MODE_ACCENT: Record<DiscoveryMode, string> = {
  amour:  '#D4567A',
  amitié: '#C8960A',
}

// ── Friendship Setup ──────────────────────────────────────

const GENDERS = [
  { key: 'homme',       label: 'Hommes'   },
  { key: 'femme',       label: 'Femmes'   },
  { key: 'non-binaire', label: 'Non-bin.' },
  { key: 'tous',        label: 'Tous'     },
]

function FriendshipSetup({ onConfirm, onBack }: { onConfirm: () => void; onBack: () => void }) {
  const [genders,     setGenders]     = useState<string[]>([])
  const [ageMinStr,   setAgeMinStr]   = useState('18')
  const [ageMaxStr,   setAgeMaxStr]   = useState('35')
  const [distanceStr, setDistanceStr] = useState('50')
  const repeatTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const toggleGender = (key: string) =>
    setGenders(g => g.includes(key) ? g.filter(x => x !== key) : [...g, key])

  const canConfirm = genders.length > 0

  const startRepeat = (fn: () => void) => { fn(); repeatTimer.current = setInterval(fn, 80) }
  const stopRepeat  = () => { if (repeatTimer.current) { clearInterval(repeatTimer.current); repeatTimer.current = null } }

  const commit = (val: string, min: number, max: number, set: (v: string) => void) => {
    const n = parseInt(val) || min
    set(String(Math.max(min, Math.min(max, n))))
  }

  const ageMin = parseInt(ageMinStr) || 18
  const ageMax = parseInt(ageMaxStr) || 35

  return (
    <View style={styles.setupBox}>
      <Text style={styles.setupTitle}>Mode Amitié</Text>
      <Text style={styles.setupSub}>Configure tes préférences pour trouver des amis</Text>

      {/* Genre */}
      <View style={styles.setupSection}>
        <Text style={styles.setupLabel}>JE RECHERCHE</Text>
        <View style={styles.setupChips}>
          {GENDERS.map(g => (
            <Pressable
              key={g.key}
              onPress={() => toggleGender(g.key)}
              style={[styles.setupChip, genders.includes(g.key) && styles.setupChipActive]}>
              <Text style={[styles.setupChipText, genders.includes(g.key) && styles.setupChipTextActive]}>
                {g.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Âge */}
      <View style={styles.setupSection}>
        <Text style={styles.setupLabel}>ÂGE</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={[styles.setupStepperSm, { flex: 1, justifyContent: 'center' }]}>
            <Pressable onPressIn={() => startRepeat(() => setAgeMinStr(v => String(Math.max(18, (parseInt(v)||18) - 1))))} onPressOut={stopRepeat} style={styles.stepBtnSm}><Text style={styles.stepTextSm}>−</Text></Pressable>
            <TextInput style={[styles.stepValueSm, { flex: 1 }]} value={ageMinStr} onChangeText={t => setAgeMinStr(t.replace(/\D/g, ''))} onBlur={() => commit(ageMinStr, 18, ageMax - 1, setAgeMinStr)} keyboardType="numeric" maxLength={2} selectTextOnFocus />
            <Pressable onPressIn={() => startRepeat(() => setAgeMinStr(v => String(Math.min(ageMax - 1, (parseInt(v)||18) + 1))))} onPressOut={stopRepeat} style={styles.stepBtnSm}><Text style={styles.stepTextSm}>+</Text></Pressable>
          </View>
          <Text style={styles.setupDash}>—</Text>
          <View style={[styles.setupStepperSm, { flex: 1, justifyContent: 'center' }]}>
            <Pressable onPressIn={() => startRepeat(() => setAgeMaxStr(v => String(Math.max(ageMin + 1, (parseInt(v)||35) - 1))))} onPressOut={stopRepeat} style={styles.stepBtnSm}><Text style={styles.stepTextSm}>−</Text></Pressable>
            <TextInput style={[styles.stepValueSm, { flex: 1 }]} value={ageMaxStr} onChangeText={t => setAgeMaxStr(t.replace(/\D/g, ''))} onBlur={() => commit(ageMaxStr, ageMin + 1, 65, setAgeMaxStr)} keyboardType="numeric" maxLength={2} selectTextOnFocus />
            <Pressable onPressIn={() => startRepeat(() => setAgeMaxStr(v => String(Math.min(65, (parseInt(v)||35) + 1))))} onPressOut={stopRepeat} style={styles.stepBtnSm}><Text style={styles.stepTextSm}>+</Text></Pressable>
          </View>
          <Text style={[styles.setupUnit, { width: 28, textAlign: 'right' as const }]}>ans</Text>
        </View>
      </View>

      {/* Distance */}
      <View style={styles.setupSection}>
        <Text style={styles.setupLabel}>DISTANCE MAX</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={[styles.setupStepper, { flex: 1 }]}>
            <Pressable onPressIn={() => startRepeat(() => setDistanceStr(v => String(Math.max(5, (parseInt(v)||50) - 5))))} onPressOut={stopRepeat} style={styles.stepBtn}><Text style={styles.stepText}>−</Text></Pressable>
            <TextInput style={[styles.stepValue, { flex: 1 }]} value={distanceStr} onChangeText={t => setDistanceStr(t.replace(/\D/g, ''))} onBlur={() => commit(distanceStr, 5, 150, setDistanceStr)} keyboardType="numeric" maxLength={3} selectTextOnFocus />
            <Pressable onPressIn={() => startRepeat(() => setDistanceStr(v => String(Math.min(150, (parseInt(v)||50) + 5))))} onPressOut={stopRepeat} style={styles.stepBtn}><Text style={styles.stepText}>+</Text></Pressable>
          </View>
          <Text style={[styles.setupUnit, { width: 28, textAlign: 'right' as const }]}>km</Text>
        </View>
      </View>

      {/* Confirmer */}
      <Pressable
        style={({ pressed }) => [styles.setupBtn, !canConfirm && styles.btnDisabled, pressed && styles.pressed]}
        onPress={onConfirm}
        disabled={!canConfirm}>
        <LinearGradient
          colors={canConfirm ? ['#C8960A', '#8C6200'] : ['#444', '#333']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.setupBtnInner}>
          <Text style={styles.setupBtnText}>Confirmer</Text>
        </LinearGradient>
      </Pressable>

      <Pressable onPress={onBack}>
        <Text style={styles.setupBack}>Revenir à Amour</Text>
      </Pressable>
    </View>
  )
}


function getInitialConfigured(connectionType: string | null): Set<DiscoveryMode> {
  if (connectionType === 'les deux') return new Set(['amour', 'amitié'])
  if (connectionType === 'amitié')   return new Set(['amitié'])
  return new Set(['amour']) // 'amour' ou null (pour l'exemple)
}

export default function DiscoverScreen() {
  const connectionType = useOnboardingStore(s => s.connectionType)
  const initialMode: DiscoveryMode =
    connectionType === 'amitié' ? 'amitié' : 'amour'

  const [mode,        setMode]       = useState<DiscoveryMode>(initialMode)
  const [showSetup,   setShowSetup]  = useState(false)
  const [configured,  setConfigured] = useState<Set<DiscoveryMode>>(
    () => getInitialConfigured(connectionType)
  )
  const [indexPerMode, setIndexPerMode] = useState<Record<DiscoveryMode, number>>({ amour: 0, amitié: 0 })
  const [historyPerMode, setHistoryPerMode] = useState<Record<DiscoveryMode, number[]>>({ amour: [], amitié: [] })
  const [match_,          setMatch]          = useState<MockProfile | null>(null)
  const [infoProfile,     setInfoProfile]     = useState<MockProfile | null>(null)
  const [boostSecondsLeft, setBoostSecondsLeft] = useState(0)
  const boostActive = boostSecondsLeft > 0
  const cardRef = useRef<SwipeCardRef>(null)

  useEffect(() => {
    if (!boostActive) return
    const id = setInterval(() => {
      setBoostSecondsLeft(s => (s <= 1 ? 0 : s - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [boostActive])

  const index   = indexPerMode[mode]
  const history = historyPerMode[mode]

  const setIndex = useCallback((v: number | ((p: number) => number)) => {
    setIndexPerMode(prev => ({ ...prev, [mode]: typeof v === 'function' ? v(prev[mode]) : v }))
  }, [mode])

  const setHistory = useCallback((v: number[] | ((p: number[]) => number[])) => {
    setHistoryPerMode(prev => ({ ...prev, [mode]: typeof v === 'function' ? v(prev[mode]) : v }))
  }, [mode])

  const filtered = MOCK_PROFILES.filter(p =>
    mode === 'amour'
      ? p.connectionType === 'amour' || p.connectionType === 'les deux'
      : p.connectionType === 'amitié' || p.connectionType === 'les deux'
  )

  const handleModeChange = useCallback((m: DiscoveryMode) => {
    setMode(m)
    if (!configured.has(m)) setShowSetup(true)
  }, [configured])

  const handleLike = useCallback(() => {
    const liked = filtered[index]
    const isMatch = Math.random() < 0.4
    setHistory([index])
    setIndex((i) => (i + 1) % filtered.length)
    if (isMatch) setMatch(liked)
  }, [index, filtered])

  const handlePass = useCallback(() => {
    setHistory([index])
    setIndex((i) => (i + 1) % filtered.length)
  }, [index, filtered])

  const handleSuperLike = useCallback(() => {
    const liked = filtered[index]
    setHistory([index])
    setIndex((i) => (i + 1) % filtered.length)
    if (Math.random() < 0.5) setMatch(liked)
  }, [index, filtered])

  const handleBoost = useCallback(() => {
    if (boostActive) return
    setBoostSecondsLeft(BOOST_DURATION_BY_PLAN[MOCK_USER_PLAN])
  }, [boostActive])

  const handleRewind = useCallback(() => {
    if (history.length === 0) return
    const prev = history[history.length - 1]
    setHistory(h => h.slice(0, -1))
    setIndex(prev)
  }, [history])

  const current = filtered[index]
  const next    = filtered[(index + 1) % filtered.length]
  const accent  = MODE_ACCENT[mode]

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={GRADIENT[mode]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.55, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>

        {/* Header + toggle */}
        <View style={styles.header}>
          <Text style={styles.headerLogo}>HearMe</Text>
          <View style={styles.toggle}>
            <Pressable
              style={[styles.toggleTab, mode === 'amour' && { backgroundColor: accent + 'CC' }]}
              onPress={() => handleModeChange('amour')}>
              <Text style={[styles.toggleText, mode === 'amour' && styles.toggleTextActive]}>
                ♥  Amour
              </Text>
            </Pressable>
            <Pressable
              style={[styles.toggleTab, mode === 'amitié' && { backgroundColor: accent + 'CC' }]}
              onPress={() => handleModeChange('amitié')}>
              <Text style={[styles.toggleText, mode === 'amitié' && styles.toggleTextActive]}>
                ◈  Amitié
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Cards */}
        <View style={styles.stack}>

          {/* Mode non configuré → formulaire direct */}
          {showSetup && !configured.has(mode) && (
            <FriendshipSetup
              onConfirm={() => {
                setConfigured(prev => new Set([...prev, mode as DiscoveryMode]))
                setShowSetup(false)
              }}
              onBack={() => { setMode('amour'); setShowSetup(false) }}
            />
          )}

          {(!showSetup || configured.has(mode)) && next && (
            <View style={[styles.card, styles.cardBehind]}>
              <Image source={{ uri: next.photos[0] }} style={StyleSheet.absoluteFill} contentFit="cover" />
              <LinearGradient
                colors={['transparent', 'rgba(10,2,8,0.85)']}
                style={[StyleSheet.absoluteFill, { top: '50%' }]}
                pointerEvents="none"
              />
            </View>
          )}

          {(!showSetup || configured.has(mode)) && current && (
            <SwipeCard
              key={current.id}
              ref={cardRef}
              profile={current}
              onLike={handleLike}
              onPass={handlePass}
              onSuperLike={handleSuperLike}
              onInfo={() => setInfoProfile(current)}
            />
          )}
        </View>

        {/* Boost timer */}
        {boostActive && (
          <View style={styles.boostBanner}>
            <Text style={styles.boostBannerText}>⚡  {formatBoostTime(boostSecondsLeft)} restant</Text>
          </View>
        )}

        {/* Boutons */}
        <View style={styles.actions}>
          {/* Rewind */}
          <Pressable
            style={({ pressed }) => [
              styles.actionBtn, styles.rewindBtn,
              pressed && styles.pressed,
              history.length === 0 && styles.btnDisabled,
            ]}
            onPress={handleRewind}
            disabled={history.length === 0}>
            <Text style={[styles.rewindIcon, history.length === 0 && styles.iconDisabled]}>↩</Text>
          </Pressable>

          {/* Pass */}
          <Pressable
            style={({ pressed }) => [styles.actionBtn, styles.passBtn, pressed && styles.pressed]}
            onPress={() => cardRef.current?.pass()}>
            <Text style={styles.passIcon}>✕</Text>
          </Pressable>

          {/* Like */}
          <Pressable
            style={({ pressed }) => [styles.actionBtn, styles.likeBtn, pressed && styles.pressed]}
            onPress={() => cardRef.current?.like()}>
            <LinearGradient
              colors={['#FF9A6B', '#F0556E', '#B42D74']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.likeBtnInner}>
              <Text style={styles.likeIcon}>♥</Text>
            </LinearGradient>
          </Pressable>

          {/* Boost */}
          <Pressable
            style={({ pressed }) => [
              styles.actionBtn, styles.boostBtn,
              boostActive && { opacity: 0.55 },
              pressed && !boostActive && styles.pressed,
            ]}
            onPress={handleBoost}
            disabled={boostActive}>
            <LinearGradient
              colors={boostActive ? ['#5B21B6', '#7C3AED'] : ['#4F46E5', '#7C3AED', '#C026D3']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.boostBtnInner}>
              <Text style={styles.boostIcon}>⚡</Text>
            </LinearGradient>
          </Pressable>
        </View>

      </SafeAreaView>

      {/* Profile sheet */}
      {infoProfile && (
        <ProfileSheet
          profile={infoProfile}
          onClose={() => setInfoProfile(null)}
        />
      )}

      {/* Match overlay */}
      {match_ && (
        <MatchOverlay
          profile={match_}
          onMessage={() => setMatch(null)}
          onContinue={() => setMatch(null)}
        />
      )}
    </View>
  )
}

// ── Styles ────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen:   { flex: 1 },
  safeArea: { flex: 1, justifyContent: 'space-between' },

  header: {
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  headerLogo: {
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' }),
    fontSize: 18,
    fontWeight: '500',
    color: 'rgba(252,245,234,0.55)',
    letterSpacing: 2,
  },

  toggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(252,245,234,0.08)',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(252,245,234,0.12)',
    padding: 3,
  },
  toggleTab: {
    paddingHorizontal: 24,
    paddingVertical: 9,
    borderRadius: BorderRadius.full,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(252,245,234,0.45)',
    letterSpacing: 0.4,
  },
  toggleTextActive: {
    color: '#FCF5EA',
    fontWeight: '700',
  },
  filterBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(252,245,234,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  filterIcon: { fontSize: 18, color: 'rgba(252,245,234,0.7)' },

  stack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    position: 'absolute',
    width: CARD_W,
    height: CARD_H,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#0A0208',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.55,
        shadowRadius: 24,
      },
      android: { elevation: 16 },
      default: {},
    }),
  },
  cardBehind: {
    transform: [{ scale: 0.93 }, { translateY: 18 }],
    opacity: 0.8,
  },

  /* Overlay info */
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.base,
    paddingBottom: 20,
    gap: Spacing.sm,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FCF5EA',
    letterSpacing: 0.2,
  },
  city: {
    fontSize: 13,
    color: 'rgba(252,245,234,0.6)',
    marginTop: 2,
  },
  compatBox: {
    alignItems: 'flex-end',
    gap: 4,
    paddingBottom: 4,
  },
  compatNum: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  tagsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  styleChip: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: 11,
    paddingVertical: 5,
    backgroundColor: 'rgba(252,245,234,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(252,245,234,0.2)',
  },
  styleText: { fontSize: 11.5, fontWeight: '600', color: '#FCF5EA' },

  connChip: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderWidth: 1,
  },
  connText: { fontSize: 11.5, fontWeight: '700' },

  artists: {
    fontSize: 12,
    color: 'rgba(252,245,234,0.42)',
    letterSpacing: 0.4,
  },

  /* Swipe badges */
  likeBadge: {
    position: 'absolute',
    top: 44,
    left: 20,
    borderWidth: 3,
    borderColor: '#34D399',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    transform: [{ rotate: '-14deg' }],
  },
  likeText: { fontSize: 22, fontWeight: '900', color: '#34D399', letterSpacing: 2 },

  passBadge: {
    position: 'absolute',
    top: 44,
    right: 20,
    borderWidth: 3,
    borderColor: '#F87171',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    transform: [{ rotate: '14deg' }],
  },
  passText: { fontSize: 22, fontWeight: '900', color: '#F87171', letterSpacing: 2 },

  superLikeBadge: {
    position: 'absolute',
    bottom: 160,
    alignSelf: 'center',
    borderWidth: 3,
    borderColor: '#60A5FA',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  superLikeText: { fontSize: 22, fontWeight: '900', color: '#60A5FA', letterSpacing: 2 },

  /* Action buttons */
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 36,
    paddingVertical: Spacing.base,
  },
  actionBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    overflow: 'hidden',
  },
  passBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(248,113,113,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passIcon: { fontSize: 22, color: '#F87171' },
  likeBtn:  {},
  likeBtnInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeIcon: { fontSize: 26, color: '#fff' },
  pressed:  { opacity: 0.80, transform: [{ scale: 0.92 }] },

  dots: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  dotActive:   { backgroundColor: '#FCF5EA' },
  dotInactive: { backgroundColor: 'rgba(252,245,234,0.35)' },

  infoBtn: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1.5,
    borderColor: 'rgba(252,245,234,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIcon: {
    fontSize: 20,
    fontStyle: 'italic',
    fontWeight: '700',
    color: 'rgba(252,245,234,0.8)',
  },

  rewindBtn: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1.5,
    borderColor: 'rgba(252,245,234,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewindIcon:   { fontSize: 22, color: 'rgba(252,245,234,0.8)' },

  superLikeBtn: {
    backgroundColor: 'rgba(96,165,250,0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(96,165,250,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  superLikeBtnIcon: { fontSize: 24, color: '#60A5FA' },

  boostBtn:      {},
  boostBtnInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  boostIcon:     { fontSize: 26, color: '#fff' },

  boostBanner: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(168,85,247,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.45)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 4,
  },
  boostBannerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D8B4FE',
    letterSpacing: 0.3,
  },
  btnDisabled:  { opacity: 0.3 },
  iconDisabled: { color: 'rgba(252,245,234,0.35)' },

  setupBox: {
    flex: 1,
    width: CARD_W,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.base,
  },
  setupEmoji:  { fontSize: 52, color: '#C8960A' },
  setupTitle:  { fontSize: 22, fontWeight: '800', color: '#FCF5EA', textAlign: 'center' },
  setupSub:    { fontSize: 14, color: 'rgba(252,245,234,0.55)', textAlign: 'center', lineHeight: 21 },
  setupBtn:    { borderRadius: BorderRadius.full, overflow: 'hidden', width: '100%' },
  setupBtnInner: { paddingVertical: 16, alignItems: 'center' },
  setupBtnText:  { fontSize: 14, fontWeight: '700', color: '#fff', letterSpacing: 0.4 },
  setupBack:   { fontSize: 13, color: 'rgba(252,245,234,0.4)', marginTop: Spacing.xs },

  setupSection: { width: '100%', gap: 10 },
  setupLabel: {
    fontSize: 10, fontWeight: '700',
    color: 'rgba(252,245,234,0.4)', letterSpacing: 2,
  },
  setupChips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  setupChip: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: 16, paddingVertical: 8,
    borderWidth: 1, borderColor: 'rgba(252,245,234,0.2)',
    backgroundColor: 'rgba(252,245,234,0.06)',
  },
  setupChipActive: {
    backgroundColor: '#C8960A33',
    borderColor: '#C8960A',
  },
  setupChipText:       { fontSize: 13, color: 'rgba(252,245,234,0.55)', fontWeight: '600' },
  setupChipTextActive: { color: '#F5C842', fontWeight: '700' },

  setupRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  setupGridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: Spacing.sm,
  },

  setupStepper: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(252,245,234,0.06)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(252,245,234,0.12)',
  },
  setupStepperSm: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(252,245,234,0.06)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: 4, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(252,245,234,0.12)',
  },

  stepBtn:    { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  stepBtnSm:  { width: 16, height: 28, alignItems: 'center', justifyContent: 'center' },
  stepText:   { fontSize: 20, color: '#FCF5EA', fontWeight: '300' },
  stepTextSm: { fontSize: 12, color: '#FCF5EA', fontWeight: '300' },
  stepValue: {
    fontSize: 16, fontWeight: '700', color: '#FCF5EA',
    minWidth: 28, textAlign: 'center',
    padding: 0, margin: 0,
    outlineStyle: 'none' as any,
    backgroundColor: 'transparent', borderWidth: 0,
  },
  stepValueSm: {
    fontSize: 13, fontWeight: '700', color: '#FCF5EA',
    width: 18, textAlign: 'center',
    padding: 0, margin: 0,
    outlineStyle: 'none' as any,
    backgroundColor: 'transparent', borderWidth: 0,
  },
  setupDash: { fontSize: 16, color: 'rgba(252,245,234,0.4)' },
  setupUnit: { fontSize: 13, color: 'rgba(252,245,234,0.5)' },
})
