import Svg, { Path, Circle, Rect, G } from 'react-native-svg'

type IconProps = { color: string; size: number }

/* ── Événements : calendrier ── */
export function EventsIcon({ color, size }: IconProps) {
  const active = color === '#FF6B9D'
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="3" y="4" width="18" height="18" rx="2"
        stroke={color} strokeWidth={2}
        fill={active ? color : 'none'}
        fillOpacity={active ? 0.12 : 0}
      />
      <Path d="M16 2v4M8 2v4M3 10h18" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Circle cx="8.5"  cy="15.5" r="1.3" fill={color} />
      <Circle cx="12"   cy="15.5" r="1.3" fill={color} />
      <Circle cx="15.5" cy="15.5" r="1.3" fill={color} />
    </Svg>
  )
}

/* ── Likes reçus : étoile ── */
export function LikesIcon({ color, size }: IconProps) {
  const active = color === '#FF6B9D'
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17.2l-6.2 4.1 2.4-7.4L2 9.4h7.6z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
        fill={active ? color : 'none'}
        fillOpacity={active ? 0.9 : 0}
      />
    </Svg>
  )
}

/* ── Découverte : flamme ── */
export function DiscoverIcon({ color, size }: IconProps) {
  const active = color === '#FF6B9D'
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2c0 5.5-5.5 7.5-5.5 12.5a5.5 5.5 0 0 0 11 0C17.5 9.5 12 7.5 12 2z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={active ? color : 'none'}
        fillOpacity={active ? 0.85 : 0}
      />
      <Path
        d="M12 2c0 3.5 2.5 5 2.5 8a2.5 2.5 0 0 1-5 0c0-2.5 2.5-4.5 2.5-8z"
        fill={active ? 'rgba(255,255,255,0.35)' : 'none'}
      />
    </Svg>
  )
}

/* ── Matchs : bulle de chat ── */
export function MatchesIcon({ color, size }: IconProps) {
  const active = color === '#FF6B9D'
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={active ? color : 'none'}
        fillOpacity={active ? 0.12 : 0}
      />
      <G>
        <Circle cx="9"  cy="11" r="1.2" fill={color} />
        <Circle cx="12" cy="11" r="1.2" fill={color} />
        <Circle cx="15" cy="11" r="1.2" fill={color} />
      </G>
    </Svg>
  )
}

/* ── Profil : personne ── */
export function ProfileIcon({ color, size }: IconProps) {
  const active = color === '#FF6B9D'
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx={12} cy={8} r={4}
        stroke={color} strokeWidth={2}
        fill={active ? color : 'none'}
        fillOpacity={active ? 0.15 : 0}
      />
      <Path
        d="M4 20c0-4 3.58-7 8-7s8 3 8 7"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  )
}
