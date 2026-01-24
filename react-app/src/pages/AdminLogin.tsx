import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock, AlertCircle, Shield, ArrowLeft } from 'lucide-react'

export function AdminLogin() {
  const [email, setEmail] = useState('')
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
        
        // Check if user is admin
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', signInData.user.id)
          .single()

        if (userData?.role !== 'admin') {
          // Sign out if not admin
          await supabase.auth.signOut()
          throw new Error('Access denied. This login is for administrators only.')
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-primary-50/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-red-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h1>
            <p className="text-gray-600 text-sm">Administrator access only</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 flex-1">{error}</p>
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
                  placeholder="admin@example.com"
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all bg-gray-50 focus:bg-white"
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
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all"
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
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-xs text-red-800 text-center">
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
