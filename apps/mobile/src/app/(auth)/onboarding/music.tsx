import { useState, useRef } from 'react'
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  TextInput, FlatList, Animated,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Image } from 'expo-image'
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '@/constants/theme'
import { MUSIC_STYLES } from '@/constants/music-styles'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { OnboardingProgress } from '@/components/ui/onboarding-progress'
import { Song } from '@/types/user.types'

type Step = 'styles' | 'artists' | 'songs'

const STEP_CONFIG = [
  { key: 'styles'  as Step, label: 'Styles',    max: 2, placeholder: 'Choisis 2 genres'         },
  { key: 'artists' as Step, label: 'Artistes',   max: 3, placeholder: 'Recherche un artiste...'  },
  { key: 'songs'   as Step, label: 'Chansons',   max: 5, placeholder: 'Recherche une chanson...' },
]

export default function OnboardingMusicScreen() {
  const router = useRouter()
  const { setMusic } = useOnboardingStore()

  const [step, setStep]               = useState<Step>('styles')
  const [selectedStyles, setStyles]   = useState<string[]>([])
  const [selectedArtists, setArtists] = useState<string[]>([])
  const [selectedSongs, setSongs]     = useState<Song[]>([])
  const [search, setSearch]           = useState('')
  const [results, setResults]         = useState<any[]>([])
  const slideAnim = useRef(new Animated.Value(0)).current

  const stepIndex   = STEP_CONFIG.findIndex((s) => s.key === step)
  const currentConf = STEP_CONFIG[stepIndex]

  const animateIn = () => {
    slideAnim.setValue(30)
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 18 }).start()
  }

  // Artistes → Deezer (photos de visages, gratuit)
  const searchArtists = async (term: string) => {
    if (!term.trim()) return setResults([])
    try {
      const url = `https://api.deezer.com/search/artist?q=${encodeURIComponent(term)}&limit=15`
      const r   = await fetch(url)
      const d   = await r.json()
      setResults(d.data ?? [])
    } catch { setResults([]) }
  }

  // Chansons → iTunes (pochettes d'album + preview)
  const searchSongs = async (term: string) => {
    if (!term.trim()) return setResults([])
    try {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&country=FR&limit=15`
      const r   = await fetch(url)
      const d   = await r.json()
      setResults(d.results ?? [])
    } catch { setResults([]) }
  }

  const toggleStyle = (s: string) => {
    selectedStyles.includes(s)
      ? setStyles(selectedStyles.filter((x) => x !== s))
      : selectedStyles.length < 2 && setStyles([...selectedStyles, s])
  }
  const toggleArtist = (name: string) => {
    selectedArtists.includes(name)
      ? setArtists(selectedArtists.filter((a) => a !== name))
      : selectedArtists.length < 3 && setArtists([...selectedArtists, name])
  }
  const toggleSong = (track: any) => {
    const ex = selectedSongs.find((s) => s.itunes_track_id === track.trackId)
    if (ex) {
      setSongs(selectedSongs.filter((s) => s.itunes_track_id !== track.trackId))
    } else if (selectedSongs.length < 5) {
      setSongs([...selectedSongs, {
        itunes_track_id: track.trackId,
        title: track.trackName,
        artist: track.artistName,
        album: track.collectionName ?? '',
        album_cover_url: track.artworkUrl100 ?? '',
        preview_url: track.previewUrl ?? null,
      }])
    }
  }

  const canContinue = () => {
    if (step === 'styles')  return selectedStyles.length  === 2
    if (step === 'artists') return selectedArtists.length === 3
    return selectedSongs.length === 5
  }

  const handleNext = () => {
    if (step === 'styles')  { setSearch(''); setResults([]); animateIn(); return setStep('artists') }
    if (step === 'artists') { setSearch(''); setResults([]); animateIn(); return setStep('songs') }
    setMusic({
      styles:  selectedStyles  as [string, string],
      artists: selectedArtists as [string, string, string],
      songs:   selectedSongs,
    })
    router.push('/(auth)/onboarding/connection' as any)
  }

  const countText = () => {
    if (step === 'styles')  return `${selectedStyles.length} / 2`
    if (step === 'artists') return `${selectedArtists.length} / 3`
    return `${selectedSongs.length} / 5`
  }
  const btnLabel = () => {
    if (!canContinue()) {
      const rem = step === 'styles' ? 2 - selectedStyles.length
                : step === 'artists' ? 3 - selectedArtists.length
                : 5 - selectedSongs.length
      const noun = step === 'songs' ? `chanson${rem > 1 ? 's' : ''}` : step === 'artists' ? `artiste${rem > 1 ? 's' : ''}` : `style${rem > 1 ? 's' : ''}`
      return `Encore ${rem} ${noun}`
    }
    return step === 'songs' ? 'Valider ✓' : 'Suivant →'
  }

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <LinearGradient colors={['#FF6B9D', '#FF4757']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <SafeAreaView>
          <OnboardingProgress step={2} total={5} light />

          <View style={styles.headerMeta}>
            <Text style={styles.headerTitle}>Tes goûts musicaux</Text>

            {/* Onglets */}
            <View style={styles.tabs}>
              {STEP_CONFIG.map((s, i) => (
                <View key={s.key} style={[styles.tab, stepIndex >= i && styles.tabActive]}>
                  <Text style={[styles.tabText, stepIndex >= i && styles.tabTextActive]}>{s.label}</Text>
                  {stepIndex > i && <View style={styles.tabCheck}><Text style={styles.tabCheckText}>✓</Text></View>}
                </View>
              ))}
            </View>

            {/* Compteur inline */}
            <Text style={styles.headerCount}>{countText()} sélectionné{step === 'songs' ? 'es' : 's'}</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* ── Contenu ── */}

      {/* STYLES — grille 3 colonnes dense */}
      {step === 'styles' && (
        <Animated.View style={[styles.flex, { transform: [{ translateY: slideAnim }] }]}>
          <FlatList
            data={[...MUSIC_STYLES]}
            numColumns={3}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.chipGrid}
            columnWrapperStyle={styles.chipRow}
            renderItem={({ item }) => {
              const active = selectedStyles.includes(item)
              return (
                <Pressable
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => toggleStyle(item)}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
                    {item}
                  </Text>
                </Pressable>
              )
            }}
          />
        </Animated.View>
      )}

      {/* ARTISTES */}
      {step === 'artists' && (
        <Animated.View style={[styles.flex, { transform: [{ translateY: slideAnim }] }]}>
          {/* Barre recherche */}
          <View style={styles.searchBar}>
            <View style={styles.searchIcon}><View style={styles.searchDot} /></View>
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={(t) => { setSearch(t); searchArtists(t) }}
              placeholder={currentConf.placeholder}
              placeholderTextColor={Colors.gray[300]}
              autoFocus
            />
            {search.length > 0 && (
              <Pressable onPress={() => { setSearch(''); setResults([]) }}>
                <Text style={styles.clearBtn}>✕</Text>
              </Pressable>
            )}
          </View>

          {/* Tags sélectionnés */}
          {selectedArtists.length > 0 && (
            <View style={styles.selectedTags}>
              {selectedArtists.map((a) => (
                <Pressable key={a} style={styles.tag} onPress={() => toggleArtist(a)}>
                  <Text style={styles.tagText}>{a}</Text>
                  <Text style={styles.tagX}>✕</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Résultats */}
          <FlatList
            data={results}
            keyExtractor={(i) => i.id?.toString()}
            renderItem={({ item }) => {
              const sel = selectedArtists.includes(item.name)
              // Deezer placeholder: URL contient "//250x250" quand pas de photo
              const hasPhoto = item.picture_medium && !item.picture_medium.includes('//250x250')
              const fans = item.nb_fan
                ? item.nb_fan >= 1_000_000
                  ? `${(item.nb_fan / 1_000_000).toFixed(1)}M fans`
                  : item.nb_fan >= 1_000
                  ? `${Math.round(item.nb_fan / 1_000)}K fans`
                  : `${item.nb_fan} fans`
                : null
              return (
                <Pressable style={[styles.resultRow, sel && styles.resultRowActive]} onPress={() => toggleArtist(item.name)}>
                  <View style={styles.artistAvatarWrap}>
                    {hasPhoto ? (
                      <Image source={{ uri: item.picture_medium }} style={styles.artistPhoto} contentFit="cover" />
                    ) : (
                      <View style={[styles.artistAvatar, sel && styles.artistAvatarActive]}>
                        <Text style={[styles.artistInitial, sel && { color: Colors.white }]}>
                          {item.name[0]?.toUpperCase()}
                        </Text>
                      </View>
                    )}
                    {sel && (
                      <View style={styles.artistPhotoCheck}>
                        <Text style={styles.artistPhotoCheckText}>✓</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.resultInfo}>
                    <Text style={[styles.resultName, sel && styles.resultNameActive]}>{item.name}</Text>
                    {fans && <Text style={styles.resultSub}>{fans}</Text>}
                  </View>
                  {sel && <Text style={styles.checkIcon}>✓</Text>}
                </Pressable>
              )
            }}
            ListEmptyComponent={
              search.length > 0
                ? <Text style={styles.emptyText}>Aucun résultat</Text>
                : <Text style={styles.emptyText}>Tape le nom d'un artiste</Text>
            }
          />
        </Animated.View>
      )}

      {/* CHANSONS */}
      {step === 'songs' && (
        <Animated.View style={[styles.flex, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.searchBar}>
            <View style={styles.searchIcon}><View style={styles.searchDot} /></View>
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={(t) => { setSearch(t); searchSongs(t) }}
              placeholder={currentConf.placeholder}
              placeholderTextColor={Colors.gray[300]}
              autoFocus
            />
            {search.length > 0 && (
              <Pressable onPress={() => { setSearch(''); setResults([]) }}>
                <Text style={styles.clearBtn}>✕</Text>
              </Pressable>
            )}
          </View>

          {/* Chansons sélectionnées — bande horizontale compacte */}
          {selectedSongs.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.songBand} contentContainerStyle={styles.songBandContent}>
              {selectedSongs.map((s) => (
                <Pressable key={s.itunes_track_id} style={styles.songPill} onPress={() => toggleSong({ trackId: s.itunes_track_id })}>
                  <Image source={{ uri: s.album_cover_url }} style={styles.songPillCover} />
                  <Text style={styles.songPillText} numberOfLines={1}>{s.title}</Text>
                  <Text style={styles.tagX}>✕</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          <FlatList
            data={results}
            keyExtractor={(i) => i.trackId?.toString()}
            renderItem={({ item }) => {
              const sel = selectedSongs.some((s) => s.itunes_track_id === item.trackId)
              return (
                <Pressable style={[styles.resultRow, sel && styles.resultRowActive]} onPress={() => toggleSong(item)}>
                  <Image source={{ uri: item.artworkUrl100 }} style={styles.cover} />
                  <View style={styles.resultInfo}>
                    <Text style={[styles.resultName, sel && styles.resultNameActive]} numberOfLines={1}>{item.trackName}</Text>
                    <Text style={styles.resultSub} numberOfLines={1}>{item.artistName}</Text>
                  </View>
                  {sel && <Text style={styles.checkIcon}>✓</Text>}
                </Pressable>
              )
            }}
            ListEmptyComponent={
              search.length > 0
                ? <Text style={styles.emptyText}>Aucun résultat</Text>
                : <Text style={styles.emptyText}>Tape le titre d'une chanson</Text>
            }
          />
        </Animated.View>
      )}

      {/* ── Footer ── */}
      <View style={styles.footer}>
        <Pressable style={[styles.btn, !canContinue() && styles.btnOff]} onPress={handleNext} disabled={!canContinue()}>
          {canContinue() ? (
            <LinearGradient colors={['#FF6B9D', '#FF4757']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btnGradient}>
              <Text style={styles.btnText}>{btnLabel()}</Text>
            </LinearGradient>
          ) : (
            <View style={[styles.btnGradient, { backgroundColor: Colors.gray[200] }]}>
              <Text style={[styles.btnText, { color: Colors.gray[400] }]}>{btnLabel()}</Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  flex: { flex: 1 },

  /* Header */
  header: { paddingBottom: Spacing.base },
  headerMeta: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.sm, gap: Spacing.xs },
  headerTitle: { fontSize: Typography.xl, fontWeight: '800', color: Colors.white, textAlign: 'center' },

  /* Tabs */
  tabs: { flexDirection: 'row', gap: Spacing.xs },
  tab: { flex: 1, paddingVertical: 6, alignItems: 'center', borderRadius: BorderRadius.full, backgroundColor: 'rgba(255,255,255,0.2)', flexDirection: 'row', justifyContent: 'center', gap: 4 },
  tabActive: { backgroundColor: Colors.white },
  tabText: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  tabTextActive: { color: Colors.love.secondary },
  tabCheck: { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.love.primary, alignItems: 'center', justifyContent: 'center' },
  tabCheckText: { fontSize: 9, color: Colors.white, fontWeight: '800' },

  headerCount: { fontSize: 12, color: 'rgba(255,255,255,0.8)', textAlign: 'center', fontWeight: '600' },

  /* Grille styles — 3 colonnes serrées */
  chipGrid: { padding: Spacing.sm, gap: Spacing.xs },
  chipRow: { gap: Spacing.xs },
  chip: {
    flex: 1, height: 42, borderRadius: BorderRadius.md,
    borderWidth: 1.5, borderColor: Colors.gray[200],
    backgroundColor: Colors.gray[50],
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4,
  },
  chipActive: { borderColor: Colors.love.primary, backgroundColor: Colors.love.light },
  chipText: { fontSize: 12, color: Colors.gray[600], fontWeight: '600', textAlign: 'center' },
  chipTextActive: { color: Colors.love.secondary, fontWeight: '700' },

  /* Barre de recherche */
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: Spacing.base, marginVertical: Spacing.sm,
    borderWidth: 2, borderColor: Colors.gray[200],
    borderRadius: BorderRadius.xl, height: 50,
    backgroundColor: Colors.gray[50], paddingHorizontal: Spacing.base, gap: Spacing.sm,
  },
  searchIcon: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.gray[400], alignItems: 'center', justifyContent: 'center' },
  searchDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.gray[400], marginTop: -2 },
  searchInput: { flex: 1, fontSize: Typography.base, color: Colors.black, fontWeight: '500' },
  clearBtn: { fontSize: 14, color: Colors.gray[400], fontWeight: '700', paddingHorizontal: 4 },

  /* Tags sélectionnés (artistes) */
  selectedTags: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.base, gap: Spacing.xs, marginBottom: Spacing.xs },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.love.light, borderRadius: BorderRadius.full, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderWidth: 1.5, borderColor: Colors.love.primary },
  tagText: { fontSize: 12, color: Colors.love.secondary, fontWeight: '700' },
  tagX: { fontSize: 10, color: Colors.love.secondary, fontWeight: '700' },

  /* Bande chansons sélectionnées */
  songBand: { maxHeight: 52, marginBottom: Spacing.xs },
  songBandContent: { paddingHorizontal: Spacing.base, gap: Spacing.xs, alignItems: 'center' },
  songPill: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, backgroundColor: Colors.love.light, borderRadius: BorderRadius.md, padding: 4, borderWidth: 1.5, borderColor: Colors.love.primary, maxWidth: 140 },
  songPillCover: { width: 32, height: 32, borderRadius: BorderRadius.sm },
  songPillText: { fontSize: 11, color: Colors.love.secondary, fontWeight: '600', flex: 1 },

  /* Résultats */
  resultRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.gray[100], gap: Spacing.sm,
  },
  resultRowActive: { backgroundColor: Colors.love.light },
  artistAvatarWrap: { width: 40, height: 40, position: 'relative' },
  artistPhoto: { width: 40, height: 40, borderRadius: 20 },
  artistPhotoCheck: {
    position: 'absolute', bottom: -2, right: -2,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: Colors.love.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.white,
  },
  artistPhotoCheckText: { fontSize: 9, color: Colors.white, fontWeight: '800' },
  artistAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.gray[200], alignItems: 'center', justifyContent: 'center',
  },
  artistAvatarActive: { backgroundColor: Colors.love.primary },
  artistInitial: { fontSize: Typography.base, fontWeight: '700', color: Colors.gray[600] },
  cover: { width: 40, height: 40, borderRadius: BorderRadius.sm },
  resultInfo: { flex: 1 },
  resultName: { fontSize: Typography.sm, fontWeight: '700', color: Colors.black },
  resultNameActive: { color: Colors.love.secondary },
  resultSub: { fontSize: 12, color: Colors.gray[400], marginTop: 1 },
  checkIcon: { fontSize: 16, color: Colors.love.primary, fontWeight: '800' },
  emptyText: { textAlign: 'center', color: Colors.gray[300], fontSize: Typography.sm, marginTop: Spacing.xl },

  /* Footer */
  footer: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xl, paddingTop: Spacing.sm },
  btn: { borderRadius: BorderRadius.full, overflow: 'hidden', ...Shadow.md },
  btnOff: {},
  btnGradient: { paddingVertical: 18, alignItems: 'center' },
  btnText: { fontSize: Typography.md, fontWeight: '800', color: Colors.white, letterSpacing: 0.3 },
})
