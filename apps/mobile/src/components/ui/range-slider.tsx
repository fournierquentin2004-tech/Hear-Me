import { useRef, useState } from 'react'
import {
  View, Text, StyleSheet, PanResponder,
  Animated, Pressable, TextInput, Platform,
} from 'react-native'
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

export function RangeSlider({
  min, max, low, high,
  step = 1, unit = '',
  color = Colors.love.primary,
  onValueChange,
}: Props) {
  const trackWidth = useRef(0)

  // ── Refs miroir — valeurs toujours fraîches dans les PanResponder ──
  const lowRef            = useRef(low)
  const highRef           = useRef(high)
  const minRef            = useRef(min)
  const maxRef            = useRef(max)
  const stepRef           = useRef(step)
  const onValueChangeRef  = useRef(onValueChange)
  lowRef.current           = low
  highRef.current          = high
  minRef.current           = min
  maxRef.current           = max
  stepRef.current          = step
  onValueChangeRef.current = onValueChange

  // Position de départ enregistrée à chaque nouveau touch (onPanResponderGrant)
  const lowStartPct  = useRef(0)
  const highStartPct = useRef(0)

  // ── Édition manuelle ──
  const [editTarget, setEditTarget] = useState<'low' | 'high' | null>(null)
  const [editText,   setEditText]   = useState('')

  const openEdit = (target: 'low' | 'high') => {
    setEditTarget(target)
    setEditText(String(target === 'low' ? low : high))
  }

  const commitEdit = () => {
    if (!editTarget) return
    const parsed = parseInt(editText, 10)
    if (!isNaN(parsed)) {
      if (editTarget === 'low') {
        const v = Math.max(minRef.current, Math.min(parsed, highRef.current - stepRef.current))
        onValueChangeRef.current(v, highRef.current)
      } else {
        const v = Math.min(maxRef.current, Math.max(parsed, lowRef.current + stepRef.current))
        onValueChangeRef.current(lowRef.current, v)
      }
    }
    setEditTarget(null)
  }

  // ── Calcul position → valeur ──
  const pctToValue = (pct: number) => {
    const raw     = pct * (maxRef.current - minRef.current) + minRef.current
    const stepped = Math.round(raw / stepRef.current) * stepRef.current
    return Math.max(minRef.current, Math.min(maxRef.current, stepped))
  }

  // ── PanResponders ──
  // onPanResponderGrant : mémorise le % initial du pouce au moment du touch
  // onPanResponderMove  : position = départ + gs.dx (delta accumulé depuis le touch)
  //                       gs.dx est fiable et évite les sauts au premier mouvement
  const lowPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  () => true,
      onPanResponderGrant: () => {
        lowStartPct.current = (lowRef.current - minRef.current) / (maxRef.current - minRef.current)
      },
      onPanResponderMove: (_, gs) => {
        if (!trackWidth.current) return
        const pct    = Math.max(0, Math.min(1, lowStartPct.current + gs.dx / trackWidth.current))
        const newLow = pctToValue(pct)
        if (newLow < highRef.current) onValueChangeRef.current(newLow, highRef.current)
      },
    })
  ).current

  const highPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  () => true,
      onPanResponderGrant: () => {
        highStartPct.current = (highRef.current - minRef.current) / (maxRef.current - minRef.current)
      },
      onPanResponderMove: (_, gs) => {
        if (!trackWidth.current) return
        const pct     = Math.max(0, Math.min(1, highStartPct.current + gs.dx / trackWidth.current))
        const newHigh = pctToValue(pct)
        if (newHigh > lowRef.current) onValueChangeRef.current(lowRef.current, newHigh)
      },
    })
  ).current

  const lowPct  = (low  - min) / (max - min)
  const highPct = (high - min) / (max - min)
  const lightBg = color + '18'

  const renderValueBox = (target: 'low' | 'high') => {
    const value   = target === 'low' ? low : high
    const editing = editTarget === target
    return (
      <Pressable
        onPress={() => openEdit(target)}
        style={[styles.valueBox, { borderColor: color, backgroundColor: lightBg }]}>
        {editing ? (
          <TextInput
            value={editText}
            onChangeText={setEditText}
            onBlur={commitEdit}
            onSubmitEditing={commitEdit}
            keyboardType="numeric"
            autoFocus
            selectTextOnFocus
            style={[
              styles.valueInput,
              { color },
              Platform.OS === 'ios' && { fontSize: 16 },
            ]}
          />
        ) : (
          <Text style={[styles.valueText, { color }]}>{value}{unit}</Text>
        )}
      </Pressable>
    )
  }

  return (
    <View style={styles.container}>
      {/* Labels cliquables */}
      <View style={styles.labels}>
        {renderValueBox('low')}
        <View style={styles.valueSep}>
          <Text style={styles.valueSepText}>–</Text>
        </View>
        {renderValueBox('high')}
      </View>

      {/* Track */}
      <View
        style={styles.trackContainer}
        onLayout={(e) => { trackWidth.current = e.nativeEvent.layout.width }}>
        <View style={styles.track} />

        <View
          style={[
            styles.trackActive,
            {
              left:            `${lowPct  * 100}%` as any,
              right:           `${(1 - highPct) * 100}%` as any,
              backgroundColor: color,
            },
          ]}
        />

        {/* Pouce gauche */}
        <Animated.View
          style={[styles.thumb, { left: `${lowPct * 100}%` as any, borderColor: color, shadowColor: color }]}
          {...lowPanResponder.panHandlers}>
          <View style={[styles.thumbInner, { backgroundColor: color }]} />
        </Animated.View>

        {/* Pouce droit */}
        <Animated.View
          style={[styles.thumb, { left: `${highPct * 100}%` as any, borderColor: color, shadowColor: color }]}
          {...highPanResponder.panHandlers}>
          <View style={[styles.thumbInner, { backgroundColor: color }]} />
        </Animated.View>
      </View>

      {/* Min / Max */}
      <View style={styles.minMaxRow}>
        <Text style={styles.minMaxText}>{min}{unit}</Text>
        <Text style={styles.minMaxText}>{max}{unit}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container:   { paddingVertical: Spacing.sm, gap: Spacing.base },
  labels:      { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.sm },
  valueBox: {
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
    borderWidth: 1.5,
    minWidth: 68,
    alignItems: 'center',
  },
  valueText:    { fontSize: 16, fontWeight: '700' },
  valueInput:   { fontSize: 15, fontWeight: '700', textAlign: 'center', minWidth: 40 },
  valueSep:     { paddingHorizontal: Spacing.xs },
  valueSepText: { fontSize: 16, color: Colors.gray[400], fontWeight: '600' },
  trackContainer: {
    height: THUMB_SIZE, justifyContent: 'center',
    marginHorizontal: THUMB_SIZE / 2,
  },
  track: {
    position: 'absolute', left: 0, right: 0,
    height: 5, borderRadius: 3, backgroundColor: Colors.gray[200],
  },
  trackActive: { position: 'absolute', height: 5, borderRadius: 3 },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: THUMB_SIZE / 2,
    backgroundColor: Colors.white, borderWidth: 2.5,
    marginLeft: -THUMB_SIZE / 2,
    alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35, shadowRadius: 5, elevation: 5,
  },
  thumbInner:  { width: 10, height: 10, borderRadius: 5 },
  minMaxRow:   { flexDirection: 'row', justifyContent: 'space-between' },
  minMaxText:  { fontSize: 11, color: Colors.gray[400] },
})
