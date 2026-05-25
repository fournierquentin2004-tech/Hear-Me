import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors, Typography, Spacing } from '@/constants/theme'

export default function EventsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Événements</Text>
        <Text style={styles.subtitle}>Concerts & festivals près de toi 🎶</Text>
      </View>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderEmoji}>🎸</Text>
        <Text style={styles.placeholderText}>Les événements arrivent bientôt</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  header: { paddingHorizontal: Spacing.base, paddingTop: Spacing.base, gap: Spacing.xs },
  title: { fontSize: Typography['2xl'], fontWeight: '800', color: Colors.black },
  subtitle: { fontSize: Typography.sm, color: Colors.gray[500] },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.base },
  placeholderEmoji: { fontSize: 64 },
  placeholderText: { fontSize: Typography.base, color: Colors.gray[400] },
})
