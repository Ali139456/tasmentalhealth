import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Lock, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import { sendEmail, getEmailTemplate } from '../lib/email'
import toast from 'react-hot-toast'

export function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { refreshUser } = useAuth()

  useEffect(() => {
    // Check if we have the token from the reset link
    // Supabase verify endpoint uses 'token', direct links use 'access_token'
    const token = searchParams.get('token')
    const accessToken = searchParams.get('access_token')
    const type = searchParams.get('type')
    
    if (!token && !accessToken) {
      setError('Invalid or expired reset link. Please request a new password reset.')
    }
    
    // If we have a token from verify endpoint, we need to exchange it for a session
    if (token && type === 'recovery' && !accessToken) {
      // The verify endpoint will redirect here, but we need to handle the token
      // For now, show the form - we'll handle token exchange in handleSubmit
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validate passwords
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const token = searchParams.get('token')
      const accessToken = searchParams.get('access_token')
      const refreshToken = searchParams.get('refresh_token')
      
      let sessionData: any = null
      
      // Handle Supabase verify endpoint token format
      if (token && !accessToken) {
        // Exchange the token for a session by verifying it
        const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'recovery'
        })
        
        if (verifyError) {
          // If verifyOtp doesn't work, try using the token directly
          // Supabase verify endpoint should have already verified, so try to get session
          const { data: session, error: sessionError } = await supabase.auth.getSession()
          if (sessionError || !session.session) {
            throw new Error('Invalid or expired reset link. Please request a new password reset.')
          }
          sessionData = { user: session.session.user, session: session.session }
        } else {
          sessionData = verifyData
        }
      } else if (accessToken && refreshToken) {
        // Handle direct link format with access_token and refresh_token
        if (!accessToken || !refreshToken) {
          throw new Error('Invalid reset link. Please request a new password reset.')
        }

        // Set the session with the tokens from the reset link
        const { data: session, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (sessionError) throw sessionError
        sessionData = session
      } else {
        throw new Error('Invalid reset link. Please request a new password reset.')
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) throw updateError

      // Send confirmation email
      try {
        const userEmail = sessionData.user?.email
        if (userEmail) {
          const template = getEmailTemplate('password_changed', {
            email: userEmail,
            userName: userEmail.split('@')[0],
            appUrl: window.location.origin
          })

          // Send email asynchronously (non-blocking) with timeout
          Promise.race([
            sendEmail({
              to: userEmail,
              subject: template.subject,
              html: template.html
            }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Email timeout')), 10000)
            )
          ]).catch(err => {
            console.error('Failed to send password change confirmation email:', err)
            // Don't fail the password change if email fails
          })
        }
      } catch (emailErr) {
        console.error('Error sending password change email:', emailErr)
        // Don't fail password change if email fails
      }

      setSuccess(true)
      toast.success('Password changed successfully!')
      
      // Refresh user data
      await refreshUser()
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    } catch (err: any) {
      console.error('Password reset error:', err)
      const errorMessage = err.message || 'Failed to reset password. Please try again.'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12 px-4">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-primary-100/50"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-400/25 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary-500/25 rounded-full blur-3xl"></div>
      
      <div className="max-w-md w-full relative z-10">
        {/* Back to Home Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6 transition-colors group bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl hover:bg-white/80"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-2xl mb-6 shadow-2xl relative">
            <Lock className="w-12 h-12 text-white z-10" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
          </div>
          <h2 className="text-4xl font-bold mb-3 text-gray-900">Reset Password</h2>
          <p className="text-lg text-gray-600">Enter your new password</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 md:p-10 border border-primary-100/50">
          {success ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Password Changed!</h3>
              <p className="text-gray-600 mb-6">
                Your password has been successfully changed. You'll be redirected to your dashboard shortly.
              </p>
              <p className="text-sm text-gray-500">
                A confirmation email has been sent to your email address.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="relative w-full pl-12 pr-4 py-3 border-2 border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                    placeholder="Enter new password"
                    minLength={8}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long.</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="relative w-full pl-12 pr-4 py-3 border-2 border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                    placeholder="Confirm new password"
                    minLength={8}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center items-center gap-2 py-4 px-6 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] shadow-xl hover:shadow-2xl"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Changing Password...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      <span>Change Password</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Remember your password?{' '}
                  <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
