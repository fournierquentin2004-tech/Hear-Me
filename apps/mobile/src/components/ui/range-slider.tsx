import { useRef } from 'react'
import { View, Text, StyleSheet, PanResponder, Animated } from 'react-native'
import { Colors, BorderRadius, Spacing } from '@/constants/theme'

type Props = {
  min: number
  max: number
  low: number
  high: number
  step?: number
  unit?: string
  color?: string
  onValueChange: (low: number, high: number) => void
}

const THUMB_SIZE = 28

export function RangeSlider({ min, max, low, high, step = 1, unit = '', color = Colors.love.primary, onValueChange }: Props) {
  const trackWidth = useRef(0)

  const toPercent = (val: number) => (val - min) / (max - min)
  const toValue = (pct: number) => {
    const raw = pct * (max - min) + min
    const stepped = Math.round(raw / step) * step
    return Math.max(min, Math.min(max, stepped))
  }

  const lowPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gs) => {
        if (!trackWidth.current) return
        const pct = Math.max(0, Math.min(1, (gs.moveX - gs.x0) / trackWidth.current + toPercent(low)))
        const newLow = toValue(pct)
        if (newLow < high) onValueChange(newLow, high)
      },
    })
  ).current

  const highPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gs) => {
        if (!trackWidth.current) return
        const pct = Math.max(0, Math.min(1, (gs.moveX - gs.x0) / trackWidth.current + toPercent(high)))
        const newHigh = toValue(pct)
        if (newHigh > low) onValueChange(low, newHigh)
      },
    })
  ).current

  const lowPct = toPercent(low)
  const highPct = toPercent(high)

  // Derive light background from color (20% opacity white overlay trick via hex)
  const lightBg = color + '18'

  return (
    <View style={styles.container}>
      {/* Value labels */}
      <View style={styles.labels}>
        <View style={[styles.valueBox, { borderColor: color, backgroundColor: lightBg }]}>
          <Text style={[styles.valueText, { color }]}>{low}{unit}</Text>
        </View>
        <View style={styles.valueSep}>
          <Text style={styles.valueSepText}>–</Text>
        </View>
        <View style={[styles.valueBox, { borderColor: color, backgroundColor: lightBg }]}>
          <Text style={[styles.valueText, { color }]}>{high}{unit}</Text>
        </View>
      </View>

      {/* Track */}
      <View
        style={styles.trackContainer}
        onLayout={(e) => { trackWidth.current = e.nativeEvent.layout.width }}>
        <View style={styles.track} />

        {/* Active segment */}
        <View
          style={[
            styles.trackActive,
            {
              left: `${lowPct * 100}%` as any,
              right: `${(1 - highPct) * 100}%` as any,
              backgroundColor: color,
            },
          ]}
        />

        {/* Low thumb */}
        <Animated.View
          style={[
            styles.thumb,
            {
              left: `${lowPct * 100}%` as any,
              borderColor: color,
              shadowColor: color,
            },
          ]}
          {...lowPanResponder.panHandlers}>
          <View style={[styles.thumbInner, { backgroundColor: color }]} />
        </Animated.View>

        {/* High thumb */}
        <Animated.View
          style={[
            styles.thumb,
            {
              left: `${highPct * 100}%` as any,
              borderColor: color,
              shadowColor: color,
            },
          ]}
          {...highPanResponder.panHandlers}>
          <View style={[styles.thumbInner, { backgroundColor: color }]} />
        </Animated.View>
      </View>

      {/* Min / Max hint */}
      <View style={styles.minMaxRow}>
        <Text style={styles.minMaxText}>{min}{unit}</Text>
        <Text style={styles.minMaxText}>{max}{unit}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { paddingVertical: Spacing.sm, gap: Spacing.base },
  labels: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  valueBox: {
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
    borderWidth: 1.5,
    minWidth: 68,
    alignItems: 'center',
  },
  valueText: {
    fontSize: 16,
    fontWeight: '700',
  },
  valueSep: { paddingHorizontal: Spacing.xs },
  valueSepText: { fontSize: 16, color: Colors.gray[400], fontWeight: '600' },
  trackContainer: {
    height: THUMB_SIZE,
    justifyContent: 'center',
    marginHorizontal: THUMB_SIZE / 2,
  },
  track: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.gray[200],
  },
  trackActive: {
    position: 'absolute',
    height: 5,
    borderRadius: 3,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: Colors.white,
    borderWidth: 2.5,
    marginLeft: -THUMB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 5,
  },
  thumbInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  minMaxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  minMaxText: {
    fontSize: 11,
    color: Colors.gray[400],
  },
})
