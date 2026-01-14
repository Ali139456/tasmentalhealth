import { Calendar, MapPin, Clock, ExternalLink, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Event {
  id: string
  title: string
  date: string
  time: string
  location: string
  description: string
  category: string
  link?: string
}

// Events will be loaded from database
const EVENTS: Event[] = []

export function Events() {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-AU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Training': 'bg-blue-100 text-blue-700 border-blue-200',
      'Conference': 'bg-purple-100 text-purple-700 border-purple-200',
      'Workshop': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Seminar': 'bg-orange-100 text-orange-700 border-orange-200',
      'Forum': 'bg-pink-100 text-pink-700 border-pink-200'
    }
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/20 to-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white py-16 sm:py-20 md:py-24 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6 shadow-xl">
              <Calendar className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Upcoming Events
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 max-w-2xl mx-auto">
              Professional development, training, and networking opportunities for mental health professionals across Tasmania.
            </p>
          </div>
        </div>
      </section>

      {/* Events List */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        {EVENTS.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Upcoming Events</h2>
            <p className="text-gray-600">Check back soon for upcoming events and training opportunities.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {EVENTS.map(event => (
              <div
                key={event.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden border border-gray-100 flex flex-col"
              >
                {/* Event Header */}
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(event.category)} bg-white text-primary-700`}>
                      {event.category}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 leading-tight">
                    {event.title}
                  </h3>
                </div>

                {/* Event Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Date</p>
                        <p className="text-gray-900">{formatDate(event.date)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Time</p>
                        <p className="text-gray-900">{event.time}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Location</p>
                        <p className="text-gray-900">{event.location}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-6 flex-1 leading-relaxed">
                    {event.description}
                  </p>

                  {event.link && (
                    <a
                      href={event.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-all shadow-md hover:shadow-lg text-sm"
                    >
                      Learn More
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-2xl p-8 sm:p-12 text-center text-white overflow-hidden relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Have an Event to Share?</h2>
            <p className="text-lg sm:text-xl text-white/90 mb-8">
              Are you organizing a mental health event, training, or conference in Tasmania? Let us know and we can help promote it.
            </p>
            <Link
              to="/get-listed"
              className="inline-flex items-center gap-3 px-8 sm:px-10 py-4 sm:py-5 bg-white text-primary-600 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105"
            >
              Contact Us
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
