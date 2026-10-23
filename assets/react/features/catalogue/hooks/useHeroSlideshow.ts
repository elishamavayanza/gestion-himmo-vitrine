import { useCallback, useEffect, useState } from 'react'
import { useMediaQuery } from '../../../hooks/useMediaQuery'

export const heroSlides = [
  {
    src: 'https://images.unsplash.com/photo-1673350474055-e62f5818fcfe?auto=format&fit=crop&w=1800&q=75',
    alt: 'Immeuble résidentiel contemporain',
  },
  {
    src: 'https://images.unsplash.com/photo-1758193431351-68538bf55ec3?auto=format&fit=crop&w=1800&q=75',
    alt: 'Architecture résidentielle moderne entourée de verdure',
  },
  {
    src: 'https://images.unsplash.com/photo-1768638687896-35bde623d532?auto=format&fit=crop&w=1800&q=75',
    alt: 'Façade d’un immeuble avec balcons',
  },
]

const slideDuration = 8500

export function useHeroSlideshow() {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const [activeIndex, setActiveIndex] = useState(0)
  const [failedSlides, setFailedSlides] = useState<number[]>([])

  useEffect(() => {
    if (prefersReducedMotion || heroSlides.length < 2) return

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % heroSlides.length)
    }, slideDuration)

    return () => window.clearInterval(timer)
  }, [prefersReducedMotion])

  const markSlideFailed = useCallback((index: number) => {
    setFailedSlides((current) => current.includes(index) ? current : [...current, index])
  }, [])

  return {
    activeIndex,
    failedSlides,
    markSlideFailed,
  }
}
