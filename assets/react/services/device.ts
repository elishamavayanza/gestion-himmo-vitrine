/**
 * Seuils et détection d’appareil partagés par les hooks et les parcours UI.
 * Les valeurs doivent rester alignées avec styles/base/_breakpoints.scss.
 */
export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  mediumDesktop: 1200,
  large: 1440,
  xlarge: 1920,
} as const

export type DeviceType = 'mobile' | 'tablet' | 'desktop'
export type Orientation = 'portrait' | 'landscape'

export const MEDIA_QUERIES = {
  deviceMobile: '(max-width: ' + (BREAKPOINTS.tablet - 1) + 'px)',
  deviceTablet: '(min-width: ' + BREAKPOINTS.tablet + 'px) and (max-width: ' + (BREAKPOINTS.desktop - 1) + 'px)',
  deviceDesktop: '(min-width: ' + BREAKPOINTS.desktop + 'px)',
  narrowDesktop: '(min-width: ' + BREAKPOINTS.tablet + 'px) and (max-width: ' + (BREAKPOINTS.mediumDesktop - 1) + 'px)',
  compact: '(max-width: ' + (BREAKPOINTS.desktop - 1) + 'px)',
  drawer: '(max-width: 600px)',
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',
  touch: '(pointer: coarse)',
  finePointer: '(pointer: fine)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
} as const

export const isClient = typeof window !== 'undefined'

/** Lit une requête média. Hors navigateur, retourne la valeur neutre false. */
export function matchesQuery(query: string): boolean {
  if (!isClient || typeof window.matchMedia !== 'function') return false
  return window.matchMedia(query).matches
}

export function getDeviceType(): DeviceType {
  if (matchesQuery(MEDIA_QUERIES.deviceMobile)) return 'mobile'
  if (matchesQuery(MEDIA_QUERIES.deviceTablet)) return 'tablet'
  return 'desktop'
}

export function getOrientation(): Orientation {
  return matchesQuery(MEDIA_QUERIES.portrait) ? 'portrait' : 'landscape'
}

export interface DeviceDescriptor {
  deviceType: DeviceType
  orientation: Orientation
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isCompact: boolean
  isPortrait: boolean
  isLandscape: boolean
  isTouch: boolean
  prefersReducedMotion: boolean
}

/** Instantané synchrone pour du code impératif hors React. */
export function getDeviceDescriptor(): DeviceDescriptor {
  const isMobile = matchesQuery(MEDIA_QUERIES.deviceMobile)
  const isTablet = matchesQuery(MEDIA_QUERIES.deviceTablet)
  const isDesktop = matchesQuery(MEDIA_QUERIES.deviceDesktop)
  const isPortrait = matchesQuery(MEDIA_QUERIES.portrait)

  return {
    deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
    orientation: isPortrait ? 'portrait' : 'landscape',
    isMobile,
    isTablet,
    isDesktop,
    isCompact: matchesQuery(MEDIA_QUERIES.compact),
    isPortrait,
    isLandscape: matchesQuery(MEDIA_QUERIES.landscape),
    isTouch: matchesQuery(MEDIA_QUERIES.touch),
    prefersReducedMotion: matchesQuery(MEDIA_QUERIES.reducedMotion),
  }
}
