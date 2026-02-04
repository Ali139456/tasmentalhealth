import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { sendEmail, getEmailTemplate, isValidEmail, isValidPassword, getAdminEmails } from '../lib/email'
import { Mail, Lock, AlertCircle, LogIn, ArrowRight, Shield, ArrowLeft, Sparkles, UserPlus, CheckCircle, Eye, EyeOff } from 'lucide-react'

export function Login() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { refreshUser } = useAuth()
  
  // Get redirect URL from query params
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (isSignUp) {
        // Validate that user has agreed to terms and privacy policy
        if (!agreedToTerms || !agreedToPrivacy) {
          throw new Error('Please agree to our Terms and Conditions and Privacy Policy to continue.')
        }

        // Validate email format and validity
        if (!isValidEmail(email)) {
          throw new Error('Please enter a valid email address. Invalid or fake email addresses are not allowed.')
        }

        // Validate password strength
        const passwordValidation = isValidPassword(password)
        if (!passwordValidation.valid) {
          throw new Error(passwordValidation.error || 'Password does not meet requirements.')
        }

        // Sign up flow
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          }
        })

        if (signUpError) {
          // Provide helpful error messages
          const errorMsg = signUpError.message?.toLowerCase() || ''
          
          if (errorMsg.includes('user already registered')) {
            throw new Error('An account with this email already exists. Please sign in instead.')
          } else if (errorMsg.includes('password')) {
            throw new Error('Password does not meet requirements. Please use at least 8 characters.')
          } else if (errorMsg.includes('email')) {
            throw new Error('Invalid email address. Please check and try again.')
          }
          
          throw signUpError
        }

        if (authData.user) {
          // Send emails asynchronously (non-blocking) - don't wait for them
          // This prevents signup from hanging if email service is slow or unavailable
          Promise.all([
            // Send welcome email
            (async () => {
              try {
                if (!authData.user?.email) return
                
                const template = getEmailTemplate('welcome', {
                  email: authData.user.email,
                  userName: authData.user.email?.split('@')[0],
                  appUrl: window.location.origin
                })
                
                console.log('Sending welcome email to:', authData.user.email)
                const emailResult = await Promise.race([
                  sendEmail({
                    to: authData.user.email,
                    subject: template.subject,
                    html: template.html
                  }),
                  new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Email timeout')), 10000)
                  )
                ]) as any
                
                if (emailResult?.success) {
                  console.log('Welcome email sent successfully')
                } else {
                  console.error('Failed to send welcome email:', emailResult?.error)
                }
              } catch (err) {
                console.error('Error sending welcome email:', err)
                // Don't block signup if email fails
              }
            })(),
            // Send admin notification
            (async () => {
              try {
                if (!authData.user?.email || !authData.user?.id) return
                
                const adminEmails = await Promise.race([
                  getAdminEmails(),
                  new Promise<string[]>((resolve) => 
                    setTimeout(() => resolve([]), 5000)
                  )
                ]) as string[]
                
                if (adminEmails.length > 0) {
                  const adminTemplate = getEmailTemplate('admin_user_signup', {
                    email: authData.user.email,
                    userId: authData.user.id,
                    signupDate: new Date().toLocaleString('en-AU', { timeZone: 'Australia/Hobart' })
                  })

                  // Send to all admins with timeout
                  await Promise.race([
                    Promise.all(adminEmails.map(adminEmail => 
                      sendEmail({
                        to: adminEmail,
                        subject: adminTemplate.subject,
                        html: adminTemplate.html
                      })
                    )),
                    new Promise((_, reject) => 
                      setTimeout(() => reject(new Error('Admin email timeout')), 10000)
                    )
                  ])
                  console.log('Admin notification sent for new user signup')
                }
              } catch (err) {
                console.error('Error sending admin notification:', err)
                // Don't fail signup if admin notification fails
              }
            })()
          ]).catch(err => {
            console.error('Email sending error (non-blocking):', err)
          })

          // Supabase will automatically send verification email when "Confirm email" is enabled
          // No need to manually send email - Supabase handles it

          // Clear form fields
          setEmail('')
          setPassword('')
          
          // Complete signup immediately without waiting for emails
          if (authData.user.email_confirmed_at || authData.session) {
            setSuccess('Account created successfully! Signing you in...')
            setTimeout(() => {
              navigate(redirectTo)
              refreshUser().catch(() => {})
            }, 500)
          } else {
            setSuccess('Account created! Please check your email to verify your account. A verification email has been sent.')
            setIsSignUp(false)
            setLoading(false) // Reset loading state so form is usable
            // Reset form and switch to sign in after showing success message
            setTimeout(() => {
              setEmail('')
              setPassword('')
              setSuccess('')
              setError('')
            }, 2000) // Wait 2 seconds to show success message, then reset
          }
        } else {
          throw new Error('Failed to create account. Please try again.')
        }
      } else {
        // Sign in flow
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
        
        if (!supabaseUrl || !supabaseKey || supabaseUrl === '' || supabaseKey === '') {
          throw new Error('Supabase is not configured. Please check your environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY).')
        }
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          const errorMsg = signInError.message?.toLowerCase() || ''
          
          if (errorMsg.includes('email') && (errorMsg.includes('confirm') || errorMsg.includes('verify'))) {
            throw new Error('Email not confirmed. Please check your inbox for a confirmation email.')
          } else if (errorMsg.includes('invalid') || errorMsg.includes('credentials')) {
            throw new Error('Invalid email or password. Please check your credentials and try again.')
          } else if (errorMsg.includes('too many requests')) {
            throw new Error('Too many login attempts. Please wait a moment and try again.')
          }
          
          throw signInError
        }

        if (signInData?.user) {
          // Check if user is admin - admins should use admin login
          const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', signInData.user.id)
            .maybeSingle()

          if (userData?.role === 'admin') {
            // Sign out and redirect to admin login
            await supabase.auth.signOut()
            throw new Error('Administrators must use the Admin Login page. Please use the Admin Login link in the footer.')
          }

          // Clear form fields before navigation
          setEmail('')
          setPassword('')
          
          navigate(redirectTo)
          setTimeout(() => refreshUser().catch(() => {}), 100)
        } else {
          throw new Error('Sign in failed. Please try again.')
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err)
      const errorMessage = err.message || (isSignUp ? 'Failed to sign up' : 'Failed to sign in')
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey || supabaseUrl === '' || supabaseKey === '') {
        setError('Supabase is not configured. Please check your environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY).')
      } else {
        setError(errorMessage)
      }
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first')
      return
    }

    setError('')
    setLoading(true)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (resetError) throw resetError

      alert('Password reset email sent! Check your inbox.')
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12 px-4">
      {/* Enhanced Background with gradient and decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-primary-100/50"></div>
      
      {/* Multiple decorative blur shapes for depth */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-400/25 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary-500/25 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-primary-300/15 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-primary-400/20 rounded-full blur-3xl"></div>
      
      {/* Enhanced pattern overlay */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2339B8A6' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Floating decorative elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-primary-200/10 rounded-full blur-2xl hidden lg:block"></div>
      <div className="absolute bottom-20 left-20 w-40 h-40 bg-primary-300/10 rounded-full blur-2xl hidden lg:block"></div>

      <div className="max-w-md w-full relative z-10">
        {/* Back to Home Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6 transition-colors group bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl hover:bg-white/80"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>

        {/* Logo/Header - Enhanced */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-2xl mb-6 shadow-2xl relative">
            <Shield className="w-12 h-12 text-white z-10" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-primary-400 animate-pulse" />
          </div>
          <h2 className="text-4xl font-bold mb-3 text-gray-900">
            {isSignUp ? 'Create Account' : 'Lister Login'}
          </h2>
          <p className="text-lg text-gray-600">
            {isSignUp ? 'Sign up to get started' : 'Sign in to manage your listing'}
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-primary-500 to-primary-400 mx-auto rounded-full mt-4"></div>
        </div>

        {/* Toggle between Sign In and Sign Up */}
        <div className="mb-6 flex items-center justify-center gap-4 bg-white/50 backdrop-blur-sm rounded-xl p-1">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false)
              setEmail('')
              setPassword('')
              setError('')
              setSuccess('')
            }}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
              !isSignUp
                ? 'bg-primary-500 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true)
              setEmail('')
              setPassword('')
              setError('')
              setSuccess('')
            }}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
              isSignUp
                ? 'bg-primary-500 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Login Card - Enhanced */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 md:p-10 border border-primary-100/50 relative overflow-hidden">
          {/* Decorative corner accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/10 to-transparent rounded-bl-full"></div>
          
          <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-terracotta-50 border-l-4 border-terracotta text-terracotta-700 px-4 py-3 rounded-lg flex items-start gap-3 shadow-md">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}
            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg flex items-start gap-3 shadow-md">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="text-sm font-medium">{success}</span>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-primary-400/5 rounded-xl opacity-0 focus-within:opacity-100 transition-opacity"></div>
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="relative w-full pl-12 pr-4 py-3 border-2 border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-primary-400/5 rounded-xl opacity-0 focus-within:opacity-100 transition-opacity"></div>
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="relative w-full pl-12 pr-12 py-3 border-2 border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                    placeholder="••••••••"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {!isSignUp && (
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}
            {isSignUp && (
              <div className="text-sm text-gray-600">
                <p className="text-xs">
                  Password must be at least 8 characters and include:
                </p>
                <ul className="text-xs mt-1 ml-4 list-disc">
                  <li>One uppercase letter (A-Z)</li>
                  <li>One lowercase letter (a-z)</li>
                  <li>One number (0-9)</li>
                  <li>One special character (!@#$%^&amp;*()_+-=[]{}|;:,.&lt;&gt;/?)</li>
                </ul>
              </div>
            )}

            {isSignUp && (
              <div className="pt-2 pb-4 space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <input
                    type="checkbox"
                    id="agree-terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2 cursor-pointer"
                  />
                  <label htmlFor="agree-terms" className="text-xs text-gray-700 cursor-pointer flex-1">
                    I agree to the{' '}
                    <Link to="/terms-of-service" target="_blank" className="text-primary-600 hover:text-primary-700 underline font-semibold">
                      Terms and Conditions
                    </Link>
                  </label>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <input
                    type="checkbox"
                    id="agree-privacy"
                    checked={agreedToPrivacy}
                    onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2 cursor-pointer"
                  />
                  <label htmlFor="agree-privacy" className="text-xs text-gray-700 cursor-pointer flex-1">
                    I agree to the{' '}
                    <Link to="/privacy-policy" target="_blank" className="text-primary-600 hover:text-primary-700 underline font-semibold">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  By proceeding, you agree to our Terms and Conditions and Privacy Policy.
                </p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading || (isSignUp && (!agreedToTerms || !agreedToPrivacy))}
                className="group relative w-full flex justify-center items-center gap-2 py-4 px-6 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] shadow-xl hover:shadow-2xl"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{isSignUp ? 'Creating account...' : 'Signing in...'}</span>
                  </>
                ) : (
                  <>
                    {isSignUp ? (
                      <>
                        <UserPlus className="w-5 h-5" />
                        <span>Create Account</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5" />
                        <span>Sign in</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
            {!isSignUp && (
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true)
                      setEmail('')
                      setPassword('')
                      setError('')
                      setSuccess('')
                      setAgreedToTerms(false)
                      setAgreedToPrivacy(false)
                    }}
                    className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    Sign up here
                  </button>
                  {' or '}
                  <Link to="/get-listed" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                    Get Listed
                  </Link>
                </p>
              </div>
            )}
            {isSignUp && (
              <div className="text-center pt-2">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false)
                      setEmail('')
                      setPassword('')
                      setError('')
                      setSuccess('')
                      setAgreedToTerms(false)
                      setAgreedToPrivacy(false)
                    }}
                    className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
