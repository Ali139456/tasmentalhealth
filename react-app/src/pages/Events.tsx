import { Calendar, Mail, Bell, MessageCircle, MapPin, Clock, ExternalLink, Sparkles, Users, DollarSign, Tag as TagIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { sendEmail, getEmailTemplate } from '../lib/email'
import { format } from 'date-fns'
import { useContentSettings } from '../hooks/useContentSettings'
import { SEO } from '../components/SEO'

export function Events() {
  const { settings } = useContentSettings()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [allEvents, setAllEvents] = useState<any[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [activeTab, setActiveTab] = useState<'incoming' | 'ongoing' | 'ended'>('incoming')
  const [currentPage, setCurrentPage] = useState(1)
  const eventsPerPage = 6

  // Filter events based on active tab
  const getFilteredEvents = () => {
    const now = new Date()
    return allEvents.filter(event => {
      const eventDate = new Date(event.event_date)
      const endDate = event.event_end_date ? new Date(event.event_end_date) : null

      if (activeTab === 'incoming') {
        // Events where start date is in the future
        return eventDate > now
      } else if (activeTab === 'ongoing') {
        // Events that have started but not ended
        return eventDate <= now && (endDate === null || endDate >= now)
      } else if (activeTab === 'ended') {
        // Events that have ended
        return eventDate < now && (endDate !== null && endDate < now)
      }
      return false
    })
  }

  const filteredEvents = getFilteredEvents()

  const handleNotifyMe = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      // Check if email already exists
      const { data: existing } = await supabase
        .from('event_subscriptions')
        .select('id, is_active')
        .eq('email', email.toLowerCase().trim())
        .single()

      if (existing) {
        if (existing.is_active) {
          setError('This email is already subscribed to event notifications.')
          setLoading(false)
          return
        } else {
          // Reactivate subscription
          const { error: updateError } = await supabase
            .from('event_subscriptions')
            .update({ 
              is_active: true,
              subscribed_at: new Date().toISOString(),
              unsubscribed_at: null
            })
            .eq('email', email.toLowerCase().trim())

          if (updateError) throw updateError
        }
      } else {
        // Create new subscription
        const { error: insertError } = await supabase
          .from('event_subscriptions')
          .insert({
            email: email.toLowerCase().trim(),
            is_active: true
          })

        if (insertError) throw insertError
      }

      // Send confirmation email to user
      try {
        const userName = email.split('@')[0]
        const template = getEmailTemplate('event_subscription', {
          email: email.toLowerCase().trim(),
          userName,
          appUrl: window.location.origin
        })

        await sendEmail({
          to: email.toLowerCase().trim(),
          subject: template.subject,
          html: template.html
        })
      } catch (emailErr) {
        console.error('Failed to send confirmation email:', emailErr)
        // Don't fail the subscription if email fails
      }

      // Send notification to admin
      try {
        await sendEmail({
          to: 'info@tasmentalhealthdirectory.com.au',
          subject: `New Event Subscription: ${email}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                .content { padding: 20px; background: #f9f9f9; }
                .info-box { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #2563eb; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2 style="margin: 0;">New Event Subscription</h2>
                </div>
                <div class="content">
                  <div class="info-box">
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Subscribed At:</strong> ${new Date().toLocaleString('en-AU')}</p>
                  </div>
                  <p>A new user has subscribed to event notifications.</p>
                </div>
              </div>
            </body>
            </html>
          `
        })
      } catch (adminEmailErr) {
        console.error('Failed to send admin notification:', adminEmailErr)
        // Don't fail the subscription if admin email fails
      }

      setSuccess(true)
      setEmail('')
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 5000)
    } catch (err: any) {
      console.error('Subscription error:', err)
      setError(err.message || 'Failed to subscribe. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Fetch published events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('is_published', true)
          .order('event_date', { ascending: true })

        if (error) throw error
        setAllEvents(data || [])
      } catch (err) {
        console.error('Error fetching events:', err)
      } finally {
        setLoadingEvents(false)
      }
    }

    fetchEvents()

    // Subscribe to real-time changes
    const channel = supabase
      .channel('events-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
          filter: 'is_published=eq.true'
        },
        (payload) => {
          console.log('Event change detected:', payload)
          fetchEvents()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Reset to page 1 when tab changes
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab])

  // Get event type color - using theme colors only
  const getEventTypeColor = () => {
    return 'from-primary-500 to-primary-600'
  }

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://tasmentalhealthdirectory.com.au'
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: 'Community Mental Health Events',
    description: 'Discover workshops, support groups, and mental health seminars happening across Tasmania',
    url: `${siteUrl}/events`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-primary-100/40">
      <SEO
        title="Mental Health Events & Workshops | Tasmanian Mental Health Directory"
        description="Discover workshops, support groups, and mental health seminars happening across Tasmania. Stay updated on upcoming mental health events."
        keywords="mental health events Tasmania, workshops, support groups, seminars, mental health training, community events"
        image="/images/hero-mountain.jpg"
        structuredData={structuredData}
      />
      {/* Hero Section with Background Image */}
      <section className="hero-section relative text-white py-12 sm:py-16 md:py-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: (settings['events_hero_background'] && settings['events_hero_background'].trim())
              ? `url(${settings['events_hero_background'].trim()})`
              : 'linear-gradient(to bottom right, #f9fafb, #ecfdf5, #d1fae5)'
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-teal-950/80 to-teal-800/40"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 bg-primary-200/20 rounded-full blur-3xl"></div>
              </div>
              <div className="relative">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-6 shadow-lg">
                  <Calendar className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                  Community Events
                </h1>
                <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
                  Discover workshops, support groups, and mental health seminars happening across Tasmania.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
        <div className="max-w-6xl mx-auto">
          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-white rounded-xl p-1.5 shadow-lg border border-gray-200">
              <button
                onClick={() => setActiveTab('incoming')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'incoming'
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Incoming Events
              </button>
              <button
                onClick={() => setActiveTab('ongoing')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'ongoing'
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Ongoing Events
              </button>
              <button
                onClick={() => setActiveTab('ended')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'ended'
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Ended Events
              </button>
            </div>
          </div>

          {/* Email Subscription Form - Always Visible */}
          <div className="mb-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl shadow-xl p-6 sm:p-8 border border-primary-400">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 w-full">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="w-5 h-5 text-white" />
                  <h3 className="text-lg font-bold text-white">Stay Updated</h3>
                </div>
                <p className="text-primary-100 text-sm mb-4 sm:mb-0">
                  Get notified when new events are added or when events start/end
                </p>
              </div>
              <form onSubmit={handleNotifyMe} className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:min-w-[280px]">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-3 border-2 border-white/20 bg-white/90 rounded-xl focus:outline-none focus:border-white focus:bg-white text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed placeholder-gray-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary-600 rounded-xl font-semibold hover:bg-primary-50 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                      Subscribing...
                    </>
                  ) : (
                    <>
                      <Bell className="w-5 h-5" />
                      Subscribe
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                <p className="text-green-800 font-semibold text-center">
                  ✓ Thank you for subscribing! We'll notify you when events are added or updated.
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-orange-50 border-2 border-orange-200 rounded-xl">
                <p className="text-orange-800 font-semibold text-center">{error}</p>
              </div>
            )}
          </div>

          {/* Events List */}
          <div 
            className="relative rounded-3xl shadow-xl p-8 sm:p-12 md:p-16 border border-gray-100"
            style={(settings['events_list_background'] && settings['events_list_background'].trim()) ? {
              backgroundImage: `url(${settings['events_list_background'].trim()})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            } : {
              backgroundColor: 'white'
            }}
          >
            {(settings['events_list_background'] && settings['events_list_background'].trim()) && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-3xl"></div>
            )}
            <div className="relative z-10">
          {loadingEvents ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-6 shadow-lg">
                <Calendar className="w-10 h-10 text-white animate-pulse" />
              </div>
              <p className="text-gray-600 text-lg font-semibold">Loading events...</p>
            </div>
          ) : filteredEvents.length > 0 ? (
            <>
              {/* Events Grid - 2 columns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {filteredEvents
                  .slice((currentPage - 1) * eventsPerPage, currentPage * eventsPerPage)
                  .map((event) => (
                <div 
                  key={event.id} 
                  className={`group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border ${
                    activeTab === 'ended' 
                      ? 'border-gray-200 hover:border-gray-300 opacity-75' 
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  {/* Gradient Accent Bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                    activeTab === 'ended' 
                      ? 'bg-gradient-to-r from-gray-400 to-gray-500' 
                      : `bg-gradient-to-r ${getEventTypeColor()}`
                  }`}></div>
                  
                  <div className="relative p-6 sm:p-7">
                    {/* Header Section */}
                    <div className="flex items-start gap-4 mb-5">
                      <div className={`flex-shrink-0 w-14 h-14 ${
                        activeTab === 'ended' 
                          ? 'bg-gradient-to-br from-gray-400 to-gray-500' 
                          : `bg-gradient-to-br ${getEventTypeColor()}`
                      } rounded-xl flex items-center justify-center shadow-md`}>
                        <Calendar className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className={`text-xl sm:text-2xl font-bold leading-tight transition-colors ${
                            activeTab === 'ended' 
                              ? 'text-gray-700' 
                              : 'text-gray-900 group-hover:text-primary-600'
                          }`}>
                            {event.title}
                          </h3>
                          <span className={`flex-shrink-0 px-3 py-1.5 text-xs font-semibold rounded-full ${
                            activeTab === 'ended'
                              ? 'bg-gray-200 text-gray-700'
                              : 'bg-primary-100 text-primary-700'
                          }`}>
                            {event.event_type?.charAt(0).toUpperCase() + event.event_type?.slice(1) || 'Event'}
                          </span>
                        </div>
                        {event.description && (
                          <p className={`text-sm leading-relaxed ${
                            activeTab === 'ended' ? 'text-gray-500' : 'text-gray-600'
                          }`}>
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                      {/* Date & Time */}
                      <div className={`flex items-start gap-2.5 p-3 rounded-lg border ${
                        activeTab === 'ended' 
                          ? 'bg-gray-50 border-gray-200' 
                          : 'bg-primary-50 border-primary-100'
                      }`}>
                        <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
                          activeTab === 'ended' 
                            ? 'bg-gray-300' 
                            : 'bg-primary-500'
                        }`}>
                          <Clock className={`w-4.5 h-4.5 ${
                            activeTab === 'ended' ? 'text-gray-600' : 'text-white'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
                            activeTab === 'ended' ? 'text-gray-500' : 'text-primary-600'
                          }`}>Date & Time</p>
                          <p className={`text-sm font-bold ${
                            activeTab === 'ended' ? 'text-gray-700' : 'text-gray-900'
                          }`}>
                            {format(new Date(event.event_date), 'MMM dd, yyyy')}
                            <br />
                            {format(new Date(event.event_date), 'h:mm a')}
                            {event.event_end_date && (
                              <> - {format(new Date(event.event_end_date), 'h:mm a')}</>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Location */}
                      <div className={`flex items-start gap-2.5 p-3 rounded-lg border ${
                        activeTab === 'ended' 
                          ? 'bg-gray-50 border-gray-200' 
                          : 'bg-primary-50 border-primary-100'
                      }`}>
                        <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
                          activeTab === 'ended' 
                            ? 'bg-gray-300' 
                            : 'bg-primary-500'
                        }`}>
                          <MapPin className={`w-4.5 h-4.5 ${
                            activeTab === 'ended' ? 'text-gray-600' : 'text-white'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
                            activeTab === 'ended' ? 'text-gray-500' : 'text-primary-600'
                          }`}>Location</p>
                          <p className={`text-sm font-bold truncate ${
                            activeTab === 'ended' ? 'text-gray-700' : 'text-gray-900'
                          }`}>{event.location}</p>
                        </div>
                      </div>

                      {/* Cost */}
                      {event.cost && (
                        <div className={`flex items-start gap-2.5 p-3 rounded-lg border ${
                          activeTab === 'ended' 
                            ? 'bg-gray-50 border-gray-200' 
                            : 'bg-primary-50 border-primary-100'
                        }`}>
                          <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
                            activeTab === 'ended' 
                              ? 'bg-gray-300' 
                              : 'bg-primary-500'
                          }`}>
                            <DollarSign className={`w-4.5 h-4.5 ${
                              activeTab === 'ended' ? 'text-gray-600' : 'text-white'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
                              activeTab === 'ended' ? 'text-gray-500' : 'text-primary-600'
                            }`}>Cost</p>
                            <p className={`text-sm font-bold ${
                              activeTab === 'ended' ? 'text-gray-700' : 'text-gray-900'
                            }`}>{event.cost}</p>
                          </div>
                        </div>
                      )}

                      {/* Organiser */}
                      {event.organizer_name && (
                        <div className={`flex items-start gap-2.5 p-3 rounded-lg border ${
                          activeTab === 'ended' 
                            ? 'bg-gray-50 border-gray-200' 
                            : 'bg-primary-50 border-primary-100'
                        }`}>
                          <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
                            activeTab === 'ended' 
                              ? 'bg-gray-300' 
                              : 'bg-primary-500'
                          }`}>
                            <Users className={`w-4.5 h-4.5 ${
                              activeTab === 'ended' ? 'text-gray-600' : 'text-white'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
                              activeTab === 'ended' ? 'text-gray-500' : 'text-primary-600'
                            }`}>Organized by</p>
                            <p className={`text-sm font-bold truncate ${
                              activeTab === 'ended' ? 'text-gray-700' : 'text-gray-900'
                            }`}>{event.organizer_name}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {event.tags && event.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 mb-5">
                        <TagIcon className={`w-4 h-4 ${
                          activeTab === 'ended' ? 'text-gray-400' : 'text-primary-500'
                        }`} />
                        {event.tags.map((tag: string, idx: number) => (
                          <span
                            key={idx}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                              activeTab === 'ended'
                                ? 'bg-gray-100 text-gray-600 border-gray-300'
                                : 'bg-primary-50 text-primary-700 border-primary-200'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Register Button */}
                    {event.registration_url && (
                      <a
                        href={event.registration_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group/btn inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg w-full ${
                          activeTab === 'ended'
                            ? 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                            : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700'
                        }`}
                      >
                        <ExternalLink className={`w-4 h-4 ${
                          activeTab === 'ended' ? '' : 'group-hover/btn:translate-x-1'
                        } transition-transform`} />
                        Register Now
                      </a>
                    )}
                  </div>
                </div>
                  ))}
              </div>

              {/* Pagination */}
              {filteredEvents.length > eventsPerPage && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white border-2 border-primary-200 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-600 font-semibold">
                    Page {currentPage} of {Math.ceil(filteredEvents.length / eventsPerPage)}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredEvents.length / eventsPerPage), prev + 1))}
                    disabled={currentPage >= Math.ceil(filteredEvents.length / eventsPerPage)}
                    className="px-4 py-2 bg-white border-2 border-primary-200 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-3xl shadow-xl mb-8 relative overflow-hidden border border-gray-100">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary-500 via-primary-400 to-primary-500"></div>
              <div className="relative p-8 sm:p-12 lg:p-16">
                <div className="text-center max-w-2xl mx-auto">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl mb-6 shadow-lg">
                    <Calendar className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                    {activeTab === 'incoming' && 'No Incoming Events'}
                    {activeTab === 'ongoing' && 'No Ongoing Events'}
                    {activeTab === 'ended' && 'No Ended Events'}
                  </h2>
                  <p className="text-lg text-gray-600 max-w-xl mx-auto">
                    {activeTab === 'incoming' && "Check back soon for upcoming mental health events. Subscribe to get notified when new events are added."}
                    {activeTab === 'ongoing' && "There are no events currently happening at this time."}
                    {activeTab === 'ended' && "No past events to display."}
                  </p>
                </div>
              </div>
            </div>
          )}
            </div>
          </div>

          {/* Partner with Us Card */}
          <div className="mt-16 bg-gradient-to-br from-white via-primary-50/30 to-white rounded-3xl shadow-xl p-8 sm:p-12 lg:p-16 border border-primary-100 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-200/20 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-primary-100/20 to-transparent rounded-full blur-3xl"></div>
            
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary-500" />
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Partner with Us
                </h3>
              </div>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Are you an organisation, clinician, or community group planning a mental health event? We'd love to collaborate. Reach out to discuss liaising opportunities, event listings, or working together to support the Tasmanian community.
              </p>
              <a
                href="mailto:info@tasmentalhealthdirectory.com.au"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl font-bold hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Contact Team
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
