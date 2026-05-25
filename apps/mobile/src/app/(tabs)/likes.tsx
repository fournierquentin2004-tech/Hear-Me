import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors, Typography, Spacing } from '@/constants/theme'

export default function LikesScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF6B9D', '#FF4757']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Ils t'ont liké</Text>
            <Text style={styles.headerSub}>Découvre qui s'intéresse à toi</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.empty}>
        <View style={styles.emptyIcon}>
          <View style={styles.emptyHeart} />
        </View>
        <Text style={styles.emptyTitle}>Pas encore de likes</Text>
        <Text style={styles.emptySub}>Continue à swiper pour attirer l'attention !</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { paddingBottom: Spacing.xl },
  headerContent: { alignItems: 'center', paddingHorizontal: Spacing.base, paddingTop: Spacing.sm, paddingBottom: Spacing.sm, gap: 4 },
  headerTitle: { fontSize: Typography.xl, fontWeight: '800', color: Colors.white },
  headerSub: { fontSize: Typography.sm, color: 'rgba(255,255,255,0.85)' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.base, paddingHorizontal: Spacing.xl },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.love.light, alignItems: 'center', justifyContent: 'center' },
  emptyHeart: { width: 36, height: 36, backgroundColor: Colors.love.primary, borderRadius: 18 },
  emptyTitle: { fontSize: Typography.lg, fontWeight: '800', color: Colors.black },
  emptySub: { fontSize: Typography.sm, color: Colors.gray[400], textAlign: 'center' },
})
