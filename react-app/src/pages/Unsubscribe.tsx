import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export function Unsubscribe() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'not_found'>('loading')
  const [message, setMessage] = useState('')
  const email = searchParams.get('email')

  useEffect(() => {
    const unsubscribe = async () => {
      if (!email) {
        setStatus('error')
        setMessage('No email address provided. Please use the unsubscribe link from your email.')
        return
      }

      try {
        // Check if subscription exists
        const { data: subscription, error: checkError } = await supabase
          .from('event_subscriptions')
          .select('id, is_active')
          .eq('email', email.toLowerCase().trim())
          .maybeSingle()

        if (checkError) {
          throw checkError
        }

        if (!subscription) {
          setStatus('not_found')
          setMessage('This email address is not subscribed to event notifications.')
          return
        }

        if (!subscription.is_active) {
          setStatus('success')
          setMessage('You are already unsubscribed from event notifications.')
          return
        }

        // Unsubscribe the user
        const { error: updateError } = await supabase
          .from('event_subscriptions')
          .update({
            is_active: false,
            unsubscribed_at: new Date().toISOString()
          })
          .eq('email', email.toLowerCase().trim())

        if (updateError) {
          throw updateError
        }

        setStatus('success')
        setMessage('You have been successfully unsubscribed from event notifications. You will no longer receive event notifications from the Tasmanian Mental Health Directory.')
      } catch (error: any) {
        console.error('Error unsubscribing:', error)
        setStatus('error')
        setMessage('An error occurred while unsubscribing. Please try again later or contact support.')
      }
    }

    unsubscribe()
  }, [email])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 sm:p-10 text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Unsubscribing...</h1>
            <p className="text-gray-600">Please wait while we process your request.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto mb-4 w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Unsubscribed Successfully</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Link
                to="/events"
                className="inline-block w-full px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors"
              >
                View Events Page
              </Link>
              <Link
                to="/"
                className="inline-block w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Go to Homepage
              </Link>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Link
                to="/events"
                className="inline-block w-full px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors"
              >
                Go to Events Page
              </Link>
              <a
                href="mailto:info@tasmentalhealthdirectory.com.au"
                className="inline-block w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Contact Support
              </a>
            </div>
          </>
        )}

        {status === 'not_found' && (
          <>
            <div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Not Subscribed</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Link
                to="/events"
                className="inline-block w-full px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors"
              >
                View Events Page
              </Link>
              <Link
                to="/"
                className="inline-block w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Go to Homepage
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
