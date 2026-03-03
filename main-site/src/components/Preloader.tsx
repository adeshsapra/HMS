import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const Preloader = () => {
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(true)
  const [windowLoaded, setWindowLoaded] = useState(document.readyState === 'complete')
  const [pageDelayPassed, setPageDelayPassed] = useState(false)
  const [homeReady, setHomeReady] = useState(false)
  const [homeFallbackPassed, setHomeFallbackPassed] = useState(false)

  useEffect(() => {
    const handleLoad = () => {
      setWindowLoaded(true)
    }

    if (document.readyState !== 'complete') {
      window.addEventListener('load', handleLoad)
    }

    return () => {
      window.removeEventListener('load', handleLoad)
    }
  }, [])

  useEffect(() => {
    setPageDelayPassed(false)
    const isHomeRoute = location.pathname === '/'
    const delay = isHomeRoute ? 1400 : 150
    const pageDelayTimer = window.setTimeout(() => {
      setPageDelayPassed(true)
    }, delay)

    return () => window.clearTimeout(pageDelayTimer)
  }, [location.pathname])

  useEffect(() => {
    if (location.pathname !== '/') {
      setHomeReady(false)
      setHomeFallbackPassed(false)
      return
    }

    if ((window as any).__homeCriticalReady) {
      setHomeReady(true)
    }

    const handleHomeReady = () => {
      setHomeReady(true)
    }

    const fallbackTimer = window.setTimeout(() => {
      setHomeFallbackPassed(true)
    }, 15000)

    window.addEventListener('home-critical-ready', handleHomeReady)

    return () => {
      window.removeEventListener('home-critical-ready', handleHomeReady)
      window.clearTimeout(fallbackTimer)
    }
  }, [location.pathname])

  useEffect(() => {
    if (!isLoading) return

    const isHomeRoute = location.pathname === '/'
    const canHideNonHome = pageDelayPassed
    const canHideHome = windowLoaded && pageDelayPassed && (homeReady || homeFallbackPassed)

    if ((isHomeRoute && canHideHome) || (!isHomeRoute && canHideNonHome)) {
      setIsLoading(false)
    }
  }, [isLoading, location.pathname, windowLoaded, pageDelayPassed, homeReady, homeFallbackPassed])

  if (!isLoading) return null

  return <div id="preloader"></div>
}

export default Preloader

