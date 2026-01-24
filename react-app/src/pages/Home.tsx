import { Link } from 'react-router-dom'
import { Search, MapPin, Filter, Star, CheckCircle2, ArrowRight, ChevronLeft, ChevronRight, Plus, Printer, FileSpreadsheet, Video } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Listing } from '../types'
import { LOCATIONS, SPECIALTIES, PROFESSIONS } from '../lib/constants'
import { SAMPLE_LISTINGS } from '../lib/sampleListings'

const LISTINGS_PER_PAGE = 4

export function Home() {
  const [listings, setListings] = useState<Listing[]>([])
  const [filteredListings, setFilteredListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    keywords: '',
    location: 'All Locations',
    specialty: '',
    practiceType: 'all',
    profession: '',
    telehealth: false,
    statewideTelehealth: false,
    ruralOutreach: false,
    featured: false,
    verified: false
  })

  useEffect(() => {
    fetchListings()
  }, [])

  useEffect(() => {
    filterListings()
    setCurrentPage(1) // Reset to first page when filters change
  }, [listings, filters])

  const fetchListings = async () => {
    // Show sample data immediately for instant UI
    setListings(SAMPLE_LISTINGS)
    setLoading(false)

    // Then fetch from database in background
    try {
      // Try to get from cache first
      const cacheKey = 'listings_cache'
      const cacheTime = 'listings_cache_time'
      const cached = sessionStorage.getItem(cacheKey)
      const cacheTimestamp = sessionStorage.getItem(cacheTime)
      
      // Use cache if less than 5 minutes old
      if (cached && cacheTimestamp) {
        const age = Date.now() - parseInt(cacheTimestamp)
        if (age < 5 * 60 * 1000) { // 5 minutes
          try {
            const cachedListings = JSON.parse(cached)
            updateListings(cachedListings)
            return // Use cached data, skip fetch
          } catch (e) {
            // Cache corrupted, continue to fetch
          }
        }
      }

      // Fetch with timeout
      const queryPromise = supabase
        .from('listings')
        .select('*')
        .eq('status', 'approved')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(100) // Limit results for faster query

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout')), 3000)
      )

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any

      if (error) {
        console.error('Error fetching listings:', error)
        return // Keep sample data
      }

      // Process and update listings
      const dbListings = data || []
      updateListings(dbListings)
      
      // Cache the result
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(dbListings))
        sessionStorage.setItem(cacheTime, Date.now().toString())
      } catch (e) {
        // Cache failed, ignore
      }
    } catch (error) {
      console.error('Error fetching listings:', error)
      // Keep sample data on error
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

  const filterListings = () => {
    let filtered = [...listings]

    if (filters.keywords) {
      const keywords = filters.keywords.toLowerCase()
      filtered = filtered.filter(listing =>
        listing.practice_name.toLowerCase().includes(keywords) ||
        listing.profession.toLowerCase().includes(keywords) ||
        listing.bio?.toLowerCase().includes(keywords) ||
        listing.specialties.some(s => s.toLowerCase().includes(keywords))
      )
    }

    if (filters.location !== 'All Locations') {
      filtered = filtered.filter(listing =>
        listing.location === filters.location ||
        (filters.location === 'Statewide (Telehealth)' && listing.is_statewide_telehealth) ||
        (filters.location === 'Telehealth' && listing.is_telehealth)
      )
    }

    if (filters.specialty) {
      filtered = filtered.filter(listing =>
        listing.specialties.includes(filters.specialty)
      )
    }

    if (filters.practiceType !== 'all') {
      filtered = filtered.filter(listing =>
        listing.practice_type === filters.practiceType
      )
    }

    if (filters.profession) {
      filtered = filtered.filter(listing =>
        listing.profession === filters.profession
      )
    }

    if (filters.telehealth) {
      filtered = filtered.filter(listing =>
        listing.is_telehealth === true
      )
    }

    if (filters.statewideTelehealth) {
      filtered = filtered.filter(listing =>
        listing.is_statewide_telehealth === true
      )
    }

    if (filters.ruralOutreach) {
      filtered = filtered.filter(listing =>
        listing.is_rural_outreach === true
      )
    }

    if (filters.featured) {
      filtered = filtered.filter(listing =>
        listing.is_featured === true
      )
    }

    if (filters.verified) {
      filtered = filtered.filter(listing =>
        listing.ahpra_number && listing.ahpra_number.trim() !== ''
      )
    }

    setFilteredListings(filtered)
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Background Image */}
      <section className="relative text-white overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/images/hero-mountain.jpg)'
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-teal-950/80 to-teal-800/40"></div>
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 lg:py-28 xl:py-32 relative z-10 max-w-7xl">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 sm:mb-8 md:mb-10 leading-tight">
              Tasmania's Mental Health Directory - Connecting You to the Right Support
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 md:mb-10 text-white/90 max-w-3xl mx-auto px-4">
              Search for trusted mental health professionals across Hobart, Launceston, and beyond - or list your clinic, private practice, or mental health service to grow your visibility.
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
                className="w-full sm:w-auto min-w-[200px] sm:min-w-[220px] px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-primary-50 transition-all transform hover:scale-105 shadow-lg inline-flex items-center justify-center gap-2 text-sm sm:text-base md:text-lg"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                List Your Practice
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Two Column Section - Enhanced Design */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-7xl">
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 xl:gap-12">
            <div className="pr-6 sm:pr-8 md:pr-10 lg:pr-12 border-r border-gray-300">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-gray-900">For People Seeking Support</h2>
              <p className="text-gray-700 mb-4 sm:mb-6 text-base sm:text-lg leading-relaxed">
                Navigating mental health care can be overwhelming. We make it easier to find compassionate help. Whether you are looking for psychologists in Hobart, need anxiety counselling in Tasmania, or want to find a social worker in Tasmania, our directory connects you with verified local experts.
              </p>
              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                <li className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm sm:text-base">Locate specialists near you: Easily search for psychiatrists in Launceston, Devonport, or Burnie.</span>
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

            <div className="pl-6 sm:pl-8 md:pl-10 lg:pl-12">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-gray-900">For Professionals & Clinics</h2>
              <p className="text-gray-700 mb-4 sm:mb-6 text-base sm:text-lg leading-relaxed">
                Are you ready to grow your private practice in Hobart or statewide? Join Tasmania's dedicated online directory for mental health professionals. We help you advertise psychology services in Tasmania effectively to patients actively seeking care.
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
                  <span className="text-gray-700">Professional SEO: List your mental health practice in Tasmania on a high-authority site designed for clinicians.</span>
                </li>
              </ul>
              <Link 
                to="/get-listed" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors shadow-md hover:shadow-lg"
              >
                List Your Practice Now
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Directory Section - Enhanced */}
      <section id="directory" className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-7xl">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 text-gray-900 px-2">Find Mental Health Support in Tasmania</h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto px-2">
              Use the filters below to find psychologists, counsellors, and other specialists in your area.
            </p>
          </div>
          </div>

        {/* Full width container for grid to allow screen-edge margin */}
        <div className="w-full">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-7xl">
            <div className="grid lg:grid-cols-5 gap-0">
            {/* Filters Sidebar */}
              <aside className="lg:col-span-2 w-full lg:w-auto">
                <div className="relative bg-gradient-to-br from-white via-primary-50/30 to-white p-4 sm:p-5 md:p-6 lg:p-7 rounded-2xl lg:rounded-3xl shadow-2xl lg:sticky lg:top-24 border-2 border-primary-100/50 backdrop-blur-sm overflow-hidden w-full lg:w-[370px]">
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
                        className="w-full lg:max-w-[350px] pl-8 pr-3 py-2 border-2 border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all text-sm bg-white/90 shadow-sm hover:shadow-md"
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
                    <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2 sm:mb-3 uppercase">Select Location (e.g. Hobart)</label>
                    <div className="relative">
                      <MapPin className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-primary-400 w-3 h-3 z-10 pointer-events-none" />
                      <select
                        value={filters.location}
                        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                        className="w-full lg:max-w-[350px] pl-8 pr-3 py-2 border-2 border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 appearance-none bg-white/90 shadow-sm hover:shadow-md text-sm cursor-pointer"
                      >
                        {LOCATIONS.map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-2xl border border-primary-100/50 shadow-md hover:shadow-lg transition-all w-full">
                    <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2 sm:mb-3">Specialties</label>
                    <div className="space-y-2">
                    <select
                      value={filters.specialty}
                      onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
                        className="w-full lg:max-w-[350px] px-3 py-2 border-2 border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 bg-white/90 shadow-sm hover:shadow-md text-sm cursor-pointer transition-all"
                    >
                        <option value="">Select specialties below...</option>
                      {SPECIALTIES.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                      <button
                        type="button"
                        className="w-full px-3 py-2 border-2 border-primary-300 rounded-lg text-primary-600 hover:bg-primary-50 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
                      >
                        <Search className="w-3 h-3" />
                        Search specialties...
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-2xl border border-primary-100/50 shadow-md hover:shadow-lg transition-all w-full">
                    <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2 sm:mb-3">Professional Role</label>
                    <div className="space-y-2">
                    <select
                      value={filters.profession}
                      onChange={(e) => setFilters({ ...filters, profession: e.target.value })}
                        className="w-full lg:max-w-[350px] px-3 py-2 border-2 border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 bg-white/90 shadow-sm hover:shadow-md text-sm cursor-pointer transition-all"
                    >
                        <option value="">Select professional role...</option>
                      {PROFESSIONS.map(prof => (
                        <option key={prof} value={prof}>{prof}</option>
                      ))}
                    </select>
                      <button
                        type="button"
                        className="w-full px-3 py-2 border-2 border-primary-300 rounded-lg text-primary-600 hover:bg-primary-50 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
                      >
                        <Plus className="w-3 h-3" />
                        Add Professional Role...
                      </button>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Results - Enhanced Cards */}
            <div className="lg:col-span-3 w-full">
              <div className="lg:w-[calc(100%+150px)]">
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
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">No matches found</h3>
                  <p className="text-gray-600 text-base sm:text-lg">
                    We couldn't find any professionals matching your current filters.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex justify-between items-center mb-4 sm:mb-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                      Results <span className="text-primary-600">{filteredListings.length} found</span>
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.print()}
                        className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700 flex items-center gap-2"
                      >
                        <Printer className="w-4 h-4" />
                        Print
                      </button>
                      <button
                        onClick={() => {
                          // Generate CSV
                          const headers = ['Practice Name', 'Profession', 'Location', 'Email', 'Phone', 'Website']
                          const rows = filteredListings.map(l => [
                            l.practice_name,
                            l.profession,
                            l.location,
                            l.show_email_publicly ? l.email : '',
                            l.show_phone_publicly ? l.phone : '',
                            l.show_website_publicly ? l.website || '' : ''
                          ])
                          const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
                          const blob = new Blob([csv], { type: 'text/csv' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = 'listings.csv'
                          a.click()
                          URL.revokeObjectURL(url)
                        }}
                        className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700 flex items-center gap-2"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        CSV
                      </button>
                    </div>
                  </div>
                  {paginatedListings.map(listing => (
                    <div
                      key={listing.id}
                      className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border-l-4 overflow-hidden ${
                        listing.is_featured ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-white' : 'border-primary-500'
                      }`}
                    >
                      <div className="p-4 sm:p-6">
                        <div className="flex gap-4 sm:gap-6">
                          {/* Left: Avatar/Logo - Only for featured listings */}
                          {listing.is_featured && listing.avatar_url && (
                            <div className="flex-shrink-0 relative">
                              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border-2 border-gray-200 shadow-md">
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
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-yellow-400 to-yellow-500 px-2 py-1 text-center">
                                <span className="text-yellow-900 font-bold text-xs">FEATURED</span>
                              </div>
                            </div>
                          )}

                          {/* Center: Clinic Information */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                              <h4 className="text-xl sm:text-2xl font-bold text-gray-900">{listing.practice_name}</h4>
                              {listing.is_featured && (
                                <>
                                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                  <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm font-semibold">
                                    Verified
                                  </span>
                                </>
                              )}
                            </div>
                            <p className="text-sm sm:text-base text-primary-600 font-medium mb-2">{listing.profession}</p>
                            
                            {/* Show bio/description only for featured listings */}
                            {listing.is_featured && listing.bio && (
                              <p className="text-sm sm:text-base text-gray-700 mb-3 leading-relaxed line-clamp-2">{listing.bio}</p>
                            )}
                            
                            {/* Show specialties only for featured listings */}
                            {listing.is_featured && listing.specialties.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
                                {listing.specialties.slice(0, 5).map(spec => (
                                  <span key={spec} className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 text-xs sm:text-sm rounded-full font-medium">
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
                            
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4 text-primary-500" />
                              <span>{listing.location}</span>
                              {listing.is_featured && listing.is_telehealth && (
                                <>
                                  <span className="mx-1">•</span>
                                  <Video className="w-4 h-4 text-emerald-600" />
                                  <span>Telehealth</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Right: Action Buttons - Stacked vertically */}
                          <div className="flex-shrink-0 flex flex-col gap-2 sm:gap-3">
                            {listing.is_featured ? (
                              <>
                                <Link
                                  to={`/listing/${listing.id}`}
                                  className="px-4 sm:px-5 py-2.5 sm:py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors text-center font-semibold text-sm sm:text-base whitespace-nowrap shadow-md hover:shadow-lg"
                                >
                                  View Profile
                                </Link>
                                {listing.show_phone_publicly && listing.phone && (
                                  <a
                                    href={`tel:${listing.phone}`}
                                    className="px-4 sm:px-5 py-2.5 sm:py-3 bg-white border-2 border-gray-300 text-gray-900 rounded-xl hover:bg-gray-50 transition-colors text-center font-semibold text-sm sm:text-base whitespace-nowrap"
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
                                    className="px-4 sm:px-5 py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-center font-semibold text-sm sm:text-base whitespace-nowrap"
                                  >
                                    {listing.email}
                                  </a>
                                )}
                                {listing.phone && (
                                  <a
                                    href={`tel:${listing.phone}`}
                                    className="px-4 sm:px-5 py-2.5 sm:py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors text-center font-semibold text-sm sm:text-base whitespace-nowrap shadow-md hover:shadow-lg"
                                  >
                                    {listing.phone}
                                  </a>
                                )}
                                {!listing.email && !listing.phone && (
                                  <span className="px-4 sm:px-5 py-2.5 sm:py-3 bg-gray-50 text-gray-500 rounded-xl text-center text-sm sm:text-base whitespace-nowrap">
                                    Standard Listing
                                  </span>
                                )}
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

      {/* Resources Preview Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-7xl">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-gray-900 px-2">Mental Health Insights & Resources</h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto mb-4 sm:mb-6 px-2">
              Expert guides on finding support and growing your practice in Tasmania.
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
                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-gray-900">How to Choose the Right Mental Health Professional in Tasmania</h3>
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
                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-gray-900">Why Mental Health Professionals Should List in Local Directories</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 leading-relaxed">
                  Are you looking to grow your private practice in Hobart or expand your reach? Joining a dedicated mental health directory for clinicians significantly boosts your local SEO and visibility.
                </p>
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 leading-relaxed">
                  Learn how to get mental health clients in Tasmania by ensuring your practice appears when locals search for "psychologists near me" or specific services like sleep therapy in Hobart. List your mental health practice in Tasmania today to connect with those who need you most.
                </p>
                <Link to="/get-listed" className="text-emerald-600 font-semibold hover:text-emerald-700 inline-flex items-center gap-2 text-sm sm:text-base">
                  List Your Practice
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* About Section - Enhanced */}
      <section className="relative py-16 sm:py-20 md:py-24 lg:py-28 overflow-hidden">
        {/* Background with gradient and pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-primary-100/50"></div>
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
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gray-900">
              Connecting You with Mental Health Professionals Across Tasmania
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-primary-400 mx-auto rounded-full"></div>
          </div>

          {/* Content */}
          <div className="text-base sm:text-lg text-gray-700 leading-relaxed space-y-6">
            <p>
                    Welcome to Tasmania's premier resource for mental wellbeing. Our mission is to bridge the gap between those seeking help and the dedicated professionals who provide it. Whether you are searching for experienced psychologists in Hobart, compassionate counsellors in Tasmania, or specialised psychiatrists in Launceston, our directory is designed to help you find the right support close to home.
                  </p>
            
                  <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900">Comprehensive Support for Every Need</h3>
            <p>
                    We understand that mental health needs are diverse. That's why we list a wide range of professionals. From sleep therapy in Hobart for those struggling with insomnia, to anxiety counselling in Tasmania for stress management, and trauma-informed care for deeper healing. You can also find a social worker in Tasmania who specialises in complex case management and family support.
                  </p>
            <p>
                    Our directory covers all major regions, ensuring access to mental health support in Tasmania whether you are in the city centres of Hobart and Launceston, or in regional hubs like Devonport, Burnie, and Ulverstone.
                  </p>
            
                  <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900">For Clinicians: Grow Your Practice</h3>
            <p>
                    If you are a practitioner, visibility is key to helping more people. By choosing to list your mental health practice in Tasmania on our platform, you join a trusted community of providers. We help you advertise psychology services in Tasmania directly to the people who are actively searching for them.
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
