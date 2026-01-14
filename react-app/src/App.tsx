import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Layout } from './components/Layout'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ScrollToTop } from './components/ScrollToTop'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
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

function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { user, role, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
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
      <Route path="/get-listed" element={<Layout><GetListed /></Layout>} />
      <Route path="/privacy-policy" element={<Layout><PrivacyPolicy /></Layout>} />
      <Route path="/terms-of-service" element={<Layout><TermsOfService /></Layout>} />
      <Route path="/sitemap" element={<Layout><Sitemap /></Layout>} />
      <Route path="/featured-listings" element={<Layout><FeaturedListings /></Layout>} />
      <Route path="/listing/:id" element={<Layout><ListingDetail /></Layout>} />
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
      </Router>
    </ErrorBoundary>
  )
}

export default App
