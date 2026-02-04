import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Lock, AlertCircle, CheckCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { sendEmail, getEmailTemplate, isValidPassword } from '../lib/email'
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
    // Also check hash fragments (Supabase might use #access_token=...)
    const token = searchParams.get('token')
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    const type = searchParams.get('type')
    
    // Check hash fragments too (Supabase sometimes uses hash for tokens)
    const hash = window.location.hash
    let hashAccessToken = null
    let hashRefreshToken = null
    let hashType = null
    
    if (hash) {
      const hashParams = new URLSearchParams(hash.substring(1))
      hashAccessToken = hashParams.get('access_token')
      hashRefreshToken = hashParams.get('refresh_token')
      hashType = hashParams.get('type')
    }
    
    // Use hash params if available, otherwise use query params
    const finalAccessToken = hashAccessToken || accessToken
    const finalRefreshToken = hashRefreshToken || refreshToken
    const finalType = hashType || type
    
    // If we have tokens, try to set session immediately
    if (finalAccessToken && finalRefreshToken) {
      supabase.auth.setSession({
        access_token: finalAccessToken,
        refresh_token: finalRefreshToken,
      }).then(({ error }) => {
        if (error) {
          console.error('Error setting session:', error)
          setError('Invalid or expired reset link. Please request a new password reset.')
        } else {
          // Session set successfully, clear error
          setError('')
        }
      })
    } else if (token && finalType === 'recovery') {
      // We have a token from verify endpoint, allow form to be shown
      // Token will be verified in handleSubmit
      setError('')
    } else {
      // Check if we have an active session (Supabase might have set it via redirect)
      supabase.auth.getSession().then(({ data: session, error }) => {
        if (session?.session && !error) {
          // We have a valid session, allow password reset
          setError('')
        } else if (!token && !finalAccessToken) {
          // No tokens and no session - show error
          setError('Invalid or expired reset link. Please request a new password reset.')
        }
      })
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validate password strength
    const passwordValidation = isValidPassword(password)
    if (!passwordValidation.valid) {
      setError(passwordValidation.error || 'Password does not meet requirements.')
      return
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      // Check for tokens in both query params and hash fragments
      const token = searchParams.get('token')
      const accessToken = searchParams.get('access_token')
      const refreshToken = searchParams.get('refresh_token')
      const type = searchParams.get('type')
      
      // Check hash fragments (Supabase sometimes uses hash for tokens)
      const hash = window.location.hash
      let hashAccessToken = null
      let hashRefreshToken = null
      let hashType = null
      
      if (hash) {
        const hashParams = new URLSearchParams(hash.substring(1))
        hashAccessToken = hashParams.get('access_token')
        hashRefreshToken = hashParams.get('refresh_token')
        hashType = hashParams.get('type')
      }
      
      // Use hash params if available, otherwise use query params
      const finalAccessToken = hashAccessToken || accessToken
      const finalRefreshToken = hashRefreshToken || refreshToken
      const finalType = hashType || type
      
      let sessionData: any = null
      
      // First, try to get existing session (Supabase might have set it via redirect)
      const { data: existingSession, error: sessionError } = await supabase.auth.getSession()
      
      if (existingSession?.session && !sessionError) {
        // We already have a valid session from the redirect
        sessionData = existingSession
      } else if (finalAccessToken && finalRefreshToken) {
        // Handle direct link format with access_token and refresh_token
        // Set the session with the tokens from the reset link
        const { data: session, error: setSessionError } = await supabase.auth.setSession({
          access_token: finalAccessToken,
          refresh_token: finalRefreshToken,
        })

        if (setSessionError) throw setSessionError
        sessionData = session
      } else if (token && finalType === 'recovery') {
        // Handle Supabase verify endpoint token format
        // Use the recovery token to verify and get a session
        try {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
          const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
          
          // Verify the token via Supabase API
          const verifyResponse = await fetch(`${supabaseUrl}/auth/v1/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey || '',
            },
            body: JSON.stringify({
              token_hash: token,
              type: 'recovery',
            }),
          })
          
          if (!verifyResponse.ok) {
            const errorData = await verifyResponse.json()
            throw new Error(errorData.error_description || 'Token verification failed')
          }
          
          // After verification, try to get the session
          const { data: session, error: getSessionError } = await supabase.auth.getSession()
          
          if (getSessionError || !session.session) {
            throw new Error('Session not found after verification. Please request a new password reset link.')
          }
          
          sessionData = { user: session.session.user, session: session.session }
        } catch (verifyErr: any) {
          console.error('Token verification error:', verifyErr)
          throw new Error(verifyErr.message || 'Invalid or expired reset link. Please request a new password reset.')
        }
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
                <div className="bg-terracotta-50 border-l-4 border-terracotta text-terracotta-700 px-4 py-3 rounded-lg flex items-start gap-3">
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
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 8 characters and include:
                </p>
                <ul className="text-xs text-gray-500 mt-1 ml-4 list-disc">
                  <li>One uppercase letter (A-Z)</li>
                  <li>One lowercase letter (a-z)</li>
                  <li>One number (0-9)</li>
                  <li>One special character (!@#$%^&amp;*()_+-=[]{}|;:,.&lt;&gt;/?)</li>
                </ul>
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
