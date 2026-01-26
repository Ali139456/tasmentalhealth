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

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token')
        const type = searchParams.get('type')

        if (!token) {
          setError('Invalid verification link. Missing token.')
          setLoading(false)
          return
        }

        console.log('Verifying email with token:', token.substring(0, 20) + '...', 'type:', type)

        // Verify the token using Supabase
        // Magiclink tokens from generateLink can be plain tokens or token_hash
        // Try both methods to handle different token formats
        let verificationData = null
        let verificationError = null

        // Try with token_hash first (for hashed tokens)
        if (type === 'magiclink' || type === 'email' || !type) {
          console.log('Attempting verification with token_hash...')
          const result1 = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'email',
          })

          if (!result1.error && result1.data?.user) {
            verificationData = result1.data
            verificationError = null
          } else {
            // If token_hash fails, try with plain token
            console.log('Token_hash failed, trying plain token...', result1.error?.message)
            const result2 = await supabase.auth.verifyOtp({
              token: token,
              type: 'email',
            })
            verificationData = result2.data
            verificationError = result2.error
          }
        } else if (type === 'signup') {
          // For signup type, try both formats
          const result1 = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup',
          })

          if (!result1.error && result1.data?.user) {
            verificationData = result1.data
            verificationError = null
          } else {
            const result2 = await supabase.auth.verifyOtp({
              token: token,
              type: 'signup',
            })
            verificationData = result2.data
            verificationError = result2.error
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
          toast.success('Email verified successfully!')
          
          // Refresh user data
          await refreshUser()
          
          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            navigate('/dashboard')
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
  }, [searchParams, navigate, refreshUser])

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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
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
