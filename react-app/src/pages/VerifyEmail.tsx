import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export function VerifyEmail() {
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [hasVerified, setHasVerified] = useState(false) // Prevent multiple verifications

  useEffect(() => {
    // Prevent multiple executions
    if (hasVerified) return

    const verifyEmail = async () => {
      try {
        // First, check for error parameters in hash (Supabase redirects with errors)
        const hash = window.location.hash
        if (hash) {
          const hashParams = new URLSearchParams(hash.substring(1))
          const error = hashParams.get('error')
          const errorCode = hashParams.get('error_code')
          const errorDescription = hashParams.get('error_description')
          
          if (error || errorCode) {
            // Handle expired or invalid link
            if (errorCode === 'otp_expired' || error === 'access_denied') {
              const errorMsg = errorDescription 
                ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
                : 'This verification link has expired. Please request a new one.'
              setError(errorMsg)
              setLoading(false)
              return
            }
          }
        }

        // Try to get token from query params first
        let token = searchParams.get('token')
        let type = searchParams.get('type')

        // If not in query params, check hash fragment (Supabase sometimes puts it there)
        if (!token && hash) {
          const hashParams = new URLSearchParams(hash.substring(1)) // Remove the #
          token = hashParams.get('token') || hashParams.get('access_token') || hashParams.get('token_hash')
          type = hashParams.get('type') || type
        }

        // Also check if Supabase redirected with tokens in hash (format: #access_token=...&type=...)
        if (!token && window.location.hash) {
          const hashMatch = window.location.hash.match(/[#&]token=([^&]+)/) || 
                           window.location.hash.match(/[#&]access_token=([^&]+)/) ||
                           window.location.hash.match(/[#&]token_hash=([^&]+)/)
          if (hashMatch) {
            token = decodeURIComponent(hashMatch[1])
          }
        }

        if (!token) {
          setError('Invalid verification link. Missing token.')
          setLoading(false)
          return
        }

        console.log('Verifying email with token:', token.substring(0, 20) + '...', 'type:', type)

        // Verify the token using Supabase
        // Magiclink tokens from generateLink should be used as token_hash
        // The token from the URL is the token_hash value
        let verificationData = null
        let verificationError = null

        // Get current user email if available (for fallback)
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        const userEmail = currentUser?.email

        // Try with token_hash first (this is the correct format for magiclink)
        if (type === 'magiclink' || type === 'email' || !type) {
          console.log('Attempting verification with token_hash...')
          const result1 = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'email',
          })

          if (!result1.error && result1.data?.user) {
            verificationData = result1.data
            verificationError = null
          } else if (userEmail) {
            // If token_hash fails and we have email, try with plain token + email
            console.log('Token_hash failed, trying plain token with email...', result1.error?.message)
            const result2 = await supabase.auth.verifyOtp({
              token: token,
              type: 'email',
              email: userEmail,
            })
            verificationData = result2.data
            verificationError = result2.error
          } else {
            verificationData = result1.data
            verificationError = result1.error
          }
        } else if (type === 'signup') {
          // For signup type, try token_hash first
          const result1 = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup',
          })

          if (!result1.error && result1.data?.user) {
            verificationData = result1.data
            verificationError = null
          } else if (userEmail) {
            // Try with plain token + email
            const result2 = await supabase.auth.verifyOtp({
              token: token,
              type: 'signup',
              email: userEmail,
            })
            verificationData = result2.data
            verificationError = result2.error
          } else {
            verificationData = result1.data
            verificationError = result1.error
          }
        }

        // If verification failed, check if user already has a session (Supabase might have auto-verified via redirect)
        if (verificationError) {
          console.log('OTP verification failed, checking for existing session...')
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          
          if (session?.user && !sessionError) {
            // User is already authenticated (Supabase auto-verified via redirect)
            console.log('User already has session, email may already be verified')
            verificationData = { user: session.user }
            verificationError = null
          } else {
            console.error('Verification error:', verificationError)
            throw new Error(verificationError.message || 'Invalid or expired verification link')
          }
        }

        if (verificationData?.user) {
          console.log('Email verified successfully:', verificationData.user.email)
          
          // Prevent duplicate processing
          if (hasVerified) {
            setLoading(false)
            return
          }
          
          setHasVerified(true)
          
          // Update email_verified in users table
          const { error: updateError } = await supabase
            .from('users')
            .update({ email_verified: true })
            .eq('id', verificationData.user.id)

          if (updateError) {
            console.error('Error updating email_verified:', updateError)
            // Don't fail if this update fails - Supabase auth is already verified
          }

          setSuccess(true)
          
          // Show toast only once with a unique ID to prevent duplicates
          toast.success('Email verified successfully!', { id: 'email-verified' })
          
          // Refresh user data
          await refreshUser()
          
          // Redirect to dashboard with verification flag
          setTimeout(() => {
            navigate('/dashboard?verified=true')
          }, 2000)
        } else {
          throw new Error('Verification failed. Please try again.')
        }
      } catch (err: any) {
        console.error('Email verification error:', err)
        setError(err.message || 'Failed to verify email. Please try again.')
        toast.error(err.message || 'Failed to verify email')
      } finally {
        setLoading(false)
      }
    }

    verifyEmail()
  }, [searchParams, navigate, refreshUser, hasVerified])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Your Email</h2>
          <p className="text-gray-600">Please wait while we verify your email address...</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
          <p className="text-gray-600 mb-6">Your email address has been successfully verified. Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  const handleResendVerification = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) {
        toast.error('Please log in first to resend verification email')
        navigate('/login')
        return
      }

      toast.loading('Sending verification email...', { id: 'resend-verification' })
      
      const { error: functionError } = await supabase.functions.invoke('send-verification-email', {
        body: { email: user.email }
      })
      
      if (functionError) {
        toast.error('Failed to send verification email. Please try again.', { id: 'resend-verification' })
      } else {
        toast.success('Verification email sent! Check your inbox.', { id: 'resend-verification' })
      }
    } catch (err: any) {
      console.error('Error resending verification email:', err)
      toast.error('Failed to send verification email. Please try again.', { id: 'resend-verification' })
    }
  }

  if (error) {
    const isExpired = error.toLowerCase().includes('expired') || error.toLowerCase().includes('invalid')
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
          <AlertCircle className="w-16 h-16 text-orange-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          {isExpired && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800 mb-3">
                Verification links expire after 24 hours for security reasons.
              </p>
              <button
                onClick={handleResendVerification}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-semibold"
              >
                Request New Verification Email
              </button>
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
