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
        // For magiclink type, we use verifyOtp
        if (type === 'magiclink' || type === 'email') {
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: type === 'magiclink' ? 'email' : (type as any),
          })

          if (verifyError) {
            console.error('OTP verification error:', verifyError)
            throw new Error(verifyError.message || 'Invalid or expired verification link')
          }

          if (data?.user) {
            console.log('Email verified successfully:', data.user.email)
            
            // Update email_verified in users table
            const { error: updateError } = await supabase
              .from('users')
              .update({ email_verified: true })
              .eq('id', data.user.id)

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
        } else if (type === 'signup') {
          // For signup type, use verifyOtp with signup type
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup',
          })

          if (verifyError) {
            throw new Error(verifyError.message || 'Invalid or expired verification link')
          }

          if (data?.user) {
            // Update email_verified in users table
            await supabase
              .from('users')
              .update({ email_verified: true })
              .eq('id', data.user.id)

            setSuccess(true)
            toast.success('Email verified successfully!')
            await refreshUser()
            setTimeout(() => {
              navigate('/dashboard')
            }, 2000)
          }
        } else {
          // Try to verify as magiclink/email if type is not specified
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'email',
          })

          if (verifyError) {
            throw new Error(verifyError.message || 'Invalid or expired verification link')
          }

          if (data?.user) {
            await supabase
              .from('users')
              .update({ email_verified: true })
              .eq('id', data.user.id)

            setSuccess(true)
            toast.success('Email verified successfully!')
            await refreshUser()
            setTimeout(() => {
              navigate('/dashboard')
            }, 2000)
          }
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
