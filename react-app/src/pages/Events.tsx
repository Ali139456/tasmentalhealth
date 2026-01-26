import { Calendar, Mail, Bell, User, MessageCircle } from 'lucide-react'
import { useState } from 'react'

export function Events() {
  const [email, setEmail] = useState('')

  const handleNotifyMe = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement email subscription
    console.log('Subscribe email:', email)
    alert('Thank you for subscribing! We\'ll notify you when events launch.')
    setEmail('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/20 to-gray-50">
      {/* Main Content */}
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              Community Events
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Discover workshops, support groups, and mental health seminars happening across Tasmania.
            </p>
          </div>

          {/* Coming Soon Card */}
          <div className="relative rounded-2xl shadow-lg mb-8 overflow-hidden" style={{
            background: 'linear-gradient(to right, rgb(20 184 166), rgb(34 211 238), rgb(168 85 247))',
            padding: '2px'
          }}>
            <div className="bg-white rounded-2xl p-8 sm:p-12 h-full">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-6">
                  <Calendar className="w-10 h-10 text-primary-600" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  Coming Soon
                </h2>
                <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
                  We are working hard to bring you a comprehensive calendar of mental health events. Subscribe to get notified when we launch.
                </p>
                
                {/* Email Subscription Form */}
                <form onSubmit={handleNotifyMe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <div className="relative flex-1">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 text-gray-900"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-md hover:shadow-lg"
                  >
                    <Bell className="w-5 h-5" />
                    Notify Me
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Partner with Us Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="flex-shrink-0">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full">
                  <User className="w-8 h-8 text-primary-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  Partner with Us
                </h3>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Are you an organisation, clinician, or community group planning a mental health event? We'd love to collaborate. Reach out to discuss liaising opportunities, event listings, or working together to support the Tasmanian community.
                </p>
                <a
                  href="mailto:info@tasmentalhealthdirectory.com.au"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-all shadow-md hover:shadow-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  Contact Team
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
