import { useEffect, useState } from 'react'

export function useOrganizationHeroSlideshow(images: string[]) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [failedImages, setFailedImages] = useState<Set<number>>(() => new Set())
  const imageSignature = images.join('\u0000')

  useEffect(() => {
    setActiveIndex(0)
    setFailedImages(new Set())
  }, [imageSignature])

  useEffect(() => {
    if (images.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const interval = window.setInterval(() => {
      setActiveIndex((current) => {
        for (let offset = 1; offset <= images.length; offset += 1) {
          const next = (current + offset) % images.length
          if (!failedImages.has(next)) return next
        }
        return current
      })
    }, 7000)

    return () => window.clearInterval(interval)
  }, [failedImages, images.length])

  useEffect(() => {
    if (!failedImages.has(activeIndex)) return
    const nextAvailable = images.findIndex((_, index) => !failedImages.has(index))
    if (nextAvailable >= 0) setActiveIndex(nextAvailable)
  }, [activeIndex, failedImages, images])

  return {
    activeIndex,
    failedImages,
    markImageFailed: (index: number) => setFailedImages((previous) => new Set(previous).add(index)),
  }
}
