import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageView, trackTimeOnPage } from '../lib/analytics'

export function usePageTracking() {
  const location = useLocation()
  const pageLoadTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    // Track page view when location changes
    trackPageView(location.pathname)
    pageLoadTimeRef.current = Date.now()

    // Track time on page when user leaves
    const handleBeforeUnload = () => {
      const duration = (Date.now() - pageLoadTimeRef.current) / 1000
      trackTimeOnPage(location.pathname, duration)
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const duration = (Date.now() - pageLoadTimeRef.current) / 1000
        trackTimeOnPage(location.pathname, duration)
      } else {
        // Reset timer when page becomes visible again
        pageLoadTimeRef.current = Date.now()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      // Track time on page when component unmounts
      const duration = (Date.now() - pageLoadTimeRef.current) / 1000
      trackTimeOnPage(location.pathname, duration)
    }
  }, [location.pathname])
}
