import { supabase } from './supabase'

// Generate a session ID that persists across page reloads
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('analytics_session_id')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('analytics_session_id', sessionId)
  }
  return sessionId
}

// Get referrer (where user came from)
function getReferrer(): string | null {
  if (typeof document !== 'undefined') {
    return document.referrer || null
  }
  return null
}

// Get user agent
function getUserAgent(): string | null {
  if (typeof navigator !== 'undefined') {
    return navigator.userAgent || null
  }
  return null
}

interface AnalyticsEvent {
  event_type: 'page_view' | 'search' | 'filter' | 'listing_click' | 'link_click' | 'time_on_page'
  page_path: string
  user_id?: string | null
  session_id: string
  referrer?: string | null
  user_agent?: string | null
  event_data?: Record<string, any>
}

// Track an analytics event
export async function trackEvent(
  eventType: AnalyticsEvent['event_type'],
  pagePath: string,
  eventData?: Record<string, any>
): Promise<void> {
  try {
    // Get current user if logged in
    const { data: { user } } = await supabase.auth.getUser()
    
    const event: AnalyticsEvent = {
      event_type: eventType,
      page_path: pagePath,
      user_id: user?.id || null,
      session_id: getSessionId(),
      referrer: getReferrer(),
      user_agent: getUserAgent(),
      event_data: eventData || {}
    }

    // Insert event into database (non-blocking)
    const promise = supabase
      .from('analytics_events')
      .insert([event])
    
    Promise.resolve(promise)
      .then(({ error }) => {
        if (error) {
          console.error('Analytics tracking error:', error)
        }
      })
      .catch((error: unknown) => {
        console.error('Analytics tracking error:', error)
      })
  } catch (error) {
    // Silently fail - don't break the app if analytics fails
    console.error('Analytics error:', error)
  }
}

// Track page view
export function trackPageView(pagePath: string): void {
  trackEvent('page_view', pagePath)
}

// Track search query
export function trackSearch(query: string, pagePath: string = '/'): void {
  trackEvent('search', pagePath, { query: query.trim() })
}

// Track filter usage
export function trackFilter(filterType: string, filterValue: string | string[], pagePath: string = '/'): void {
  trackEvent('filter', pagePath, {
    filter_type: filterType,
    filter_value: Array.isArray(filterValue) ? filterValue.join(',') : filterValue
  })
}

// Track listing click
export function trackListingClick(listingId: string, listingName: string, pagePath: string = '/'): void {
  trackEvent('listing_click', pagePath, {
    listing_id: listingId,
    listing_name: listingName
  })
}

// Track external link click
export function trackLinkClick(url: string, linkText: string, pagePath: string = '/'): void {
  trackEvent('link_click', pagePath, {
    url,
    link_text: linkText
  })
}

// Track time on page (call this when user leaves the page)
export function trackTimeOnPage(pagePath: string, durationSeconds: number): void {
  trackEvent('time_on_page', pagePath, {
    duration: durationSeconds
  })
}
