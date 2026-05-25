import Svg, { Defs, LinearGradient, Stop, Path, Rect } from 'react-native-svg'

type Props = {
  size?: number
  /** 'color' = cœur gradient rose/rouge  |  'white' = contour blanc (sur fond coloré) */
  variant?: 'color' | 'white'
}

export function HearMeLogo({ size = 80, variant = 'color' }: Props) {
  const isWhite = variant === 'white'

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        {/* Gradient principal */}
        <LinearGradient id="hm-fill" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FF8EC7" />
          <Stop offset="0.5" stopColor="#FF6B9D" />
          <Stop offset="1" stopColor="#FF4757" />
        </LinearGradient>

        {/* Gradient ombre douce au bas du cœur */}
        <LinearGradient id="hm-shadow" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FF4757" stopOpacity="0" />
          <Stop offset="1" stopColor="#CC1A2E" stopOpacity="0.35" />
        </LinearGradient>
      </Defs>

      {/* ═══ CŒUR ═══
          Tracé cubique Bézier en 100×100, pointe en bas (50,84) */}
      <Path
        d={[
          'M50 84',
          'C28 70 5 54 5 35',
          'C5 19 17 8 31 8',
          'C38 8 44 11 48 18',
          'L50 22',
          'L52 18',
          'C56 11 62 8 69 8',
          'C83 8 95 19 95 35',
          'C95 54 72 70 50 84',
          'Z',
        ].join(' ')}
        fill={isWhite ? 'none' : 'url(#hm-fill)'}
        stroke={isWhite ? 'white' : 'none'}
        strokeWidth={isWhite ? 5 : 0}
      />

      {/* Overlay dégradé sombre au bas pour donner du relief */}
      {!isWhite && (
        <Path
          d={[
            'M50 84',
            'C28 70 5 54 5 35',
            'C5 19 17 8 31 8',
            'C38 8 44 11 48 18',
            'L50 22',
            'L52 18',
            'C56 11 62 8 69 8',
            'C83 8 95 19 95 35',
            'C95 54 72 70 50 84',
            'Z',
          ].join(' ')}
          fill="url(#hm-shadow)"
        />
      )}

      {/* ═══ ÉCOUTEURS ═══ */}
      {/* Arceau (bandeau) */}
      <Path
        d="M30 52 C30 34 70 34 70 52"
        stroke={isWhite ? 'white' : 'white'}
        strokeWidth={isWhite ? 4.5 : 5}
        strokeLinecap="round"
        fill="none"
      />

      {/* Coussin gauche */}
      <Rect
        x="18" y="49"
        width="16" height="20"
        rx="5"
        fill={isWhite ? 'white' : 'white'}
      />

      {/* Coussin droit */}
      <Rect
        x="66" y="49"
        width="16" height="20"
        rx="5"
        fill={isWhite ? 'white' : 'white'}
      />

      {/* Petite encoche centrale (speaker grille) — détail qui fait la différence */}
      <Rect
        x="23" y="55"
        width="6" height="2"
        rx="1"
        fill={isWhite ? 'rgba(255,255,255,0.35)' : '#FF6B9D'}
        opacity="0.7"
      />
      <Rect
        x="71" y="55"
        width="6" height="2"
        rx="1"
        fill={isWhite ? 'rgba(255,255,255,0.35)' : '#FF6B9D'}
        opacity="0.7"
      />

      {/* Petite note de musique flottant en haut à droite du cœur */}
      <Path
        d="M73 22 L73 30 C72 30 70 31 70 33 C70 35 72 36 73 35 C74 34 75 33 75 31 L75 24 L78 23 L78 21 Z"
        fill={isWhite ? 'white' : 'white'}
        opacity={0.75}
      />
    </Svg>
  )
}
