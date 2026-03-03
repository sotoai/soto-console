'use client'

import { useState, useEffect } from 'react'

interface ViewportState {
  isMobile: boolean      // width < 640
  isTablet: boolean      // 640 <= width < 1024
  isDesktop: boolean     // width >= 1024
  isLandscape: boolean
  isPortrait: boolean
  viewportWidth: number
  viewportHeight: number
}

const defaults: ViewportState = {
  isMobile: false,
  isTablet: true,
  isDesktop: false,
  isLandscape: true,
  isPortrait: false,
  viewportWidth: 1024,
  viewportHeight: 768,
}

export function useViewport(): ViewportState {
  const [state, setState] = useState<ViewportState>(defaults)

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      setState({
        isMobile: w < 640,
        isTablet: w >= 640 && w < 1024,
        isDesktop: w >= 1024,
        isLandscape: w > h,
        isPortrait: h >= w,
        viewportWidth: w,
        viewportHeight: h,
      })
    }

    update()

    // Use matchMedia for breakpoints (better perf than resize)
    const mobileQuery = window.matchMedia('(max-width: 639px)')
    const tabletQuery = window.matchMedia('(min-width: 640px) and (max-width: 1023px)')
    const landscapeQuery = window.matchMedia('(orientation: landscape)')

    const handleChange = () => update()

    mobileQuery.addEventListener('change', handleChange)
    tabletQuery.addEventListener('change', handleChange)
    landscapeQuery.addEventListener('change', handleChange)
    // Fallback for dimension changes matchMedia doesn't catch
    window.addEventListener('resize', handleChange, { passive: true })

    return () => {
      mobileQuery.removeEventListener('change', handleChange)
      tabletQuery.removeEventListener('change', handleChange)
      landscapeQuery.removeEventListener('change', handleChange)
      window.removeEventListener('resize', handleChange)
    }
  }, [])

  return state
}
