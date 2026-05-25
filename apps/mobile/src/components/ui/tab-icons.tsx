import Svg, { Path, Circle } from 'react-native-svg'

type IconProps = { color: string; size: number }

export function DiscoverIcon({ color, size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={color === '#FF6B9D' ? color : 'none'}
        fillOpacity={color === '#FF6B9D' ? 0.15 : 0}
      />
    </Svg>
  )
}

export function MatchesIcon({ color, size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={color === '#FF6B9D' ? color : 'none'}
        fillOpacity={color === '#FF6B9D' ? 0.15 : 0}
      />
    </Svg>
  )
}

export function EventsIcon({ color, size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18 V 5 L 20 12 L 9 18 Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={color === '#FF6B9D' ? color : 'none'}
        fillOpacity={color === '#FF6B9D' ? 0.15 : 0}
      />
    </Svg>
  )
}

export function ProfileIcon({ color, size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={2} />
      <Path
        d="M4 20c0-4 3.58-7 8-7s8 3 8 7"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  )
}
