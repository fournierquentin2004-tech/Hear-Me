import Svg, { Path, Circle } from 'react-native-svg'

type Props = {
  size?: number
  /** 'color' = plein amour × amitié  |  'white' = traits blancs */
  variant?: 'color' | 'white'
}

// Couleurs pleines — visibles et élégantes sur fond sombre
const LOVE_FILL    = '#F472B6'  // rose vif   — amour     (remplissage)
const LOVE_STROKE  = '#BE185D'  // rose foncé — contour fin
const HEAD_FILL    = '#38BDF8'  // bleu clair — amitié    (remplissage)
const HEAD_STROKE  = '#0284C7'  // bleu foncé — contour fin

export function HearMeLogo({ size = 80, variant = 'color' }: Props) {
  const isWhite = variant === 'white'

  const hFill   = isWhite ? 'none'        : LOVE_FILL
  const hStroke = isWhite ? 'white'       : LOVE_STROKE
  const dFill   = isWhite ? 'none'        : HEAD_FILL
  const dStroke = isWhite ? 'white'       : HEAD_STROKE

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">

      {/* ── Cœur référence : lobes ronds + corps plein + pointe ── */}
      <Path
        d={[
          'M50,90',
          'C83,75 96,60 96,50',
          'C96,25 82,8 67,8',
          'C58,8 50,20 50,28',
          'C50,20 42,8 33,8',
          'C18,8 4,25 4,50',
          'C4,60 17,75 50,90',
          'Z',
        ].join(' ')}
        fill={hFill}
        stroke={hStroke}
        strokeWidth={isWhite ? 2.5 : 1.5}
        strokeLinejoin="round"
      />

      {/*
        ── Casque premium ──
        Arc dessiné avant les cercles → sa terminaison disparaît sous eux
      */}
      <Path
        d="M15,42 C15,7 85,7 85,42"
        stroke={dStroke}
        strokeWidth={2.5}
        strokeLinecap="round"
        fill="none"
      />
      <Circle cx="15" cy="42" r="11"
        fill={dFill}
        stroke={dStroke}
        strokeWidth={1.5} />
      <Circle cx="85" cy="42" r="11"
        fill={dFill}
        stroke={dStroke}
        strokeWidth={1.5} />

    </Svg>
  )
}
