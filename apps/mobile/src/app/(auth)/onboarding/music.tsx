import { useState, useRef, useEffect } from 'react'
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  TextInput, FlatList, Animated, Platform,
} from 'react-native'
import { createAudioPlayer, AudioPlayer } from 'expo-audio'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Image } from 'expo-image'
import { Colors, Typography, Spacing, BorderRadius, Shadow, nativeDriver } from '@/constants/theme'
import { MUSIC_STYLES } from '@/constants/music-styles'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { OnboardingProgress } from '@/components/ui/onboarding-progress'
import { Song } from '@/types/user.types'

type Step = 'styles' | 'artists' | 'songs'

const STEP_CONFIG = [
  { key: 'styles'  as Step, label: 'Styles',   max: 2, placeholder: 'Recherche un style...'    },
  { key: 'artists' as Step, label: 'Artistes',  max: 3, placeholder: 'Recherche un artiste...' },
  { key: 'songs'   as Step, label: 'Musiques',  max: 5, placeholder: 'Titre ou artiste...'     },
]

// Grille styles → rangées de 3
const STYLE_ROWS: string[][] = []
for (let i = 0; i < MUSIC_STYLES.length; i += 3) {
  STYLE_ROWS.push([...MUSIC_STYLES].slice(i, i + 3))
}

// Deezer chart genre IDs → classification éditoriale stricte (pas de text search)
// Gazo sera dans le chart 116 (Hip-Hop), jamais dans 132 (Pop) ou 106 (Électro)
const STYLE_TO_GENRE_ID: Record<string, number> = {
  'Pop':               132,
  'Hip-Hop':           116,
  'Rap':               116,
  'R&B':               165,
  'Électro':           106,
  'Rock':              152,
  'Variété française': 153,
  'House':             113,
  'Metal':             464,
}

// Styles sans chart Deezer fiable → fallback keyword search
const STYLE_TO_SEARCH_KEYWORD: Record<string, string> = {
  'Afrobeats':  'afrobeats',
  'Reggaeton':  'reggaeton',
  'K-Pop':      'kpop',
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
  const [playingId, setPlayingId]     = useState<number | null>(null)

  const slideAnim = useRef(new Animated.Value(0)).current
  const soundRef  = useRef<AudioPlayer | null>(null)

  const stepIndex   = STEP_CONFIG.findIndex((s) => s.key === step)
  const currentConf = STEP_CONFIG[stepIndex]

  const animateIn = () => {
    slideAnim.setValue(30)
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: nativeDriver, damping: 18 }).start()
  }

  /* ── Nettoyage audio au démontage ── */
  useEffect(() => {
    return () => { soundRef.current?.remove() }
  }, [])

  /* ── Chargement des tendances (artistes + musiques) d'un coup ── */
  useEffect(() => {
    if (step === 'artists') loadTrending()
  }, [step])

  // Passe par un proxy CORS sur web (Deezer bloque fetch() depuis les navigateurs)
  const deezer = async (path: string) => {
    const url = `https://api.deezer.com/${path}`
    const proxied = `https://corsproxy.io/?url=${encodeURIComponent(url)}`
    const r = await fetch(Platform.OS === 'web' ? proxied : url)
    return r.json()
  }

  // Stratégie : 1 appel par style → 50 top tracks du genre
  // Musiques  : top 5 triés par rank (streams), avec deux gardes-fous :
  //   • max ceil(5/nbStyles) par style → chaque style est représenté
  //   • max 3 par artiste → un artiste ne monopolise pas
  //   Les 5 retenus sont triés par rank → ordre naturel streams, pas groupage par style
  // Artistes  : scoring par nb d'apparitions dans les 50 tracks
  const loadTrending = async () => {
    const uniqueStyles = [...new Set(selectedStyles)]
    const allTracks:  any[]             = []
    const trackStyle = new Map<number, string>()  // trackId → style d'origine (1ère occurrence)

    for (const style of uniqueStyles) {
      const genreId = STYLE_TO_GENRE_ID[style]
      const keyword = STYLE_TO_SEARCH_KEYWORD[style]

      try {
        let tracks: any[] = []
        if (genreId) {
          // Chart éditorial Deezer → classification stricte par genre
          const d = await deezer(`chart/${genreId}/tracks?limit=50`)
          tracks = d.data ?? []
        } else if (keyword) {
          // Fallback keyword pour K-Pop, Afrobeats, Reggaeton
          const d = await deezer(`search?q=${encodeURIComponent(keyword)}&type=track&order=RANKING&limit=50`)
          tracks = d.data ?? []
        }
        for (const track of tracks) {
          allTracks.push(track)
          if (track.id && !trackStyle.has(track.id)) trackStyle.set(track.id, style)
        }
      } catch {}
    }

    // ── Musiques : top 5 par rank, cap par style + cap par artiste ──
    // Le cap se calcule sur le nombre de SOURCES UNIQUES (pas de styles) :
    // Rap + Hip-Hop partagent le même genre ID → 1 source → cap 5
    // Pop + Rap → 2 sources différentes → cap 3
    const sourceKey = (style: string) =>
      STYLE_TO_GENRE_ID[style] != null
        ? `genre:${STYLE_TO_GENRE_ID[style]}`
        : `kw:${STYLE_TO_SEARCH_KEYWORD[style] ?? style}`
    const uniqueSources   = new Set(uniqueStyles.map(sourceKey)).size
    const maxPerStyle     = Math.ceil(5 / uniqueSources)
    const seenS       = new Set<number>()
    const artistHits  = new Map<number, number>()
    const styleHits   = new Map<string,  number>()
    const songs: any[] = []

    for (const t of [...allTracks].sort((a, b) => (b.rank ?? 0) - (a.rank ?? 0))) {
      if (!t.id || !t.title)  continue
      if (seenS.has(t.id))    continue
      const artistId = t.artist?.id
      const style    = trackStyle.get(t.id) ?? ''
      if (artistId && (artistHits.get(artistId) ?? 0) >= 3)         continue
      if (style    && (styleHits.get(style)     ?? 0) >= maxPerStyle) continue

      seenS.add(t.id)
      if (artistId) artistHits.set(artistId, (artistHits.get(artistId) ?? 0) + 1)
      if (style)    styleHits.set(style,     (styleHits.get(style)     ?? 0) + 1)

      songs.push({
        trackId:        t.id,
        trackName:      t.title,
        artistName:     t.artist?.name       ?? '',
        artworkUrl100:  t.album?.cover_medium ?? '',
        previewUrl:     t.preview            ?? null,
        collectionName: t.album?.title       ?? '',
      })
      if (songs.length >= 5) break
    }

    // ── Artistes : score = nb de tracks dans les 50 → plus un artiste domine le genre,
    //    plus son score est élevé. Complètement indépendant du top 5 musiques.
    const artistScore = new Map<number, { info: any; score: number }>()
    for (const track of allTracks) {
      if (!track.artist?.id) continue
      const entry = artistScore.get(track.artist.id)
      if (entry) {
        entry.score += 1
      } else {
        artistScore.set(track.artist.id, {
          info: {
            id:             track.artist.id,
            name:           track.artist.name,
            picture_medium: track.artist.picture_medium ?? null,
            nb_fan:         null,
          },
          score: 1,
        })
      }
    }

    const artists = [...artistScore.values()]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(v => v.info)

    setTrending({ artists, songs })
  }

  /* ── Preview 30s ── */
  const togglePreview = (trackId: number, previewUrl: string | null) => {
    if (!previewUrl) return

    // Même morceau → stop
    if (playingId === trackId) {
      soundRef.current?.remove()
      soundRef.current = null
      setPlayingId(null)
      return
    }

    // Nouveau morceau → arrête le précédent
    soundRef.current?.remove()
    soundRef.current = null
    setPlayingId(null)

    try {
      const player = createAudioPlayer({ uri: previewUrl })
      player.play()
      soundRef.current = player
      setPlayingId(trackId)

      // Auto-stop après 30 secondes (durée max preview Deezer)
      setTimeout(() => {
        if (soundRef.current === player) {
          player.remove()
          soundRef.current = null
          setPlayingId(null)
        }
      }, 30_000)
    } catch {}
  }

  /* ── Retour en arrière entre étapes ── */
  const goBack = () => {
    stopAudio()
    if (step === 'songs') {
      setSearch(''); setResults([]); animateIn(); setStep('artists')
    } else if (step === 'artists') {
      setSearch(''); setResults([])
      setTrending({ artists: [], songs: [] }) // reset pour recharger si styles changent
      animateIn(); setStep('styles')
    } else {
      router.canGoBack() ? router.back() : router.replace('/(auth)/onboarding/profile' as any)
    }
  }

  /* ── Recherches ── */
  const searchArtists = async (term: string) => {
    if (!term.trim()) return setResults([])
    try {
      const d = await deezer(`search/artist?q=${encodeURIComponent(term)}&limit=15`)
      setResults((d.data ?? []).map((a: any) => ({ ...a, _source: 'deezer' })))
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

  const stopAudio = () => {
    soundRef.current?.remove()
    soundRef.current = null
    setPlayingId(null)
  }

  const handleNext = () => {
    stopAudio()
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
      const noun = step === 'songs'   ? `musique${rem > 1 ? 's' : ''}`
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
    const sel       = selectedSongs.some((song) => song.itunes_track_id === item.trackId)
    const isPlaying = playingId === item.trackId
    return (
      <Pressable key={item.trackId} style={[styles.resultRow, sel && styles.resultRowActive]} onPress={onPress}>
        {/* Pochette cliquable pour la preview */}
        <Pressable style={styles.coverWrap} onPress={() => togglePreview(item.trackId, item.previewUrl)}>
          <Image source={{ uri: item.artworkUrl100 }} style={styles.cover} contentFit="cover" />
          {sel && !isPlaying && (
            <View style={styles.coverCheck}>
              <Text style={styles.artistBadgeText}>✓</Text>
            </View>
          )}
          {isPlaying && (
            <View style={styles.coverPlaying}>
              <Text style={styles.coverPlayingIcon}>▐▐</Text>
            </View>
          )}
          {!sel && !isPlaying && item.previewUrl && (
            <View style={styles.coverPlayHint}>
              <Text style={styles.coverPlayHintIcon}>▶</Text>
            </View>
          )}
        </Pressable>
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

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <LinearGradient colors={['#FF6B9D', '#FF4757']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <SafeAreaView>
          <OnboardingProgress step={2} total={5} light onBack={goBack} />
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
            <Text style={styles.headerCount}>{countText()} sélectionné{step === 'styles' ? 's' : step === 'artists' ? 's' : 'es'}</Text>
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
          {/* Barre de recherche — artistes */}
          <View style={styles.searchWrapper}>
            <View style={[styles.searchOuter, focused && styles.searchOuterFocused]}>
              {focused && (
                <LinearGradient colors={['#FF6B9D', '#FF4757']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.searchGradientBorder} />
              )}
              <View style={styles.searchInner}>
                <View style={styles.lupeWrap}>
                  <View style={styles.lupeCircle} />
                  <View style={[styles.lupeHandle, focused && styles.lupeHandleFocused]} />
                </View>
                <TextInput
                  style={[styles.searchInput, Platform.OS === 'web' && { outlineStyle: 'none' as any }]}
                  value={search}
                  onChangeText={(t) => { setSearch(t); searchArtists(t) }}
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
            <Text style={styles.searchHint}>Recherche libre · tous les artistes Deezer</Text>
          </View>

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
                    <Text style={styles.sectionTitle}>Top 5 · {selectedStyles.join(' & ')}</Text>
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
          {/* Barre de recherche — musiques */}
          <View style={styles.searchWrapper}>
            <View style={[styles.searchOuter, focused && styles.searchOuterFocused]}>
              {focused && (
                <LinearGradient colors={['#FF6B9D', '#FF4757']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.searchGradientBorder} />
              )}
              <View style={styles.searchInner}>
                <View style={styles.lupeWrap}>
                  <View style={styles.lupeCircle} />
                  <View style={[styles.lupeHandle, focused && styles.lupeHandleFocused]} />
                </View>
                <TextInput
                  style={[styles.searchInput, Platform.OS === 'web' && { outlineStyle: 'none' as any }]}
                  value={search}
                  onChangeText={(t) => { setSearch(t); searchSongs(t) }}
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
            <Text style={styles.searchHint}>Recherche libre · toutes les musiques iTunes</Text>
          </View>

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
                    <Text style={styles.sectionTitle}>Top 5 · {selectedStyles.join(' & ')}</Text>
                  </View>
                : null
            }
            renderItem={({ item }) => renderSong(item, () => toggleSong(item))}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {search.length > 0 ? 'Aucun résultat' : 'Tape le titre d\'une musique'}
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
    borderColor: Colors.gray[200],
    backgroundColor: Colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 6,
    ...Shadow.sm,
  },
  chipActive: { borderColor: Colors.love.primary, backgroundColor: 'transparent' },
  chipText: { fontSize: 13, fontWeight: '700', textAlign: 'center', color: Colors.gray[600] },
  chipTextActive: { color: Colors.white, fontWeight: '800' },
  chipMultiLine: { alignItems: 'center', justifyContent: 'center', gap: 1 },
  chipPlaceholder: { flex: 1 },

  /* ── Barre de recherche ── */
  searchWrapper: { marginBottom: Spacing.xs },
  searchHint: {
    fontSize: 11, color: Colors.gray[300], textAlign: 'center',
    marginTop: 5, fontStyle: 'italic',
  },
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
  // fontSize ≥ 16 sur iOS pour désactiver l'auto-zoom au focus
  searchInput: { flex: 1, fontSize: Platform.OS === 'ios' ? 16 : Typography.base, color: Colors.black, fontWeight: '500' },
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
  coverPlaying: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255,75,87,0.75)',
    alignItems: 'center', justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },
  coverPlayingIcon: { fontSize: 11, color: Colors.white, fontWeight: '800', letterSpacing: 2 },
  coverPlayHint: {
    position: 'absolute', bottom: 3, right: 3,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },
  coverPlayHintIcon: { fontSize: 7, color: Colors.white, fontWeight: '800', marginLeft: 1 },

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
