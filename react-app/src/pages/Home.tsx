import { Link } from 'react-router-dom'
import { Search, MapPin, Filter, Star, CheckCircle2, ArrowRight, ChevronLeft, ChevronRight, Plus, Video, X, Shield } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Listing } from '../types'
import { LOCATIONS, SPECIALTIES, PROFESSIONS } from '../lib/constants'
import { SAMPLE_LISTINGS } from '../lib/sampleListings'
import { useContentSettings } from '../hooks/useContentSettings'
import { trackPageView, trackSearch, trackListingClick, trackLinkClick, trackTimeOnPage } from '../lib/analytics'
import { sanitizeHTMLWithSafeTags } from '../lib/sanitize'
import { SEO } from '../components/SEO'

const LISTINGS_PER_PAGE = 4

export function Home() {
  const { settings } = useContentSettings()
  const [listings, setListings] = useState<Listing[]>([])
  const [filteredListings, setFilteredListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [filters, setFilters] = useState({
    keywords: '',
    location: 'All Locations',
    specialties: [] as string[],
    practiceType: 'all',
    professions: [] as string[],
    telehealth: false,
    statewideTelehealth: false,
    ruralOutreach: false,
    featured: false,
    verified: false
  })

  useEffect(() => {
    // Track page view
    trackPageView('/')
    
    // Track time on page when user leaves
    const pageLoadTime = Date.now()
    const handleBeforeUnload = () => {
      const duration = (Date.now() - pageLoadTime) / 1000 // Convert to seconds
      trackTimeOnPage('/', duration)
    }
    
    fetchListings()
    
    // Refresh listings when page becomes visible (user switches back to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchListings(true) // Force refresh when tab becomes visible
      } else {
        // Track time when tab becomes hidden
        const duration = (Date.now() - pageLoadTime) / 1000
        trackTimeOnPage('/', duration)
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      // Track time on page when component unmounts
      const duration = (Date.now() - pageLoadTime) / 1000
      trackTimeOnPage('/', duration)
    }
  }, [])

  const filterListings = useCallback(() => {
    if (!listings || listings.length === 0) {
      setFilteredListings([])
      return
    }

    let filtered = [...listings]

    // Keywords filter - sanitize input to prevent XSS
    if (filters.keywords && filters.keywords.trim()) {
      // Sanitize keywords: remove potentially dangerous characters
      const sanitizedKeywords = filters.keywords.trim().replace(/[<>\"']/g, '')
      const keywords = sanitizedKeywords.toLowerCase()
      // Track search query (already sanitized)
      trackSearch(keywords, '/')
      filtered = filtered.filter(listing =>
        (listing.practice_name?.toLowerCase().includes(keywords) ?? false) ||
        (listing.profession?.toLowerCase().includes(keywords) ?? false) ||
        (listing.bio?.toLowerCase().includes(keywords) ?? false) ||
        (listing.specialties && Array.isArray(listing.specialties) && listing.specialties.some(s => s?.toLowerCase().includes(keywords)))
      )
    }

    // Location filter
    if (filters.location && filters.location !== 'All Locations') {
      filtered = filtered.filter(listing => {
        if (filters.location === 'Statewide (Telehealth)') {
          return listing.is_statewide_telehealth === true
        }
        if (filters.location === 'Telehealth') {
          return listing.is_telehealth === true
        }
        return listing.location === filters.location
      })
    }

    // Specialties filter (multiple selection)
    if (filters.specialties && filters.specialties.length > 0) {
      filtered = filtered.filter(listing => {
        if (!listing.specialties || !Array.isArray(listing.specialties)) return false
        return filters.specialties.some(selectedSpec => 
          listing.specialties.includes(selectedSpec)
        )
      })
    }

    // Practice type filter
    if (filters.practiceType && filters.practiceType !== 'all') {
      filtered = filtered.filter(listing =>
        listing.practice_type === filters.practiceType
      )
    }

    // Professions filter (multiple selection)
    if (filters.professions && filters.professions.length > 0) {
      filtered = filtered.filter(listing =>
        listing.profession && filters.professions.includes(listing.profession)
      )
    }

    // Telehealth filter
    if (filters.telehealth) {
      filtered = filtered.filter(listing =>
        listing.is_telehealth === true
      )
    }

    // Statewide telehealth filter
    if (filters.statewideTelehealth) {
      filtered = filtered.filter(listing =>
        listing.is_statewide_telehealth === true
      )
    }

    // Rural outreach filter
    if (filters.ruralOutreach) {
      filtered = filtered.filter(listing =>
        listing.is_rural_outreach === true
      )
    }

    // Featured filter
    if (filters.featured) {
      filtered = filtered.filter(listing =>
        listing.is_featured === true
      )
    }

    // Verified filter
    if (filters.verified) {
      filtered = filtered.filter(listing =>
        listing.ahpra_number && listing.ahpra_number.trim() !== ''
      )
    }

    setFilteredListings(filtered)
  }, [listings, filters])

  useEffect(() => {
    filterListings()
    setCurrentPage(1) // Reset to first page when filters change
  }, [filterListings])

  const fetchListings = async (forceRefresh = false) => {
    setLoading(true)
    
    try {
      // Clear cache if force refresh
      if (forceRefresh) {
        sessionStorage.removeItem('listings_cache')
        sessionStorage.removeItem('listings_cache_time')
      }

      // Try to get from cache first (unless forcing refresh)
      if (!forceRefresh) {
        const cacheKey = 'listings_cache'
        const cacheTime = 'listings_cache_time'
        const cached = sessionStorage.getItem(cacheKey)
        const cacheTimestamp = sessionStorage.getItem(cacheTime)
        
        // Use cache if less than 2 minutes old (reduced from 5 minutes)
        if (cached && cacheTimestamp) {
          const age = Date.now() - parseInt(cacheTimestamp)
          if (age < 2 * 60 * 1000) { // 2 minutes
            try {
              const cachedListings = JSON.parse(cached)
              if (cachedListings && cachedListings.length > 0) {
                updateListings(cachedListings)
                setLoading(false)
                return // Use cached data, skip fetch
              }
            } catch (e) {
              // Cache corrupted, continue to fetch
            }
          }
        }
      }

      // Show sample data immediately for instant UI (only if no cache)
      if (!forceRefresh) {
        setListings(SAMPLE_LISTINGS)
        setLoading(false)
      }

      // Fetch from database
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'approved')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(200) // Increased limit

      if (error) {
        console.error('Error fetching listings:', error)
        // If we have cached data, keep it. Otherwise show sample data
        if (!forceRefresh) {
          return
        }
        throw error
      }

      // Process and update listings
      const dbListings = data || []
      
      if (dbListings.length === 0) {
        console.warn('No approved listings found in database')
        // Still update with empty array to clear sample data
        updateListings([])
      } else {
        updateListings(dbListings)
      }
      
      // Cache the result
      try {
        sessionStorage.setItem('listings_cache', JSON.stringify(dbListings))
        sessionStorage.setItem('listings_cache_time', Date.now().toString())
      } catch (e) {
        // Cache failed, ignore
      }
    } catch (error) {
      console.error('Error fetching listings:', error)
      // On error, try to use cache if available
      const cached = sessionStorage.getItem('listings_cache')
      if (cached) {
        try {
          const cachedListings = JSON.parse(cached)
          updateListings(cachedListings)
        } catch (e) {
          // Cache also failed, show sample data
          setListings(SAMPLE_LISTINGS)
        }
      } else {
        setListings(SAMPLE_LISTINGS)
      }
    } finally {
      setLoading(false)
    }
  }

  const updateListings = (dbListings: Listing[]) => {
    // Combine database listings with sample listings (avoid duplicates)
    const sampleListings = SAMPLE_LISTINGS.filter(
      sample => !dbListings.some(db => db.id === sample.id || db.practice_name === sample.practice_name)
    )
    
    // Merge: database listings first, then sample listings
    const allListings = [...dbListings, ...sampleListings]
    
    // Sort: Featured first (newest first), then non-featured (newest first)
    allListings.sort((a, b) => {
      // Featured listings come first
      if (a.is_featured && !b.is_featured) return -1
      if (!a.is_featured && b.is_featured) return 1
      
      // Within same featured status, sort by date (newest first)
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return dateB - dateA
    })
    
    if (allListings.length > 0) {
      setListings(allListings)
    }
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredListings.length / LISTINGS_PER_PAGE)
  const startIndex = (currentPage - 1) * LISTINGS_PER_PAGE
  const endIndex = startIndex + LISTINGS_PER_PAGE
  const paginatedListings = filteredListings.slice(startIndex, endIndex)

  const scrollToDirectory = () => {
    const directorySection = document.getElementById('directory')
    if (directorySection) {
      directorySection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goToPage = (page: number) => {
    setCurrentPage(page)
    setTimeout(scrollToDirectory, 100)
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
      setTimeout(scrollToDirectory, 100)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      setTimeout(scrollToDirectory, 100)
    }
  }

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://tasmentalhealthdirectory.com.au'
  const metaTitle = settings['home_meta_title'] || 'Tasmanian Mental Health Directory | Find Support or List Your Practice'
  const metaDescription = settings['home_meta_description'] || 'Tasmanian Mental Health Directory - Find trusted mental health professionals across Hobart, Launceston, and beyond.'
  const metaKeywords = settings['home_meta_keywords'] || 'mental health Tasmania, psychologists Hobart, counsellors Launceston, therapy near me Tasmania, mental health professionals, mental health directory'

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Tasmanian Mental Health Directory',
    url: siteUrl,
    description: metaDescription,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Tasmanian Mental Health Directory',
      url: siteUrl
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={metaTitle}
        description={metaDescription}
        keywords={metaKeywords}
        image="/images/hero-mountain.jpg"
        structuredData={structuredData}
      />
      {/* Hero Section with Background Image */}
      <section className="hero-section relative text-white overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: (settings['home_hero_background'] && settings['home_hero_background'].trim()) 
              ? `url(${settings['home_hero_background'].trim()})` 
              : 'url(/images/hero-mountain.jpg)'
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-teal-950/80 to-teal-800/40"></div>
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 lg:py-28 xl:py-32 relative z-10 max-w-7xl">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 sm:mb-8 md:mb-10 leading-tight">
              {settings['home_hero_title'] || "Tasmania's Mental Health Directory - Connecting You to the Right Support"}
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 md:mb-10 text-white/90 max-w-3xl mx-auto px-4">
              {settings['home_hero_description'] ? (
                <span dangerouslySetInnerHTML={{ __html: sanitizeHTMLWithSafeTags(settings['home_hero_description']) }} />
              ) : (
                <>Search for trusted mental health professionals across Hobart, Launceston, and beyond, or <strong>list your practice for free</strong> to grow your visibility and connect with patients seeking mental health support in Tasmania.</>
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
              <a 
                href="#directory" 
                className="w-full sm:w-auto min-w-[200px] sm:min-w-[220px] px-6 sm:px-8 py-3 sm:py-4 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-all transform hover:scale-105 shadow-lg inline-flex items-center justify-center gap-2 text-sm sm:text-base md:text-lg"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                Find a Professional
              </a>
              <Link 
                to="/get-listed" 
                className="w-full sm:w-auto min-w-[200px] sm:min-w-[220px] px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 hover:border-white/40 transition-all transform hover:scale-105 shadow-lg inline-flex items-center justify-center gap-2 text-sm sm:text-base md:text-lg"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                List Your Practice Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Two Column Section - Enhanced Design */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-7xl">
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 xl:gap-12">
            <div className="pr-0 md:pr-6 md:pr-8 md:pr-10 lg:pr-12 border-r-0 md:border-r border-gray-300 pb-6 md:pb-0">
              <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900">
                {settings['home_heading_people_support'] || 'For People Seeking Support'}
              </h2>
              <p className="text-gray-700 mb-4 sm:mb-6 text-base sm:text-lg leading-relaxed">
                {settings['home_description_people_support'] || 'Navigating mental health care can be overwhelming. We make it easier to find compassionate help. Whether you are looking for psychologists in Hobart, need anxiety counselling in Tasmania, or want to find a social worker in Tasmania, our directory connects you with verified local experts.'}
              </p>
              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                <li className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm sm:text-base">Locate specialists near you: Easily search for psychiatrists in Hobart, Launceston, Devonport, Burnie, Ulverstone, Kingston, Glenorchy, New Norfolk, Sorell, George Town, Smithton, Wynyard, Latrobe, Penguin, etc.</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm sm:text-base">Find specific treatments: Connect with providers offering sleep therapy in Hobart, trauma-informed care, and more.</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm sm:text-base">Verified Professionals: Browse detailed profiles to find someone you trust for your mental health support in Tasmania.</span>
                </li>
              </ul>
              <a 
                href="#directory" 
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-white text-primary-600 border-2 border-primary-500 rounded-lg font-semibold hover:bg-primary-50 hover:border-primary-600 transition-colors shadow-md hover:shadow-lg text-sm sm:text-base"
              >
                Start Your Search
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>

            <div className="pl-0 md:pl-6 md:pl-8 md:pl-10 lg:pl-12 pt-6 md:pt-0 border-t md:border-t-0 border-gray-300">
              <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900">
                {settings['home_heading_professionals'] || 'For Professionals & Clinics'}
              </h2>
              <p className="text-gray-700 mb-4 sm:mb-6 text-base sm:text-lg leading-relaxed">
                {settings['home_description_professionals'] ? (
                  <span dangerouslySetInnerHTML={{ __html: sanitizeHTMLWithSafeTags(settings['home_description_professionals']) }} />
                ) : (
                  <>Are you ready to grow your private practice in Hobart or statewide? Join Tasmania's dedicated online directory for mental health professionals. <strong>List your practice for free</strong> and advertise psychology services in Tasmania effectively to patients actively seeking care.</>
                )}
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Boost Your Visibility: Learn how to get mental health clients in Tasmania by appearing in targeted local searches.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Connect with Referrals: A listing acts as a digital business card for GPs and other counsellors in Tasmania to find you.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Professional SEO: <strong>List your practice for free</strong> in Tasmania on a high-authority site designed for clinicians. Free directory listing to boost your local search visibility.</span>
                </li>
              </ul>
              <Link 
                to="/get-listed" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors shadow-md hover:shadow-lg"
              >
                List Your Practice Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Directory Section - Enhanced */}
      <section 
        id="directory" 
        className="py-12 sm:py-16 md:py-20 bg-gray-50 relative"
        style={(settings['home_directory_background'] && settings['home_directory_background'].trim()) ? {
          backgroundImage: `url(${settings['home_directory_background'].trim()})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        } : {}}
      >
        {(settings['home_directory_background'] && settings['home_directory_background'].trim()) && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>
        )}
        <div className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-7xl">
          {/* Featured Listings Banner */}
          <div className="bg-terracotta rounded-2xl p-6 mb-8 shadow-xl border-2 border-terracotta-300">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="bg-white rounded-full p-3 shadow-lg">
                  <Star className="w-8 h-8 text-terracotta fill-terracotta" />
                </div>
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-white mb-1">Stand Out with Featured Listings</h3>
                  <p className="text-white/90 text-sm md:text-base">Get top placement, verified badge, enhanced profile, and priority support for just $29/month</p>
                </div>
              </div>
              <Link 
                to="/featured-listings" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-terracotta rounded-lg font-bold hover:bg-terracotta-50 transition-colors shadow-lg hover:shadow-xl whitespace-nowrap"
              >
                <Star className="w-5 h-5" />
                View Featured Plans
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
          
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-gray-900 px-2">
              {settings['home_heading_find_support'] || 'Find Mental Health Support in Tasmania'}
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              {settings['home_description_find_support'] || 'Use the filters below to find psychologists, counsellors, and other specialists in your area.'}
            </p>
          </div>
          </div>

        {/* Full width container for grid to allow screen-edge margin */}
        <div className="w-full">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 max-w-[1400px]">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4 flex justify-end items-center">
              <button
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl font-semibold shadow-lg hover:bg-primary-600 transition-colors"
              >
                <Filter className="w-5 h-5" />
                Filters
              </button>
            </div>

            <div className="grid lg:grid-cols-12 gap-4 lg:gap-6">
            {/* Filters Sidebar - Hidden on mobile, visible on desktop */}
              <aside className="hidden lg:block lg:col-span-4 mb-6 lg:mb-0">
                <div className="relative bg-gradient-to-br from-white via-primary-50/30 to-white p-4 sm:p-5 md:p-5 lg:p-5 rounded-2xl lg:rounded-2xl shadow-2xl lg:sticky lg:top-24 border-2 border-primary-100/50 backdrop-blur-sm overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-200/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-200/20 rounded-full blur-2xl -ml-12 -mb-12"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-primary-200">
                    <div className="p-2.5 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
                      <Filter className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Filter Clinicians & Counsellors
                    </h3>
                  </div>

                  <div className="space-y-4 sm:space-y-5">
                  <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-2xl border border-primary-100/50 shadow-md hover:shadow-lg transition-all w-full">
                    <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2 sm:mb-3 flex items-center gap-2">
                      <Search className="w-4 h-4 text-primary-500" />
                      Keywords
                    </label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-primary-400 w-3 h-3 z-10" />
                      <input
                        type="text"
                        placeholder="Q Name, condition, therapy..."
                        value={filters.keywords}
                        onChange={(e) => setFilters({ ...filters, keywords: e.target.value })}
                        className="w-full pl-8 pr-3 py-2 border-2 border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all text-sm bg-white/90 shadow-sm hover:shadow-md"
                      />
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-2xl border border-primary-100/50 shadow-md hover:shadow-lg transition-all w-full">
                    <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2 sm:mb-3">Filter by Listing Category</label>
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        onClick={() => setFilters({ ...filters, practiceType: 'all' })}
                        className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all transform hover:scale-105 ${
                          filters.practiceType === 'all' 
                            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-200' 
                            : 'bg-white text-gray-700 hover:bg-primary-50 border-2 border-primary-200 hover:border-primary-300 shadow-sm'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setFilters({ ...filters, practiceType: 'individual' })}
                        className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all transform hover:scale-105 ${
                          filters.practiceType === 'individual' 
                            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-200' 
                            : 'bg-white text-gray-700 hover:bg-primary-50 border-2 border-primary-200 hover:border-primary-300 shadow-sm'
                        }`}
                      >
                        Individual
                      </button>
                      <button
                        onClick={() => setFilters({ ...filters, practiceType: 'group_practice' })}
                        className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all transform hover:scale-105 ${
                          filters.practiceType === 'group_practice' 
                            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-200' 
                            : 'bg-white text-gray-700 hover:bg-primary-50 border-2 border-primary-200 hover:border-primary-300 shadow-sm'
                        }`}
                      >
                        Practice
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-2xl border border-primary-100/50 shadow-md hover:shadow-lg transition-all w-full">
                    <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2 sm:mb-3">
                      Professional Role{filters.professions.length > 0 && ` (${filters.professions.length})`}
                    </label>
                    {filters.professions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {filters.professions.map(prof => (
                          <span
                            key={prof}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg text-xs font-semibold"
                          >
                            {prof}
                            <button
                              onClick={() => setFilters({ 
                                ...filters, 
                                professions: filters.professions.filter(p => p !== prof)
                              })}
                              className="hover:bg-primary-200 rounded-full p-0.5 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="space-y-2">
                      <select
                        value=""
                        onChange={(e) => {
                          const value = e.target.value
                          if (value && !filters.professions.includes(value)) {
                            setFilters({ ...filters, professions: [...filters.professions, value] })
                          }
                          e.target.value = ''
                        }}
                        className="w-full px-3 py-2 border-2 border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 bg-white/90 shadow-sm hover:shadow-md text-sm cursor-pointer transition-all"
                      >
                        <option value="">Select professional role...</option>
                        {PROFESSIONS.filter(prof => !filters.professions.includes(prof)).map(prof => (
                          <option key={prof} value={prof}>{prof}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-2xl border border-primary-100/50 shadow-md hover:shadow-lg transition-all w-full">
                    <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2 sm:mb-3 uppercase">Select Location (e.g. Hobart)</label>
                    <div className="relative">
                      <MapPin className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-primary-400 w-3 h-3 z-10 pointer-events-none" />
                      <select
                        value={filters.location}
                        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                        className="w-full pl-8 pr-3 py-2 border-2 border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 appearance-none bg-white/90 shadow-sm hover:shadow-md text-sm cursor-pointer"
                      >
                        {LOCATIONS.map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-2xl border border-primary-100/50 shadow-md hover:shadow-lg transition-all w-full">
                    <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2 sm:mb-3">
                      Specialties{filters.specialties.length > 0 && ` (${filters.specialties.length})`}
                    </label>
                    {filters.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {filters.specialties.map(spec => (
                          <span
                            key={spec}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold"
                          >
                            {spec}
                            <button
                              onClick={() => setFilters({ 
                                ...filters, 
                                specialties: filters.specialties.filter(s => s !== spec)
                              })}
                              className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="space-y-2">
                      <select
                        value=""
                        onChange={(e) => {
                          const value = e.target.value
                          if (value && !filters.specialties.includes(value)) {
                            setFilters({ ...filters, specialties: [...filters.specialties, value] })
                          }
                          e.target.value = ''
                        }}
                        className="w-full px-3 py-2 border-2 border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 bg-white/90 shadow-sm hover:shadow-md text-sm cursor-pointer transition-all"
                      >
                        <option value="">Select specialties below...</option>
                        {SPECIALTIES.filter(spec => !filters.specialties.includes(spec)).map(spec => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Mobile Filter Modal */}
            {showMobileFilters && (
              <div className="fixed inset-0 z-50 lg:hidden">
                {/* Overlay */}
                <div 
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                  onClick={() => setShowMobileFilters(false)}
                ></div>
                
                {/* Modal */}
                <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b-2 border-primary-200 p-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
                        <Filter className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                    </div>
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-6 h-6 text-gray-600" />
                    </button>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    {/* Filter Content - Same as sidebar */}
                    <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-2xl border border-primary-100/50 shadow-md">
                      <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2 sm:mb-3 flex items-center gap-2">
                        <Search className="w-4 h-4 text-primary-500" />
                        Keywords
                      </label>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-primary-400 w-3 h-3 z-10" />
                        <input
                          type="text"
                          placeholder="Q Name, condition, therapy..."
                          value={filters.keywords}
                          onChange={(e) => setFilters({ ...filters, keywords: e.target.value })}
                          className="w-full pl-8 pr-3 py-2 border-2 border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all text-sm bg-white/90 shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-2xl border border-primary-100/50 shadow-md">
                      <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2 sm:mb-3">Filter by Listing Category</label>
                      <div className="flex flex-wrap gap-2.5">
                        <button
                          onClick={() => setFilters({ ...filters, practiceType: 'all' })}
                          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                            filters.practiceType === 'all' 
                              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg' 
                              : 'bg-white text-gray-700 hover:bg-primary-50 border-2 border-primary-200 shadow-sm'
                          }`}
                        >
                          All
                        </button>
                        <button
                          onClick={() => setFilters({ ...filters, practiceType: 'individual' })}
                          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                            filters.practiceType === 'individual' 
                              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg' 
                              : 'bg-white text-gray-700 hover:bg-primary-50 border-2 border-primary-200 shadow-sm'
                          }`}
                        >
                          Individual
                        </button>
                        <button
                          onClick={() => setFilters({ ...filters, practiceType: 'group_practice' })}
                          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                            filters.practiceType === 'group_practice' 
                              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg' 
                              : 'bg-white text-gray-700 hover:bg-primary-50 border-2 border-primary-200 shadow-sm'
                          }`}
                        >
                          Practice
                        </button>
                      </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-2xl border border-primary-100/50 shadow-md">
                      <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2 sm:mb-3">
                        Professional Role{filters.professions.length > 0 && ` (${filters.professions.length})`}
                      </label>
                      {filters.professions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {filters.professions.map(prof => (
                            <span
                              key={prof}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg text-xs font-semibold"
                            >
                              {prof}
                              <button
                                onClick={() => setFilters({ 
                                  ...filters, 
                                  professions: filters.professions.filter(p => p !== prof)
                                })}
                                className="hover:bg-primary-200 rounded-full p-0.5 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <select
                        value=""
                        onChange={(e) => {
                          const value = e.target.value
                          if (value && !filters.professions.includes(value)) {
                            setFilters({ ...filters, professions: [...filters.professions, value] })
                          }
                          e.target.value = ''
                        }}
                        className="w-full px-3 py-2 border-2 border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 bg-white/90 shadow-sm text-sm cursor-pointer"
                      >
                        <option value="">Select professional role...</option>
                        {PROFESSIONS.filter(prof => !filters.professions.includes(prof)).map(prof => (
                          <option key={prof} value={prof}>{prof}</option>
                        ))}
                      </select>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-2xl border border-primary-100/50 shadow-md">
                      <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2 sm:mb-3 uppercase">Select Location (e.g. Hobart)</label>
                      <div className="relative">
                        <MapPin className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-primary-400 w-3 h-3 z-10 pointer-events-none" />
                        <select
                          value={filters.location}
                          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                          className="w-full pl-8 pr-3 py-2 border-2 border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 appearance-none bg-white/90 shadow-sm text-sm cursor-pointer"
                        >
                          {LOCATIONS.map(loc => (
                            <option key={loc} value={loc}>{loc}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-2xl border border-primary-100/50 shadow-md">
                      <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2 sm:mb-3">
                        Specialties{filters.specialties.length > 0 && ` (${filters.specialties.length})`}
                      </label>
                      {filters.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {filters.specialties.map(spec => (
                            <span
                              key={spec}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold"
                            >
                              {spec}
                              <button
                                onClick={() => setFilters({ 
                                  ...filters, 
                                  specialties: filters.specialties.filter(s => s !== spec)
                                })}
                                className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <select
                        value=""
                        onChange={(e) => {
                          const value = e.target.value
                          if (value && !filters.specialties.includes(value)) {
                            setFilters({ ...filters, specialties: [...filters.specialties, value] })
                          }
                          e.target.value = ''
                        }}
                        className="w-full px-3 py-2 border-2 border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 bg-white/90 shadow-sm text-sm cursor-pointer"
                      >
                        <option value="">Select specialties below...</option>
                        {SPECIALTIES.filter(spec => !filters.specialties.includes(spec)).map(spec => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
                      </select>
                    </div>

                    {/* Apply Button */}
                    <div className="sticky bottom-0 bg-white border-t-2 border-primary-200 p-4 -mx-4 -mb-4 mt-6">
                      <button
                        onClick={() => setShowMobileFilters(false)}
                        className="w-full px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold shadow-lg hover:bg-primary-600 transition-colors"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Results - Enhanced Cards */}
            <div className="lg:col-span-8 w-full">
              {loading ? (
                <div className="text-center py-12 sm:py-20">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary-500 mb-4"></div>
                  <p className="text-gray-600 text-base sm:text-lg">Loading listings...</p>
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="bg-white p-8 sm:p-16 rounded-2xl shadow-lg text-center border-2 border-dashed border-gray-300">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <Search className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No matches found</h3>
                  <p className="text-gray-600 text-base sm:text-lg">
                    We couldn't find any professionals matching your current filters.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                      Results <span className="text-primary-600">{filteredListings.length} found</span>
                    </h3>
                  </div>
                  {paginatedListings.map(listing => (
                    <div
                      key={listing.id}
                      className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border-l-4 overflow-hidden ${
                        listing.is_featured ? 'border-terracotta bg-white' : 'border-primary-500'
                      }`}
                    >
                      <div className="p-4 sm:p-6">
                        {/* Top Row: Avatar (Left) | Info (Center) | Buttons (Right) */}
                        <div className="flex gap-4 sm:gap-6 items-start mb-4">
                          {/* Left: Avatar/Logo - Only for featured listings */}
                          {listing.is_featured && listing.avatar_url && (
                            <div className="flex-shrink-0 relative">
                              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 border-gray-200 shadow-md">
                                <img 
                                  src={listing.avatar_url} 
                                  alt={listing.practice_name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.style.display = 'none'
                                  }}
                                />
                              </div>
                              <div className="absolute -bottom-1 left-0 right-0 bg-terracotta px-2 py-0.5 text-center rounded-b-xl">
                                <span className="text-white font-bold text-[10px] sm:text-xs">FEATURED</span>
                              </div>
                            </div>
                          )}

                          {/* Center: Basic Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                              <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{listing.practice_name}</h4>
                              {listing.is_featured && (
                                <>
                                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-terracotta fill-terracotta flex-shrink-0" />
                                  <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap">
                                    Verified
                                  </span>
                                </>
                              )}
                            </div>
                            <p className="text-sm sm:text-base text-primary-600 font-medium">{listing.profession}</p>
                          </div>

                          {/* Right: Action Buttons */}
                          <div className="flex-shrink-0 flex flex-col gap-2 sm:gap-3">
                            {listing.is_featured ? (
                              <>
                                <Link
                                  to={`/listing/${listing.id}`}
                                  onClick={() => trackListingClick(listing.id, listing.practice_name, '/')}
                                  className="px-4 sm:px-5 py-2.5 sm:py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors text-center font-semibold text-xs sm:text-sm md:text-base whitespace-nowrap shadow-md hover:shadow-lg min-w-[120px] sm:min-w-[140px]"
                                >
                                  View Profile
                                </Link>
                                {listing.show_phone_publicly && listing.phone && (
                                  <a
                                    href={`tel:${listing.phone}`}
                                    onClick={() => trackLinkClick(`tel:${listing.phone}`, 'Call Now', '/')}
                                    className="px-4 sm:px-5 py-2.5 sm:py-3 bg-white border-2 border-gray-300 text-gray-900 rounded-xl hover:bg-gray-50 transition-colors text-center font-semibold text-xs sm:text-sm md:text-base whitespace-nowrap min-w-[120px] sm:min-w-[140px]"
                                  >
                                    Call Now
                                  </a>
                                )}
                              </>
                            ) : (
                              <>
                                {listing.email && (
                                  <a
                                    href={`mailto:${listing.email}`}
                                    onClick={() => trackLinkClick(`mailto:${listing.email}`, listing.email || 'Email', '/')}
                                    className="px-4 sm:px-5 py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-center font-semibold text-xs sm:text-sm md:text-base break-all sm:whitespace-nowrap min-w-[120px] sm:min-w-[140px]"
                                  >
                                    {listing.email}
                                  </a>
                                )}
                                {listing.phone && (
                                  <a
                                    href={`tel:${listing.phone}`}
                                    onClick={() => trackLinkClick(`tel:${listing.phone}`, listing.phone || 'Phone', '/')}
                                    className="px-4 sm:px-5 py-2.5 sm:py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors text-center font-semibold text-xs sm:text-sm md:text-base whitespace-nowrap shadow-md hover:shadow-lg min-w-[120px] sm:min-w-[140px]"
                                  >
                                    {listing.phone}
                                  </a>
                                )}
                                {!listing.email && !listing.phone && (
                                  <span className="px-4 sm:px-5 py-2.5 sm:py-3 bg-gray-50 text-gray-500 rounded-xl text-center text-xs sm:text-sm md:text-base whitespace-nowrap min-w-[120px] sm:min-w-[140px]">
                                    Standard Listing
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Bottom Section: Additional Features with proper padding */}
                        <div className="pl-0 sm:pl-0 pt-4 border-t border-gray-200">
                          {/* Bio/Description - Only for featured listings */}
                          {listing.is_featured && listing.bio && (
                            <p className="text-xs sm:text-sm md:text-base text-gray-700 mb-3 leading-relaxed line-clamp-2">
                              {listing.bio}
                            </p>
                          )}
                          
                          {/* Specialties - Only for featured listings */}
                          {listing.is_featured && listing.specialties.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
                              {listing.specialties.slice(0, 5).map(spec => (
                                <span key={spec} className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 text-xs sm:text-sm rounded-full font-medium whitespace-nowrap">
                                  {spec}
                                </span>
                              ))}
                              {listing.specialties.length > 5 && (
                                <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 text-xs sm:text-sm rounded-full font-medium">
                                  + more
                                </span>
                              )}
                            </div>
                          )}
                          
                          {/* Location and Telehealth */}
                          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-primary-500 flex-shrink-0" />
                            <span>{listing.location}</span>
                            {listing.is_featured && listing.is_telehealth && (
                              <>
                                <span className="mx-1">•</span>
                                <Video className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 flex-shrink-0" />
                                <span>Telehealth</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredListings.length)} of {filteredListings.length} listings
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={goToPreviousPage}
                          disabled={currentPage === 1}
                          className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                            currentPage === 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-600 border border-gray-200 shadow-sm hover:shadow-md'
                          }`}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </button>
                        
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                            // Show first page, last page, current page, and pages around current
                            if (
                              page === 1 ||
                              page === totalPages ||
                              (page >= currentPage - 1 && page <= currentPage + 1)
                            ) {
                              return (
                                <button
                                  key={page}
                                  onClick={() => goToPage(page)}
                                  className={`w-10 h-10 rounded-xl font-semibold transition-all ${
                                    currentPage === page
                                      ? 'bg-primary-500 text-white shadow-md'
                                      : 'bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-600 border border-gray-200'
                                  }`}
                                >
                                  {page}
                                </button>
                              )
                            } else if (page === currentPage - 2 || page === currentPage + 2) {
                              return (
                                <span key={page} className="px-2 text-gray-400">
                                  ...
                                </span>
                              )
                            }
                            return null
                          })}
                        </div>

                        <button
                          onClick={goToNextPage}
                          disabled={currentPage === totalPages}
                          className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                            currentPage === totalPages
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-600 border border-gray-200 shadow-sm hover:shadow-md'
                          }`}
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Safety Plan Banner - Above Resources Section */}
      <section className="py-6 sm:py-8 md:py-10">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-5xl">
          <div className="bg-gradient-to-r from-emerald-500 via-primary-500 to-emerald-600 rounded-2xl p-6 shadow-xl border-2 border-emerald-400">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="bg-white rounded-full p-3 shadow-lg">
                  <Shield className="w-8 h-8 text-emerald-600 fill-emerald-600" />
                </div>
                <div className="text-left">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Create Your Personal Safety Plan</h2>
                  <p className="text-emerald-50 text-sm md:text-base">A proven, evidence-based tool to help you navigate through difficult moments. Build your personalised plan with coping strategies, support contacts, and crisis resources, all in one secure place.</p>
                </div>
              </div>
              <Link 
                to="/crisis-support" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-600 rounded-lg font-bold hover:bg-emerald-50 transition-colors shadow-lg hover:shadow-xl whitespace-nowrap"
              >
                <Shield className="w-5 h-5" />
                Start Building Your Plan
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Preview Section */}
      <section 
        className="py-12 sm:py-16 md:py-20 bg-white relative"
        style={(settings['home_resources_background'] && settings['home_resources_background'].trim()) ? {
          backgroundImage: `url(${settings['home_resources_background'].trim()})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        } : {}}
      >
        {(settings['home_resources_background'] && settings['home_resources_background'].trim()) && (
          <div className="absolute inset-0 bg-white/85 backdrop-blur-sm"></div>
        )}
        <div className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-7xl">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-gray-900 px-2">
              {settings['home_heading_resources'] || 'Mental Health Insights & Resources'}
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto mb-4 sm:mb-6 px-2">
              {settings['home_description_resources'] || 'Expert guides on finding support and growing your practice in Tasmania.'}
            </p>
            <Link 
              to="/events"
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors shadow-md hover:shadow-lg text-sm sm:text-base"
            >
              View Upcoming Events
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 max-w-6xl mx-auto">
            <article className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-100">
              <img 
                src="/images/resource-ocean.jpg" 
                alt="Calm turquoise ocean water ripples, nature therapy concept" 
                className="w-full h-48 sm:h-64 object-cover"
              />
              <div className="p-4 sm:p-6">
                <span className="inline-block px-2 sm:px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs sm:text-sm font-semibold mb-2 sm:mb-3">
                  For People Seeking Support
                </span>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900">How to Choose the Right Mental Health Professional in Tasmania</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 leading-relaxed">
                  Finding the right match is crucial for effective therapy. Whether you need anxiety counselling in Tasmania or are looking to find a social worker in Tasmania, understanding the difference between psychologists, psychiatrists, and counsellors is the first step.
                </p>
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 leading-relaxed">
                  We guide you through checking credentials, understanding therapeutic approaches like CBT or ACT, and how to find mental health support in Tasmania that aligns with your personal needs and goals.
                </p>
                <Link to="/resources/choosing-professional" className="text-primary-600 font-semibold hover:text-primary-700 inline-flex items-center gap-2 text-sm sm:text-base">
                  Read Full Guide
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Link>
              </div>
            </article>

            <article className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-100">
              <img 
                src="/images/resource-forest.jpg" 
                alt="Peaceful lush green forest ferns in Tasmania" 
                className="w-full h-48 sm:h-64 object-cover"
              />
              <div className="p-4 sm:p-6">
                <span className="inline-block px-2 sm:px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs sm:text-sm font-semibold mb-2 sm:mb-3">
                  For Professionals & Clinics
                </span>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900">Why Mental Health Professionals Should List in Local Directories</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 leading-relaxed">
                  Are you looking to grow your private practice in Hobart or expand your reach? Joining a dedicated mental health directory for clinicians significantly boosts your local SEO and visibility.
                </p>
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 leading-relaxed">
                  Learn how to get mental health clients in Tasmania by ensuring your practice appears when locals search for "psychologists near me" or specific services like sleep therapy in Hobart. <strong>List your practice for free</strong> in Tasmania today to connect with those who need you most. <strong>Free directory listing</strong> with no hidden fees.
                </p>
                <Link to="/get-listed" className="text-emerald-600 font-semibold hover:text-emerald-700 inline-flex items-center gap-2 text-sm sm:text-base">
                  List Your Practice Free
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Link>
              </div>
            </article>
          </div>
        </div>
        </div>
      </section>


      {/* About Section - Enhanced */}
      <section className="relative py-16 sm:py-20 md:py-24 lg:py-28 overflow-hidden">
        {/* Background with gradient and pattern */}
        {(settings['home_about_background'] && settings['home_about_background'].trim()) ? (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${settings['home_about_background'].trim()})`
            }}
          ></div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-primary-100/50"></div>
        )}
        {(settings['home_about_background'] && settings['home_about_background'].trim()) && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm"></div>
        )}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-400 rounded-full blur-3xl"></div>
        </div>
        
        {/* Decorative shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary-200/20 rounded-full blur-2xl hidden lg:block"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary-300/20 rounded-full blur-2xl hidden lg:block"></div>
        
        <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-6xl relative z-10">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-14 md:mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-gray-900">
              {settings['home_heading_connecting'] || 'Connecting You with Mental Health Professionals Across Tasmania'}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-primary-400 mx-auto rounded-full"></div>
          </div>

          {/* Content */}
          <div className="text-base sm:text-lg text-gray-700 leading-relaxed space-y-6">
            <p>
                    {settings['home_description_connecting'] || "Welcome to Tasmania's premier resource for mental wellbeing. Our mission is to bridge the gap between those seeking help and the dedicated professionals who provide it. Whether you are searching for experienced psychologists in Hobart, compassionate counsellors in Tasmania, or specialised psychiatrists in Launceston, our directory is designed to help you find the right support close to home."}
                  </p>
            
                  <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">
                    {settings['home_heading_comprehensive'] || 'Comprehensive Support for Every Need'}
                  </h3>
            <p>
                    {settings['home_description_comprehensive'] || "We understand that mental health needs are diverse. That's why we list a wide range of professionals. From sleep therapy in Hobart for those struggling with insomnia, to anxiety counselling in Tasmania for stress management, and trauma-informed care for deeper healing. You can also find a social worker in Tasmania who specialises in complex case management and family support."}
                  </p>
            <p>
                    Our directory covers all major regions, ensuring access to mental health support in Tasmania whether you are in the city centres of Hobart and Launceston, or in regional hubs like Devonport, Burnie, and Ulverstone.
                  </p>
            
                  <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">
                    {settings['home_heading_clinicians'] || 'For Clinicians: Grow Your Practice'}
                  </h3>
            <p>
                    {settings['home_description_clinicians'] ? (
                      <span dangerouslySetInnerHTML={{ __html: sanitizeHTMLWithSafeTags(settings['home_description_clinicians']) }} />
                    ) : (
                      <>If you are a practitioner, visibility is key to helping more people. By choosing to <strong>list your practice for free</strong> in Tasmania on our platform, you join a trusted community of providers. We help you advertise psychology services in Tasmania directly to the people who are actively searching for them. <strong>Free listing</strong> for all qualified mental health professionals.</>
                    )}
                  </p>
            <p>
                    This is the effective way to grow your private practice in Hobart or expand your client base in regional areas. Learn how to get mental health clients in Tasmania by leveraging our SEO-optimised online directory for mental health professionals. Join us today and make your services accessible to all Tasmanians.
                  </p>
          </div>
        </div>
      </section>
    </div>
  )
}
