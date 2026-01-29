import { Calendar, Mail, Bell, User, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { sendEmail, getEmailTemplate } from '../lib/email'

export function Events() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/20 to-gray-50">
      {/* Main Content */}
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Community Events
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Discover workshops, support groups, and mental health seminars happening across Tasmania.
            </p>
          </div>

          {/* Coming Soon Card */}
          <div className="bg-white rounded-2xl shadow-lg mb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-primary-400 to-primary-500"></div>
            <div className="p-8 sm:p-12 h-full">
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
                      disabled={loading}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
          </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Subscribing...
                      </>
                    ) : (
                      <>
                        <Bell className="w-5 h-5" />
                        Notify Me
                      </>
                    )}
                  </button>
                </form>

                {/* Success Message */}
                {success && (
                  <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl text-center">
                    <p className="text-green-800 font-semibold">
                      ✓ Thank you for subscribing! We'll notify you when events launch.
                    </p>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-center">
                    <p className="text-red-800 font-semibold">{error}</p>
                      </div>
                )}
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
