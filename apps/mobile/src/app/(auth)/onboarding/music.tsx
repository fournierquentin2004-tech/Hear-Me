import { useState } from 'react'
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, FlatList } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme'
import { MUSIC_STYLES } from '@/constants/music-styles'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { OnboardingProgress } from '@/components/ui/onboarding-progress'
import { Song } from '@/types/user.types'

type Step = 'styles' | 'artists' | 'songs'

export default function OnboardingMusicScreen() {
  const router = useRouter()
  const { setMusic } = useOnboardingStore()

  const [step, setStep] = useState<Step>('styles')
  const [selectedStyles, setStyles] = useState<string[]>([])
  const [selectedArtists, setArtists] = useState<string[]>([])
  const [selectedSongs, setSongs] = useState<Song[]>([])
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<any[]>([])

  const searchItunes = async (term: string, type: 'musicArtist' | 'song') => {
    if (!term.trim()) return setResults([])
    try {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=${type}&country=FR&limit=10`
      const res = await fetch(url)
      const data = await res.json()
      setResults(data.results ?? [])
    } catch {
      setResults([])
    }
  }

  const toggleStyle = (s: string) => {
    if (selectedStyles.includes(s)) {
      setStyles(selectedStyles.filter((x) => x !== s))
    } else if (selectedStyles.length < 2) {
      setStyles([...selectedStyles, s])
    }
  }

  const toggleArtist = (name: string) => {
    if (selectedArtists.includes(name)) {
      setArtists(selectedArtists.filter((a) => a !== name))
    } else if (selectedArtists.length < 3) {
      setArtists([...selectedArtists, name])
    }
  }

  const toggleSong = (track: any) => {
    const existing = selectedSongs.find((s) => s.itunes_track_id === track.trackId)
    if (existing) {
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
    if (step === 'styles') return selectedStyles.length === 2
    if (step === 'artists') return selectedArtists.length === 3
    return selectedSongs.length === 5
  }

  const handleNext = () => {
    if (step === 'styles') { setSearch(''); setResults([]); return setStep('artists') }
    if (step === 'artists') { setSearch(''); setResults([]); return setStep('songs') }
    setMusic({
      styles: selectedStyles as [string, string],
      artists: selectedArtists as [string, string, string],
      songs: selectedSongs,
    })
    router.push('/(auth)/onboarding/connection')
  }

  const stepLabel = { styles: 'Tes styles', artists: 'Tes artistes', songs: 'Tes chansons' }[step]
  const stepHint = {
    styles: 'Choisis exactement 2 styles musicaux',
    artists: 'Choisis exactement 3 artistes',
    songs: 'Choisis exactement 5 chansons',
  }[step]

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingProgress step={2} total={5} />

      <Text style={styles.title}>Tes goûts musicaux 🎵</Text>
      <Text style={styles.subtitle}>{stepHint}</Text>

      {/* Sous-étapes */}
      <View style={styles.subSteps}>
        {(['styles', 'artists', 'songs'] as Step[]).map((s, i) => (
          <View key={s} style={[styles.subStep, step === s && styles.subStepActive]}>
            <Text style={[styles.subStepText, step === s && styles.subStepTextActive]}>
              {['Styles', 'Artistes', 'Chansons'][i]}
            </Text>
          </View>
        ))}
      </View>

      {/* Styles */}
      {step === 'styles' && (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.styleGrid}>
            {MUSIC_STYLES.map((s) => (
              <Pressable
                key={s}
                style={[styles.styleChip, selectedStyles.includes(s) && styles.styleChipActive]}
                onPress={() => toggleStyle(s)}>
                <Text style={[styles.styleText, selectedStyles.includes(s) && styles.styleTextActive]}>
                  {s}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Artistes */}
      {step === 'artists' && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={(t) => { setSearch(t); searchItunes(t, 'musicArtist') }}
            placeholder="Recherche un artiste..."
            placeholderTextColor={Colors.gray[400]}
          />
          {selectedArtists.length > 0 && (
            <View style={styles.selected}>
              {selectedArtists.map((a) => (
                <Pressable key={a} style={styles.tag} onPress={() => toggleArtist(a)}>
                  <Text style={styles.tagText}>{a} ✕</Text>
                </Pressable>
              ))}
            </View>
          )}
          <FlatList
            data={results}
            keyExtractor={(i) => i.artistId?.toString()}
            renderItem={({ item }) => (
              <Pressable
                style={[styles.resultItem, selectedArtists.includes(item.artistName) && styles.resultItemActive]}
                onPress={() => toggleArtist(item.artistName)}>
                <Text style={styles.resultText}>{item.artistName}</Text>
                <Text style={styles.resultSub}>{item.primaryGenreName}</Text>
              </Pressable>
            )}
          />
        </View>
      )}

      {/* Chansons */}
      {step === 'songs' && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={(t) => { setSearch(t); searchItunes(t, 'song') }}
            placeholder="Recherche une chanson..."
            placeholderTextColor={Colors.gray[400]}
          />
          {selectedSongs.length > 0 && (
            <ScrollView horizontal style={styles.selectedSongs} showsHorizontalScrollIndicator={false}>
              {selectedSongs.map((s) => (
                <Pressable key={s.itunes_track_id} style={styles.songTag} onPress={() => toggleSong({ trackId: s.itunes_track_id })}>
                  <Image source={{ uri: s.album_cover_url }} style={styles.songTagCover} />
                  <Text style={styles.songTagText} numberOfLines={1}>{s.title} ✕</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
          <FlatList
            data={results}
            keyExtractor={(i) => i.trackId?.toString()}
            renderItem={({ item }) => (
              <Pressable
                style={[styles.resultItem, selectedSongs.some((s) => s.itunes_track_id === item.trackId) && styles.resultItemActive]}
                onPress={() => toggleSong(item)}>
                <Image source={{ uri: item.artworkUrl100 }} style={styles.cover} />
                <View style={styles.resultInfo}>
                  <Text style={styles.resultText}>{item.trackName}</Text>
                  <Text style={styles.resultSub}>{item.artistName}</Text>
                </View>
              </Pressable>
            )}
          />
        </View>
      )}

      <View style={styles.footer}>
        <Pressable
          style={[styles.btn, !canContinue() && styles.btnDisabled]}
          onPress={handleNext}
          disabled={!canContinue()}>
          <Text style={styles.btnText}>
            {step === 'songs' ? 'Valider →' : 'Suivant →'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  title: { fontSize: Typography.xl, fontWeight: '800', color: Colors.black, paddingHorizontal: Spacing.base },
  subtitle: { fontSize: Typography.sm, color: Colors.gray[500], paddingHorizontal: Spacing.base, marginBottom: Spacing.base },
  subSteps: { flexDirection: 'row', paddingHorizontal: Spacing.base, gap: Spacing.sm, marginBottom: Spacing.base },
  subStep: { flex: 1, paddingVertical: Spacing.xs, alignItems: 'center', borderRadius: BorderRadius.full, backgroundColor: Colors.gray[100] },
  subStepActive: { backgroundColor: Colors.love.light },
  subStepText: { fontSize: 12, color: Colors.gray[500], fontWeight: '600' },
  subStepTextActive: { color: Colors.love.secondary },
  scroll: { flex: 1, paddingHorizontal: Spacing.base },
  styleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, paddingBottom: Spacing.xl },
  styleChip: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: Colors.gray[200], backgroundColor: Colors.gray[50] },
  styleChipActive: { borderColor: Colors.love.primary, backgroundColor: Colors.love.light },
  styleText: { fontSize: Typography.sm, color: Colors.gray[600], fontWeight: '500' },
  styleTextActive: { color: Colors.love.secondary, fontWeight: '700' },
  searchContainer: { flex: 1, paddingHorizontal: Spacing.base },
  searchInput: { borderWidth: 1.5, borderColor: Colors.gray[200], borderRadius: BorderRadius.md, paddingHorizontal: Spacing.base, height: 48, fontSize: Typography.base, color: Colors.black, marginBottom: Spacing.sm },
  selected: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.sm },
  tag: { backgroundColor: Colors.love.light, borderRadius: BorderRadius.full, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs },
  tagText: { fontSize: 12, color: Colors.love.secondary, fontWeight: '600' },
  selectedSongs: { maxHeight: 60, marginBottom: Spacing.sm },
  songTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.love.light, borderRadius: BorderRadius.md, padding: Spacing.xs, marginRight: Spacing.xs, gap: Spacing.xs, maxWidth: 140 },
  songTagCover: { width: 32, height: 32, borderRadius: 4 },
  songTagText: { fontSize: 11, color: Colors.love.secondary, fontWeight: '600', flex: 1 },
  resultItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.gray[100], gap: Spacing.sm },
  resultItemActive: { backgroundColor: Colors.love.light },
  cover: { width: 44, height: 44, borderRadius: BorderRadius.sm },
  resultInfo: { flex: 1 },
  resultText: { fontSize: Typography.sm, fontWeight: '600', color: Colors.black },
  resultSub: { fontSize: 12, color: Colors.gray[500] },
  footer: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.lg },
  btn: { backgroundColor: Colors.love.primary, borderRadius: BorderRadius.full, paddingVertical: Spacing.base, alignItems: 'center' },
  btnDisabled: { backgroundColor: Colors.gray[200] },
  btnText: { fontSize: Typography.md, fontWeight: '700', color: Colors.white },
})
