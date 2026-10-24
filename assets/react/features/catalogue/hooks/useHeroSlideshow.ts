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

export function heroSlideSrcSet(src: string) {
  return `${src.replace('w=1800', 'w=720')} 720w, ${src.replace('w=1800', 'w=1200')} 1200w, ${src} 1800w`
}

const slideDuration = 8500

export function useHeroSlideshow() {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const [activeIndex, setActiveIndex] = useState(0)
  const [loadedSlides, setLoadedSlides] = useState<number[]>([0])
  const [failedSlides, setFailedSlides] = useState<number[]>([])

  useEffect(() => {
    if (prefersReducedMotion || heroSlides.length < 2) return

    const timer = window.setTimeout(() => {
      let nextIndex = (activeIndex + 1) % heroSlides.length
      for (let attempts = 0; attempts < heroSlides.length && failedSlides.includes(nextIndex); attempts += 1) {
        nextIndex = (nextIndex + 1) % heroSlides.length
      }
      if (failedSlides.length >= heroSlides.length - 1 && failedSlides.includes(nextIndex)) return

      const showNextSlide = () => {
        setLoadedSlides((current) => current.includes(nextIndex) ? current : [...current, nextIndex])
        setActiveIndex(nextIndex)
      }
      if (loadedSlides.includes(nextIndex)) {
        showNextSlide()
        return
      }

      const image = new Image()
      image.fetchPriority = 'low'
      image.sizes = '100vw'
      image.srcset = heroSlideSrcSet(heroSlides[nextIndex].src)
      image.onload = showNextSlide
      image.onerror = () => {
        setFailedSlides((current) => current.includes(nextIndex) ? current : [...current, nextIndex])
        setActiveIndex((nextIndex + 1) % heroSlides.length)
      }
      image.src = heroSlides[nextIndex].src
    }, slideDuration)

    return () => window.clearTimeout(timer)
  }, [activeIndex, failedSlides, loadedSlides, prefersReducedMotion])

  const markSlideFailed = useCallback((index: number) => {
    setFailedSlides((current) => current.includes(index) ? current : [...current, index])
  }, [])

  return {
    activeIndex,
    loadedSlides,
    failedSlides,
    markSlideFailed,
  }
}
