import { useMemo } from 'react'
import { MEDIA_QUERIES, type DeviceDescriptor, type DeviceType } from '../services/device'
import { useMediaQuery } from './useMediaQuery'

/** Fournit aux parcours UI un état appareil réactif, partagé par l’application. */
export function useDevice(): DeviceDescriptor {
  const isMobile = useMediaQuery(MEDIA_QUERIES.deviceMobile)
  const isTablet = useMediaQuery(MEDIA_QUERIES.deviceTablet)
  const isDesktop = useMediaQuery(MEDIA_QUERIES.deviceDesktop)
  const isCompact = useMediaQuery(MEDIA_QUERIES.compact)
  const isPortrait = useMediaQuery(MEDIA_QUERIES.portrait)
  const isLandscape = useMediaQuery(MEDIA_QUERIES.landscape)
  const isTouch = useMediaQuery(MEDIA_QUERIES.touch)
  const prefersReducedMotion = useMediaQuery(MEDIA_QUERIES.reducedMotion)

  return useMemo(() => {
    const deviceType: DeviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'

    return {
      deviceType,
      orientation: isPortrait ? 'portrait' : 'landscape',
      isMobile,
      isTablet,
      isDesktop,
      isCompact,
      isPortrait,
      isLandscape,
      isTouch,
      prefersReducedMotion,
    }
  }, [isCompact, isDesktop, isLandscape, isMobile, isPortrait, isTablet, isTouch, prefersReducedMotion])
}
