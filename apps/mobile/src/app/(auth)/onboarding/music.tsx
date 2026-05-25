import { useState, useRef, useEffect } from 'react'
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  TextInput, FlatList, Animated, Platform,
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
  { key: 'styles'  as Step, label: 'Styles',   max: 2, placeholder: 'Recherche un style...'    },
  { key: 'artists' as Step, label: 'Artistes',  max: 3, placeholder: 'Recherche un artiste...' },
  { key: 'songs'   as Step, label: 'Chansons',  max: 5, placeholder: 'Titre ou artiste...'     },
]

// Grille styles → rangées de 3
const STYLE_ROWS: string[][] = []
for (let i = 0; i < MUSIC_STYLES.length; i += 3) {
  STYLE_ROWS.push([...MUSIC_STYLES].slice(i, i + 3))
}


export default function OnboardingMusicScreen() {
  const router = useRouter()
  const { setMusic } = useOnboardingStore()

  const [step, setStep]               = useState<Step>('styles')
  const [selectedStyles, setStyles]   = useState<string[]>([])
  const [selectedArtists, setArtists] = useState<string[]>([])
  const [selectedSongs, setSongs]     = useState<Song[]>([])
  const [search, setSearch]           = useState('')
  const [results, setResults]         = useState<any[]>([])
  const [trending, setTrending]       = useState<{ artists: any[]; songs: any[] }>({ artists: [], songs: [] })
  const [focused, setFocused]         = useState(false)

  const slideAnim = useRef(new Animated.Value(0)).current

  const stepIndex   = STEP_CONFIG.findIndex((s) => s.key === step)
  const currentConf = STEP_CONFIG[stepIndex]

  const animateIn = () => {
    slideAnim.setValue(30)
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 18 }).start()
  }

  /* ── Chargement des tendances à l'entrée de chaque étape ── */
  useEffect(() => {
    if (step === 'artists') loadTrendingArtists()
    if (step === 'songs')   loadTrendingSongs()
  }, [step])

  const loadTrendingArtists = async () => {
    try {
      if (Platform.OS !== 'web') {
        // Natif : Deezer chart top 5
        const r = await fetch('https://api.deezer.com/chart/0/artists?limit=5')
        const d = await r.json()
        setTrending(t => ({ ...t, artists: (d.data ?? []).map((a: any) => ({ ...a, _source: 'deezer' })) }))
      } else {
        // Web (CORS Deezer bloqué) : iTunes fallback
        const r = await fetch('https://itunes.apple.com/search?term=pop+hits&entity=musicArtist&country=FR&limit=5')
        const d = await r.json()
        setTrending(t => ({
          ...t,
          artists: (d.results ?? []).map((a: any) => ({
            id: a.artistId, name: a.artistName,
            picture_medium: null, nb_fan: null, _source: 'itunes',
          })),
        }))
      }
    } catch {}
  }

  const loadTrendingSongs = async () => {
    try {
      // Apple RSS — marche partout (pas de CORS)
      const r = await fetch('https://rss.applemarketingtools.com/api/v2/fr/music/most-played/5/songs.json')
      const d = await r.json()
      const items: any[] = d.feed?.results ?? []
      setTrending(t => ({
        ...t,
        songs: items.map((s: any) => ({
          trackId: parseInt(s.id, 10),
          trackName: s.name,
          artistName: s.artistName,
          artworkUrl100: s.artworkUrl100?.replace('100x100', '200x200') ?? '',
          previewUrl: null,
          collectionName: '',
        })),
      }))
    } catch {}
  }

  /* ── Recherches ── */
  const searchArtists = async (term: string) => {
    if (!term.trim()) return setResults([])
    try {
      if (Platform.OS !== 'web') {
        const r = await fetch(`https://api.deezer.com/search/artist?q=${encodeURIComponent(term)}&limit=15`)
        const d = await r.json()
        setResults((d.data ?? []).map((a: any) => ({ ...a, _source: 'deezer' })))
      } else {
        const r = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=musicArtist&country=FR&limit=15`)
        const d = await r.json()
        setResults((d.results ?? []).map((a: any) => ({
          id: a.artistId, name: a.artistName,
          picture_medium: null, nb_fan: null, _source: 'itunes',
        })))
      }
    } catch { setResults([]) }
  }

  const searchSongs = async (term: string) => {
    if (!term.trim()) return setResults([])
    try {
      const r = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&country=FR&limit=15`)
      const d = await r.json()
      setResults(d.results ?? [])
    } catch { setResults([]) }
  }

  /* ── Toggle ── */
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
    const id = track.trackId
    const ex = selectedSongs.find((s) => s.itunes_track_id === id)
    if (ex) {
      setSongs(selectedSongs.filter((s) => s.itunes_track_id !== id))
    } else if (selectedSongs.length < 5) {
      setSongs([...selectedSongs, {
        itunes_track_id: id,
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
      const rem = step === 'styles'  ? 2 - selectedStyles.length
                : step === 'artists' ? 3 - selectedArtists.length
                : 5 - selectedSongs.length
      const noun = step === 'songs'   ? `chanson${rem > 1 ? 's' : ''}`
                 : step === 'artists' ? `artiste${rem > 1 ? 's' : ''}`
                 : `style${rem > 1 ? 's' : ''}`
      return `Encore ${rem} ${noun}`
    }
    return step === 'songs' ? 'Valider' : 'Suivant →'
  }

  /* ── Render artiste ── */
  const renderArtist = (item: any, onPress: () => void) => {
    const sel      = selectedArtists.includes(item.name)
    const hasPhoto = item.picture_medium && !item.picture_medium.includes('//250x250')
    const fans = item.nb_fan
      ? item.nb_fan >= 1_000_000 ? `${(item.nb_fan / 1_000_000).toFixed(1)}M fans`
      : item.nb_fan >= 1_000     ? `${Math.round(item.nb_fan / 1_000)}K fans`
      : `${item.nb_fan} fans`
      : null
    return (
      <Pressable key={item.id ?? item.name} style={[styles.resultRow, sel && styles.resultRowActive]} onPress={onPress}>
        <View style={styles.artistWrap}>
          {hasPhoto ? (
            <Image source={{ uri: item.picture_medium }} style={styles.artistPhoto} contentFit="cover" />
          ) : (
            <LinearGradient
              colors={sel ? ['#FF6B9D', '#FF4757'] : ['#F3F4F6', '#E5E7EB']}
              style={styles.artistAvatar}>
              <Text style={[styles.artistInitial, sel && { color: Colors.white }]}>
                {item.name[0]?.toUpperCase()}
              </Text>
            </LinearGradient>
          )}
          {sel && (
            <View style={styles.artistBadge}>
              <Text style={styles.artistBadgeText}>✓</Text>
            </View>
          )}
        </View>
        <View style={styles.resultInfo}>
          <Text style={[styles.resultName, sel && styles.resultNameActive]} numberOfLines={1}>{item.name}</Text>
          {fans ? <Text style={styles.resultSub}>{fans}</Text> : null}
        </View>
        <View style={[styles.radioSmall, sel && styles.radioSmallActive]}>
          {sel && <View style={styles.radioDotSmall} />}
        </View>
      </Pressable>
    )
  }

  /* ── Render chanson ── */
  const renderSong = (item: any, onPress: () => void) => {
    const sel = selectedSongs.some((song) => song.itunes_track_id === item.trackId)
    return (
      <Pressable key={item.trackId} style={[styles.resultRow, sel && styles.resultRowActive]} onPress={onPress}>
        <View style={styles.coverWrap}>
          <Image source={{ uri: item.artworkUrl100 }} style={styles.cover} contentFit="cover" />
          {sel && (
            <View style={styles.coverCheck}>
              <Text style={styles.artistBadgeText}>✓</Text>
            </View>
          )}
        </View>
        <View style={styles.resultInfo}>
          <Text style={[styles.resultName, sel && styles.resultNameActive]} numberOfLines={1}>{item.trackName}</Text>
          <Text style={styles.resultSub} numberOfLines={1}>{item.artistName}</Text>
        </View>
        <View style={[styles.radioSmall, sel && styles.radioSmallActive]}>
          {sel && <View style={styles.radioDotSmall} />}
        </View>
      </Pressable>
    )
  }

  /* ── Barre de recherche ── */
  const SearchBar = ({ onChangeText }: { onChangeText: (t: string) => void; step: Step }) => (
    <View style={[styles.searchOuter, focused && styles.searchOuterFocused]}>
      {focused && (
        <LinearGradient
          colors={['#FF6B9D', '#FF4757']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={styles.searchGradientBorder}
        />
      )}
      <View style={styles.searchInner}>
        {/* Loupe dessinée */}
        <View style={styles.lupeWrap}>
          <View style={styles.lupeCircle} />
          <View style={[styles.lupeHandle, focused && styles.lupeHandleFocused]} />
        </View>
        <TextInput
          style={[styles.searchInput, Platform.OS === 'web' && { outlineStyle: 'none' as any }]}
          value={search}
          onChangeText={(t) => { setSearch(t); onChangeText(t) }}
          placeholder={currentConf.placeholder}
          placeholderTextColor={focused ? '#FFACC7' : Colors.gray[300]}
          autoFocus
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {search.length > 0 && (
          <Pressable style={styles.clearBtn} onPress={() => { setSearch(''); setResults([]) }}>
            <Text style={styles.clearBtnText}>✕</Text>
          </Pressable>
        )}
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <LinearGradient colors={['#FF6B9D', '#FF4757']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <SafeAreaView>
          <OnboardingProgress step={2} total={5} light />
          <View style={styles.headerMeta}>
            <Text style={styles.headerTitle}>Tes goûts musicaux</Text>
            <View style={styles.tabs}>
              {STEP_CONFIG.map((s, i) => (
                <View key={s.key} style={[styles.tab, stepIndex >= i && styles.tabActive]}>
                  <Text style={[styles.tabText, stepIndex >= i && styles.tabTextActive]}>{s.label}</Text>
                  {stepIndex > i && <View style={styles.tabCheck}><Text style={styles.tabCheckText}>✓</Text></View>}
                </View>
              ))}
            </View>
            <Text style={styles.headerCount}>{countText()} sélectionné{step === 'songs' ? 'es' : 's'}</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* ── STYLES ── */}
      {step === 'styles' && (
        <Animated.View style={[styles.flex, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.styleGrid}>
            {STYLE_ROWS.map((row, ri) => (
              <View key={ri} style={styles.styleRow}>
                {row.map((item) => {
                  const active = selectedStyles.includes(item)
                  const isLong = item === 'Variété française'
                  return (
                    <Pressable
                      key={item}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => toggleStyle(item)}>
                      {active && (
                        <LinearGradient
                          colors={['#FF6B9D', '#FF4757']}
                          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                          style={StyleSheet.absoluteFill}
                        />
                      )}
                      {isLong ? (
                        <View style={styles.chipMultiLine}>
                          <Text style={[styles.chipText, active && styles.chipTextActive]}>Variété</Text>
                          <Text style={[styles.chipText, active && styles.chipTextActive]}>française</Text>
                        </View>
                      ) : (
                        <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
                          {item}
                        </Text>
                      )}
                    </Pressable>
                  )
                })}
                {row.length < 3 && Array(3 - row.length).fill(null).map((_, i) => (
                  <View key={`empty-${i}`} style={styles.chipPlaceholder} />
                ))}
              </View>
            ))}
          </View>
        </Animated.View>
      )}

      {/* ── ARTISTES ── */}
      {step === 'artists' && (
        <Animated.View style={[styles.flex, { transform: [{ translateY: slideAnim }] }]}>
          {/* Barre de recherche */}
          <SearchBar onChangeText={searchArtists} step="artists" />

          {/* Tags sélectionnés */}
          {selectedArtists.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsBand} contentContainerStyle={styles.tagsBandContent}>
              {selectedArtists.map((a) => (
                <Pressable key={a} style={styles.tag} onPress={() => toggleArtist(a)}>
                  <Text style={styles.tagText}>{a}</Text>
                  <Text style={styles.tagX}>✕</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          <FlatList
            data={search.length > 0 ? results : trending.artists}
            keyExtractor={(i) => i.id?.toString() ?? i.name}
            ListHeaderComponent={
              search.length === 0 && trending.artists.length > 0
                ? <View style={styles.sectionHeader}>
                    <View style={styles.sectionDot} />
                    <Text style={styles.sectionTitle}>Tendances du moment</Text>
                  </View>
                : null
            }
            renderItem={({ item }) => renderArtist(item, () => toggleArtist(item.name))}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {search.length > 0 ? 'Aucun résultat' : 'Tape le nom d\'un artiste'}
              </Text>
            }
          />
        </Animated.View>
      )}

      {/* ── CHANSONS ── */}
      {step === 'songs' && (
        <Animated.View style={[styles.flex, { transform: [{ translateY: slideAnim }] }]}>
          {/* Barre de recherche */}
          <SearchBar onChangeText={searchSongs} step="songs" />

          {/* Chansons sélectionnées */}
          {selectedSongs.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsBand} contentContainerStyle={styles.tagsBandContent}>
              {selectedSongs.map((s) => (
                <Pressable key={s.itunes_track_id} style={styles.songPill} onPress={() => toggleSong({ trackId: s.itunes_track_id })}>
                  <Image source={{ uri: s.album_cover_url }} style={styles.songPillCover} contentFit="cover" />
                  <Text style={styles.songPillText} numberOfLines={1}>{s.title}</Text>
                  <Text style={styles.tagX}>✕</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          <FlatList
            data={search.length > 0 ? results : trending.songs}
            keyExtractor={(i) => i.trackId?.toString()}
            ListHeaderComponent={
              search.length === 0 && trending.songs.length > 0
                ? <View style={styles.sectionHeader}>
                    <View style={styles.sectionDot} />
                    <Text style={styles.sectionTitle}>Top 5 en France</Text>
                  </View>
                : null
            }
            renderItem={({ item }) => renderSong(item, () => toggleSong(item))}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {search.length > 0 ? 'Aucun résultat' : 'Tape le titre d\'une chanson'}
              </Text>
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

  /* ── Header ── */
  header: { paddingBottom: Spacing.base },
  headerMeta: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.sm, gap: Spacing.xs },
  headerTitle: { fontSize: Typography.xl, fontWeight: '800', color: Colors.white, textAlign: 'center' },
  tabs: { flexDirection: 'row', gap: Spacing.xs },
  tab: { flex: 1, paddingVertical: 6, alignItems: 'center', borderRadius: BorderRadius.full, backgroundColor: 'rgba(255,255,255,0.2)', flexDirection: 'row', justifyContent: 'center', gap: 4 },
  tabActive: { backgroundColor: Colors.white },
  tabText: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  tabTextActive: { color: Colors.love.secondary },
  tabCheck: { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.love.primary, alignItems: 'center', justifyContent: 'center' },
  tabCheckText: { fontSize: 9, color: Colors.white, fontWeight: '800' },
  headerCount: { fontSize: 12, color: 'rgba(255,255,255,0.8)', textAlign: 'center', fontWeight: '600' },

  /* ── Grille styles (remplit l'écran) ── */
  styleGrid: {
    flex: 1,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    gap: 8,
    justifyContent: 'center',
  },
  styleRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 44,
    maxHeight: 60,
  },
  chip: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 6,
    ...Shadow.sm,
  },
  chipActive: { borderColor: Colors.love.primary },
  chipText: { fontSize: 13, fontWeight: '700', textAlign: 'center', color: Colors.gray[600] },
  chipTextActive: { color: Colors.white, fontWeight: '800' },
  chipMultiLine: { alignItems: 'center', justifyContent: 'center', gap: 1 },
  chipPlaceholder: { flex: 1 },

  /* ── Barre de recherche ── */
  searchOuter: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.base,
    marginBottom: Spacing.xs,
    borderRadius: BorderRadius.xl,
    padding: 2,
    backgroundColor: Colors.gray[200],
    ...Shadow.sm,
  },
  searchOuterFocused: {
    backgroundColor: 'transparent',
    ...Shadow.md,
  },
  searchGradientBorder: {
    ...StyleSheet.absoluteFill,
    borderRadius: BorderRadius.xl,
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: BorderRadius.xl - 2,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  lupeWrap: { width: 20, height: 20, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  lupeCircle: {
    width: 13, height: 13, borderRadius: 7,
    borderWidth: 2, borderColor: Colors.gray[400],
    position: 'absolute', top: 0, left: 0,
  },
  lupeHandle: {
    width: 2, height: 7, borderRadius: 1,
    backgroundColor: Colors.gray[400],
    position: 'absolute', bottom: 0, right: 1,
    transform: [{ rotate: '-45deg' }],
  },
  lupeHandleFocused: { backgroundColor: Colors.love.primary },
  searchInput: { flex: 1, fontSize: Typography.base, color: Colors.black, fontWeight: '500' },
  clearBtn: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.gray[200],
    alignItems: 'center', justifyContent: 'center',
  },
  clearBtnText: { fontSize: 10, color: Colors.gray[600], fontWeight: '800' },

  /* ── Section header (Tendances) ── */
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, gap: Spacing.xs,
  },
  sectionDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.love.primary,
  },
  sectionTitle: { fontSize: Typography.sm, fontWeight: '800', color: Colors.gray[700] },

  /* ── Tags sélectionnés ── */
  tagsBand: { maxHeight: 44, marginBottom: 4 },
  tagsBandContent: { paddingHorizontal: Spacing.base, gap: Spacing.xs, alignItems: 'center' },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.love.light, borderRadius: BorderRadius.full, paddingHorizontal: Spacing.sm, paddingVertical: 5, borderWidth: 1.5, borderColor: Colors.love.primary },
  tagText: { fontSize: 12, color: Colors.love.secondary, fontWeight: '700' },
  tagX: { fontSize: 9, color: Colors.love.secondary, fontWeight: '800' },

  /* ── Pill chansons ── */
  songPill: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, backgroundColor: Colors.love.light, borderRadius: BorderRadius.md, padding: 4, borderWidth: 1.5, borderColor: Colors.love.primary, maxWidth: 150 },
  songPillCover: { width: 32, height: 32, borderRadius: BorderRadius.sm },
  songPillText: { fontSize: 11, color: Colors.love.secondary, fontWeight: '600', flex: 1 },

  /* ── Résultats ── */
  resultRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingVertical: 11,
    borderBottomWidth: 1, borderBottomColor: Colors.gray[100], gap: Spacing.sm,
  },
  resultRowActive: { backgroundColor: Colors.love.light },

  /* Artiste */
  artistWrap: { width: 50, height: 50, borderRadius: 25, position: 'relative', ...Shadow.sm },
  artistPhoto: { width: 50, height: 50, borderRadius: 25 },
  artistAvatar: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  artistInitial: { fontSize: Typography.md, fontWeight: '800', color: Colors.gray[600] },
  artistBadge: {
    position: 'absolute', bottom: -1, right: -1,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: Colors.love.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.white,
  },
  artistBadgeText: { fontSize: 9, color: Colors.white, fontWeight: '900' },

  /* Chanson */
  coverWrap: { width: 50, height: 50, borderRadius: BorderRadius.md, position: 'relative', overflow: 'hidden', ...Shadow.sm },
  cover: { width: 50, height: 50, borderRadius: BorderRadius.md },
  coverCheck: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255,75,87,0.6)',
    alignItems: 'center', justifyContent: 'center',
  },

  resultInfo: { flex: 1 },
  resultName: { fontSize: Typography.sm, fontWeight: '700', color: Colors.black },
  resultNameActive: { color: Colors.love.secondary },
  resultSub: { fontSize: 11, color: Colors.gray[400], marginTop: 2 },

  /* Radio */
  radioSmall: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.gray[300], alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white },
  radioSmallActive: { borderColor: Colors.love.primary, backgroundColor: Colors.love.light },
  radioDotSmall: { width: 9, height: 9, borderRadius: 5, backgroundColor: Colors.love.primary },

  emptyText: { textAlign: 'center', color: Colors.gray[300], fontSize: Typography.sm, marginTop: Spacing.xl },

  /* ── Footer ── */
  footer: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xl, paddingTop: Spacing.sm },
  btn: { borderRadius: BorderRadius.full, overflow: 'hidden', ...Shadow.md },
  btnOff: {},
  btnGradient: { paddingVertical: 18, alignItems: 'center' },
  btnText: { fontSize: Typography.md, fontWeight: '800', color: Colors.white, letterSpacing: 0.3 },
})
