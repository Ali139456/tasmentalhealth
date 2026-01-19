import { Link } from 'react-router-dom'
import { Search, MapPin, Phone, Mail, ExternalLink, Filter, Star, CheckCircle2, ArrowRight, Heart, Users, Shield, TrendingUp, ChevronLeft, ChevronRight, Video, Radio, BadgeCheck, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Listing } from '../types'
import { LOCATIONS, SPECIALTIES, PROFESSIONS } from '../lib/constants'
import { SAMPLE_LISTINGS } from '../lib/sampleListings'

const LISTINGS_PER_PAGE = 3

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
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'approved')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data && data.length > 0) {
        setListings(data)
      } else {
        // Use sample data if no database listings
        setListings(SAMPLE_LISTINGS)
      }
    } catch (error) {
      console.error('Error fetching listings:', error)
      // Use sample data on error
      setListings(SAMPLE_LISTINGS)
    } finally {
      setLoading(false)
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
      <section className="relative bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80)'
          }}
        ></div>
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 lg:py-28 xl:py-32 relative z-10 max-w-7xl">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
              Tasmania's Mental Health Directory
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-3 sm:mb-4 text-primary-100 font-light">
              Connecting You to the Right Support
            </p>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 md:mb-10 text-white/90 max-w-3xl mx-auto px-4">
              Search for trusted mental health professionals across Hobart, Launceston, and beyond - or list your clinic, private practice, or mental health service to grow your visibility.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
              <a 
                href="#directory" 
                className="w-full sm:w-auto min-w-[200px] sm:min-w-[220px] px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-primary-50 transition-all transform hover:scale-105 shadow-lg inline-flex items-center justify-center gap-2 text-sm sm:text-base md:text-lg"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                Find a Professional
              </a>
              <Link 
                to="/get-listed" 
                className="w-full sm:w-auto min-w-[200px] sm:min-w-[220px] px-6 sm:px-8 py-3 sm:py-4 bg-primary-700 text-white rounded-xl font-semibold hover:bg-primary-800 transition-all transform hover:scale-105 shadow-lg inline-flex items-center justify-center gap-2 border-2 border-white/20 text-sm sm:text-base md:text-lg"
              >
                List Your Practice
                <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Two Column Section - Enhanced Design */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-7xl">
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 xl:gap-12">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 p-6 sm:p-8 md:p-10 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-primary-200">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-500 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <Search className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
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
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors shadow-md hover:shadow-lg text-sm sm:text-base"
              >
                Start Your Search
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 sm:p-8 md:p-10 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-emerald-200">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <Star className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
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
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-md hover:shadow-lg"
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
        <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-7xl">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 text-gray-900 px-2">Find Mental Health Support in Tasmania</h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto px-2">
              Use the filters below to find psychologists, counsellors, and other specialists in your area.
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
            {/* Filters Sidebar */}
            <aside className="lg:col-span-1">
              <div className="relative bg-gradient-to-br from-white via-primary-50/30 to-white p-5 sm:p-6 md:p-7 rounded-3xl shadow-2xl lg:sticky lg:top-24 border-2 border-primary-100/50 backdrop-blur-sm overflow-hidden">
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

                  <div className="space-y-5 sm:space-y-6">
                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-primary-100/50 shadow-md hover:shadow-lg transition-all">
                    <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Search className="w-4 h-4 text-primary-500" />
                      Keywords
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-primary-400 w-4 h-4 sm:w-5 sm:h-5 z-10" />
                      <input
                        type="text"
                        placeholder="Name, condition, therapy..."
                        value={filters.keywords}
                        onChange={(e) => setFilters({ ...filters, keywords: e.target.value })}
                        className="w-full pl-10 sm:pl-12 pr-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all text-sm sm:text-base bg-white/90 shadow-sm hover:shadow-md"
                      />
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-primary-100/50 shadow-md hover:shadow-lg transition-all">
                    <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-3">Listing Category</label>
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

                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-primary-100/50 shadow-md hover:shadow-lg transition-all">
                    <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary-500" />
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-primary-400 w-4 h-4 sm:w-5 sm:h-5 z-10 pointer-events-none" />
                      <select
                        value={filters.location}
                        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                        className="w-full pl-10 sm:pl-12 pr-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 appearance-none bg-white/90 shadow-sm hover:shadow-md text-sm sm:text-base cursor-pointer"
                      >
                        {LOCATIONS.map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-primary-100/50 shadow-md hover:shadow-lg transition-all">
                    <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-3">Specialties</label>
                    <select
                      value={filters.specialty}
                      onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 bg-white/90 shadow-sm hover:shadow-md text-sm sm:text-base cursor-pointer transition-all"
                    >
                      <option value="">All Specialties</option>
                      {SPECIALTIES.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-primary-100/50 shadow-md hover:shadow-lg transition-all">
                    <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-3">Professional Role</label>
                    <select
                      value={filters.profession}
                      onChange={(e) => setFilters({ ...filters, profession: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 bg-white/90 shadow-sm hover:shadow-md text-sm sm:text-base cursor-pointer transition-all"
                    >
                      <option value="">All Professional Roles</option>
                      {PROFESSIONS.map(prof => (
                        <option key={prof} value={prof}>{prof}</option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/30 p-4 rounded-2xl border-2 border-emerald-200/50 shadow-md hover:shadow-lg transition-all">
                    <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <div className="p-1 bg-emerald-500 rounded-lg">
                        <Video className="w-3 h-3 text-white" />
                      </div>
                      Service Options
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer group p-2.5 rounded-xl bg-white/60 hover:bg-white/80 transition-all">
                        <input
                          type="checkbox"
                          checked={filters.telehealth}
                          onChange={(e) => setFilters({ ...filters, telehealth: e.target.checked })}
                          className="w-5 h-5 text-primary-600 border-2 border-primary-300 rounded-md focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 cursor-pointer"
                        />
                        <div className="flex items-center gap-2.5 flex-1">
                          <Video className="w-4 h-4 text-emerald-600 group-hover:text-emerald-700 transition-colors" />
                          <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-emerald-700 transition-colors">Telehealth Available</span>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group p-2.5 rounded-xl bg-white/60 hover:bg-white/80 transition-all">
                        <input
                          type="checkbox"
                          checked={filters.statewideTelehealth}
                          onChange={(e) => setFilters({ ...filters, statewideTelehealth: e.target.checked })}
                          className="w-5 h-5 text-primary-600 border-2 border-primary-300 rounded-md focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 cursor-pointer"
                        />
                        <div className="flex items-center gap-2.5 flex-1">
                          <Radio className="w-4 h-4 text-emerald-600 group-hover:text-emerald-700 transition-colors" />
                          <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-emerald-700 transition-colors">Statewide Telehealth</span>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group p-2.5 rounded-xl bg-white/60 hover:bg-white/80 transition-all">
                        <input
                          type="checkbox"
                          checked={filters.ruralOutreach}
                          onChange={(e) => setFilters({ ...filters, ruralOutreach: e.target.checked })}
                          className="w-5 h-5 text-primary-600 border-2 border-primary-300 rounded-md focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 cursor-pointer"
                        />
                        <div className="flex items-center gap-2.5 flex-1">
                          <MapPin className="w-4 h-4 text-emerald-600 group-hover:text-emerald-700 transition-colors" />
                          <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-emerald-700 transition-colors">Rural Outreach</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-50/50 to-amber-50/30 p-4 rounded-2xl border-2 border-yellow-200/50 shadow-md hover:shadow-lg transition-all">
                    <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <div className="p-1 bg-yellow-500 rounded-lg">
                        <Star className="w-3 h-3 text-white" />
                      </div>
                      Listing Features
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer group p-2.5 rounded-xl bg-white/60 hover:bg-white/80 transition-all">
                        <input
                          type="checkbox"
                          checked={filters.featured}
                          onChange={(e) => setFilters({ ...filters, featured: e.target.checked })}
                          className="w-5 h-5 text-yellow-600 border-2 border-yellow-300 rounded-md focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 cursor-pointer"
                        />
                        <div className="flex items-center gap-2.5 flex-1">
                          <Sparkles className="w-4 h-4 text-yellow-600 group-hover:text-yellow-700 transition-colors" />
                          <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-yellow-700 transition-colors">Featured Listings Only</span>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group p-2.5 rounded-xl bg-white/60 hover:bg-white/80 transition-all">
                        <input
                          type="checkbox"
                          checked={filters.verified}
                          onChange={(e) => setFilters({ ...filters, verified: e.target.checked })}
                          className="w-5 h-5 text-emerald-600 border-2 border-emerald-300 rounded-md focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 cursor-pointer"
                        />
                        <div className="flex items-center gap-2.5 flex-1">
                          <BadgeCheck className="w-4 h-4 text-emerald-600 group-hover:text-emerald-700 transition-colors" />
                          <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-emerald-700 transition-colors">Verified Professionals</span>
                        </div>
                      </label>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Results - Enhanced Cards */}
            <div className="lg:col-span-3">
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
                      Results <span className="text-primary-600">({filteredListings.length} found)</span>
                    </h3>
                  </div>
                  {paginatedListings.map(listing => (
                    <div
                      key={listing.id}
                      className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border-l-4 overflow-hidden ${
                        listing.is_featured ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-white' : 'border-primary-500'
                      }`}
                    >
                      {listing.is_featured && (
                        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-2">
                          <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-900 fill-yellow-900" />
                          <span className="text-yellow-900 font-bold text-xs sm:text-sm">FEATURED LISTING</span>
                        </div>
                      )}
                      <div className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 sm:mb-4 gap-3">
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                              <h4 className="text-xl sm:text-2xl font-bold text-gray-900">{listing.practice_name}</h4>
                              <span className="px-2 sm:px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs sm:text-sm font-semibold self-start">
                                {listing.profession}
                              </span>
                            </div>
                            {listing.bio && (
                              <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 leading-relaxed">{listing.bio}</p>
                            )}
                            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                              {listing.specialties.slice(0, 6).map(spec => (
                                <span key={spec} className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 text-xs sm:text-sm rounded-full font-medium">
                                  {spec}
                                </span>
                              ))}
                              {listing.specialties.length > 6 && (
                                <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 text-xs sm:text-sm rounded-full font-medium">
                                  +{listing.specialties.length - 6} more
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600">
                              <span className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />
                                <span className="font-medium">{listing.location}</span>
                              </span>
                              {listing.is_telehealth && (
                                <span className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                                  <span className="font-medium">Telehealth Available</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200">
                          <Link
                            to={`/listing/${listing.id}`}
                            className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors text-center font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm sm:text-base"
                          >
                            View Profile
                          </Link>
                          {listing.show_phone_publicly && listing.phone && (
                            <a
                              href={`tel:${listing.phone}`}
                              className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors text-center font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm sm:text-base"
                            >
                              <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                              Call Now
                            </a>
                          )}
                          {listing.show_email_publicly && listing.email && (
                            <a
                              href={`mailto:${listing.email}`}
                              className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-center font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
                            >
                              <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                              Email
                            </a>
                          )}
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
                src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80" 
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
                src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80" 
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
          {/* Header with icon */}
          <div className="text-center mb-12 sm:mb-14 md:mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-xl mb-6">
              <Heart className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gray-900">
              Connecting You with Mental Health Professionals Across Tasmania
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-primary-400 mx-auto rounded-full"></div>
          </div>

          {/* Content Cards */}
          <div className="space-y-8 sm:space-y-10">
            {/* Welcome Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 md:p-10 shadow-xl border border-primary-100 hover:shadow-2xl transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                    Welcome to Tasmania's premier resource for mental wellbeing. Our mission is to bridge the gap between those seeking help and the dedicated professionals who provide it. Whether you are searching for experienced psychologists in Hobart, compassionate counsellors in Tasmania, or specialised psychiatrists in Launceston, our directory is designed to help you find the right support close to home.
                  </p>
                </div>
              </div>
            </div>

            {/* Comprehensive Support Card */}
            <div className="bg-gradient-to-br from-primary-50 to-white rounded-2xl p-6 sm:p-8 md:p-10 shadow-xl border border-primary-200 hover:shadow-2xl transition-all">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900">Comprehensive Support for Every Need</h3>
                  <p className="text-base sm:text-lg text-gray-700 mb-4 leading-relaxed">
                    We understand that mental health needs are diverse. That's why we list a wide range of professionals. From sleep therapy in Hobart for those struggling with insomnia, to anxiety counselling in Tasmania for stress management, and trauma-informed care for deeper healing. You can also find a social worker in Tasmania who specialises in complex case management and family support.
                  </p>
                  <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                    Our directory covers all major regions, ensuring access to mental health support in Tasmania whether you are in the city centres of Hobart and Launceston, or in regional hubs like Devonport, Burnie, and Ulverstone.
                  </p>
                </div>
              </div>
            </div>

            {/* For Clinicians Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 md:p-10 shadow-xl border border-primary-100 hover:shadow-2xl transition-all">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900">For Clinicians: Grow Your Practice</h3>
                  <p className="text-base sm:text-lg text-gray-700 mb-4 leading-relaxed">
                    If you are a practitioner, visibility is key to helping more people. By choosing to list your mental health practice in Tasmania on our platform, you join a trusted community of providers. We help you advertise psychology services in Tasmania directly to the people who are actively searching for them.
                  </p>
                  <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                    This is the effective way to grow your private practice in Hobart or expand your client base in regional areas. Learn how to get mental health clients in Tasmania by leveraging our SEO-optimised online directory for mental health professionals. Join us today and make your services accessible to all Tasmanians.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
