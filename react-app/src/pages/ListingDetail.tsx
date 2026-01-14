import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Listing } from '../types'
import { 
  MapPin, Phone, Mail, Globe, Star, Shield, ArrowLeft, 
  CheckCircle2, Building2, Video
} from 'lucide-react'

export function ListingDetail() {
  const { id } = useParams<{ id: string }>()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchListing()
    }
  }, [id])

  const fetchListing = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .eq('status', 'approved')
        .single()

      if (error) throw error
      setListing(data)
    } catch (error) {
      console.error('Error fetching listing:', error)
      // Try sample data if database fails
      const sampleListing: Listing = {
        id: id || '1',
        user_id: '1',
        practice_name: 'Somnus Psychology',
        email: 'info@somnuspsychology.com.au',
        phone: '0362 926 056',
        website: 'https://somnuspsychology.com.au',
        profession: 'Psychology Clinic',
        practice_type: 'group_practice',
        specialties: ['Sleep', 'Anxiety', 'Neuromodulation', 'Depression', 'Trauma'],
        location: 'Hobart',
        postcode: '7000',
        street_address: '123 Main Street',
        is_telehealth: true,
        is_rural_outreach: false,
        is_statewide_telehealth: false,
        bio: 'Somnus Psychology supports sleep and emotional wellbeing through CBT-I and individual therapy. The clinic is recognised as a local leader in neuromodulation, offering non invasive tDCS for depression, anxiety and mood based concerns.',
        status: 'approved',
        is_featured: true,
        show_name_publicly: true,
        show_email_publicly: true,
        show_phone_publicly: true,
        show_website_publicly: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setListing(sampleListing)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Listing not found</h2>
          <Link to="/" className="text-primary-600 hover:text-primary-700">
            Return to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Directory
          </Link>

          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
              {/* Logo/Icon */}
              <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 border-2 border-white/20">
                <Building2 className="w-12 h-12 text-white" />
              </div>

              {/* Title Section */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h1 className="text-4xl md:text-5xl font-bold">{listing.practice_name}</h1>
                  {listing.is_featured && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-sm font-bold">
                      <Star className="w-4 h-4 fill-yellow-900" />
                      Featured Partner
                    </div>
                  )}
                </div>
                <p className="text-xl text-white/90 mb-2">{listing.profession}</p>
                <p className="text-lg text-white/80 mb-4">
                  {listing.bio || 'Clinic specialising in personalised mental health care and wellbeing.'}
                </p>
                <div className="flex flex-wrap gap-3 mb-6">
                  {listing.is_featured && (
                    <span className="px-3 py-1 bg-primary-600/50 backdrop-blur-sm rounded-lg text-sm font-semibold border border-primary-400/50">
                      ★ Premium Provider
                    </span>
                  )}
                  {listing.is_telehealth && (
                    <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-lg text-sm font-semibold border border-white/20 flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      Telehealth Available
                    </span>
                  )}
                </div>
                <a
                  href={`tel:${listing.phone}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-xl"
                >
                  Request Appointment →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="md:col-span-2 space-y-8">
              {/* About the Practice */}
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary-600" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">About the Practice</h2>
                </div>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {listing.bio || 'No description available.'}
                </p>
              </div>

              {/* Areas of Expertise */}
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Areas of Expertise</h2>
                <div className="flex flex-wrap gap-3">
                  {listing.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-primary-50 text-primary-700 rounded-xl font-semibold border border-primary-200"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Service Features */}
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Service Features</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {listing.is_telehealth && (
                    <div className="flex items-center gap-3 p-4 bg-primary-50 rounded-xl">
                      <Video className="w-6 h-6 text-primary-600" />
                      <span className="font-semibold text-gray-900">Telehealth Services</span>
                    </div>
                  )}
                  {listing.is_statewide_telehealth && (
                    <div className="flex items-center gap-3 p-4 bg-primary-50 rounded-xl">
                      <Globe className="w-6 h-6 text-primary-600" />
                      <span className="font-semibold text-gray-900">Statewide Telehealth</span>
                    </div>
                  )}
                  {listing.is_rural_outreach && (
                    <div className="flex items-center gap-3 p-4 bg-primary-50 rounded-xl">
                      <MapPin className="w-6 h-6 text-primary-600" />
                      <span className="font-semibold text-gray-900">Rural Outreach</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-4 bg-primary-50 rounded-xl">
                    <CheckCircle2 className="w-6 h-6 text-primary-600" />
                    <span className="font-semibold text-gray-900">Verified Professional</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Contact Info */}
            <div className="md:col-span-1">
              <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl shadow-xl p-6 md:p-8 text-white sticky top-24">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-300 rounded-full"></div>
                  Contact Info
                </h2>
                <div className="space-y-6">
                  {listing.street_address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold mb-1">LOCATION</p>
                        <p className="text-white/90">
                          {listing.street_address}, {listing.location} {listing.postcode}
                        </p>
                      </div>
                    </div>
                  )}
                  {listing.show_phone_publicly && listing.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold mb-1">PHONE</p>
                        <a href={`tel:${listing.phone}`} className="text-white/90 hover:text-white transition-colors">
                          {listing.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {listing.show_email_publicly && listing.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold mb-1">EMAIL</p>
                        <a href={`mailto:${listing.email}`} className="text-white/90 hover:text-white transition-colors break-all">
                          {listing.email}
                        </a>
                      </div>
                    </div>
                  )}
                  {listing.show_website_publicly && listing.website && (
                    <div className="flex items-start gap-3">
                      <Globe className="w-5 h-5 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold mb-1">WEBSITE</p>
                        <a 
                          href={listing.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-white/90 hover:text-white transition-colors break-all"
                        >
                          {listing.website}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-8 pt-6 border-t border-white/20">
                  <a
                    href={`tel:${listing.phone}`}
                    className="block w-full text-center px-6 py-3 bg-white text-primary-600 rounded-xl font-semibold hover:bg-primary-50 transition-all transform hover:scale-105"
                  >
                    Call Now
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
