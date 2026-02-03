import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { Layout } from './components/Layout'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ScrollToTop } from './components/ScrollToTop'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { AdminLogin } from './pages/AdminLogin'
import { GetListed } from './pages/GetListed'
import { CrisisSupport } from './pages/CrisisSupport'
import { Resources } from './pages/Resources'
import { ResourceDetail } from './pages/ResourceDetail'
import { Events } from './pages/Events'
import { SearchResults } from './pages/SearchResults'
import { Dashboard } from './pages/Dashboard'
import { Admin } from './pages/Admin'
import { PrivacyPolicy } from './pages/PrivacyPolicy'
import { TermsOfService } from './pages/TermsOfService'
import { Sitemap } from './pages/Sitemap'
import { FeaturedListings } from './pages/FeaturedListings'
import { ListingDetail } from './pages/ListingDetail'
import { ResetPassword } from './pages/ResetPassword'
import { VerifyEmail } from './pages/VerifyEmail'
import { Unsubscribe } from './pages/Unsubscribe'

function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { user, role, loading } = useAuth()
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null)

  useEffect(() => {
    if (user?.id) {
      // Check email verification status
      supabase
        .from('users')
        .select('email_verified')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          setEmailVerified(data?.email_verified || false)
        })
    }
  }, [user])

  if (loading || emailVerified === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Block unverified users (except admins)
  if (!requireAdmin && !emailVerified && role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-yellow-800 mb-4">Email Verification Required</h2>
          <p className="text-yellow-700 mb-6">
            Please verify your email address before accessing your account. Check your inbox for a verification email.
          </p>
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              window.location.href = '/login'
            }}
            className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  if (requireAdmin && role !== 'admin') {
    return <Navigate to="/" replace />
  }

  if (!requireAdmin && role !== 'lister' && role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/crisis-support" element={<Layout><CrisisSupport /></Layout>} />
      <Route path="/resources" element={<Layout><Resources /></Layout>} />
      <Route path="/resources/:slug" element={<Layout><ResourceDetail /></Layout>} />
      <Route path="/events" element={<Layout><Events /></Layout>} />
      <Route path="/search" element={<Layout><SearchResults /></Layout>} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/auth/verify" element={<VerifyEmail />} />
      <Route path="/unsubscribe" element={<Unsubscribe />} />
      <Route path="/get-listed" element={<Layout><GetListed /></Layout>} />
      <Route path="/privacy-policy" element={<Layout><PrivacyPolicy /></Layout>} />
      <Route path="/terms-of-service" element={<Layout><TermsOfService /></Layout>} />
      <Route path="/sitemap" element={<Layout><Sitemap /></Layout>} />
      <Route path="/featured-listings" element={<Layout><FeaturedListings /></Layout>} />
      <Route path="/listing/:id" element={<Layout><ListingDetail /></Layout>} />
      <Route path="/page/:slug" element={<Layout><CustomPage /></Layout>} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <Layout><Admin /></Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ScrollToTop />
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#E2725B',
                secondary: '#fff',
              },
            },
          }}
        />
      </Router>
    </ErrorBoundary>
  )
}

export default App
