import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock, AlertCircle, Shield, ArrowLeft } from 'lucide-react'

export function AdminLogin() {
  const [email, setEmail] = useState('info@tasmentalhealthdirectory.com.au')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { refreshUser } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
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
        // Refresh user to get role
        await refreshUser()
        
        // Check if user is admin (use maybeSingle to handle missing users)
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', signInData.user.id)
          .maybeSingle()

        // If user doesn't exist in users table, create it with admin role
        if (!userData && !userError) {
          // User exists in auth.users but not in users table - create it
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: signInData.user.id,
              email: signInData.user.email || email,
              role: 'admin',
              email_verified: signInData.user.email_confirmed_at ? true : false
            })

          if (insertError) {
            console.error('Error creating user record:', insertError)
            throw new Error('Failed to initialize admin account. Please contact support.')
          }

          // Re-fetch the user data
          const { data: newUserData } = await supabase
            .from('users')
            .select('role')
            .eq('id', signInData.user.id)
            .maybeSingle()

          if (newUserData?.role !== 'admin') {
            await supabase.auth.signOut()
            throw new Error('Access denied. This login is for administrators only.')
          }
        } else if (userData?.role !== 'admin') {
          // User exists but is not admin
          await supabase.auth.signOut()
          throw new Error('Access denied. This login is for administrators only.')
        } else if (userError) {
          // Error querying users table
          console.error('Error checking user role:', userError)
          throw new Error('Failed to verify admin access. Please try again.')
        }

        // Navigate to admin dashboard
        navigate('/admin')
        setTimeout(() => refreshUser().catch(() => {}), 100)
      } else {
        throw new Error('Sign in failed. Please try again.')
      }
    } catch (err: any) {
      console.error('Auth error:', err)
      setError(err.message || 'An error occurred during sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-orange-50/50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-300 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-orange-100 rounded-full blur-3xl"></div>
      </div>
      <div className="w-full max-w-md relative z-10">
        {/* Back to Home Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-orange-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-600 rounded-2xl mb-4 shadow-lg relative">
              <Shield className="w-10 h-10 text-white" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 rounded-full border-2 border-white"></div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h1>
            <p className="text-gray-600 text-sm">Administrator access only</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-orange-800 flex-1">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="admin-email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="info@tasmentalhealthdirectory.com.au"
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="admin-password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>Sign In as Admin</span>
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <p className="text-xs text-orange-800 text-center">
              <Shield className="w-4 h-4 inline mr-1" />
              This is a secure administrator login. Unauthorized access is prohibited.
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Are you a lister?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
            Lister Login
          </Link>
        </p>
      </div>
    </div>
  )
}
