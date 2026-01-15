import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Search, Menu, X, User, LogOut, Stethoscope } from 'lucide-react'
import { useState } from 'react'

export function Header() {
  const { user, role, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)

  const isActive = (path: string) => location.pathname === path

  const handleSignOut = async () => {
    await signOut()
    setMobileMenuOpen(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setMobileMenuOpen(false)
    }
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(e)
    }
  }

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-gray-100">
      <div className="px-4 sm:px-8 md:px-16 lg:px-[200px] xl:px-[200px]">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center group flex-shrink-0">
            <div className="relative">
              <img 
                src="/images/tashmanian%20full%20%20logo.png" 
                alt="Tasmanian Mental Health Directory" 
                className="h-12 w-auto transition-transform group-hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  const fallback = target.nextElementSibling as HTMLElement
                  if (fallback) fallback.style.display = 'flex'
                }}
              />
              <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center hidden">
                <span className="text-white font-bold text-lg">TM</span>
              </div>
            </div>
          </Link>

          {/* Navigation + Auth + Search - Right Side */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Navigation Links */}
            <div className="flex items-center gap-1">
              <Link
                to="/"
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive('/') 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50/50'
                }`}
              >
                Home
              </Link>
              <Link
                to="/crisis-support"
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive('/crisis-support') 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50/50'
                }`}
              >
                Crisis Support
              </Link>
              <Link
                to="/resources"
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive('/resources') 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50/50'
                }`}
              >
                Resources
              </Link>
              <Link
                to="/events"
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive('/events') 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50/50'
                }`}
              >
                Events
              </Link>
            </div>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-2">
                {role === 'admin' && (
                  <Link
                    to="/admin"
                    className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-all shadow-md hover:shadow-lg"
                  >
                    Admin
                  </Link>
                )}
                {role === 'lister' && (
                  <Link
                    to="/dashboard"
                    className="px-4 py-2 bg-primary-500 text-white rounded-xl text-sm font-semibold hover:bg-primary-600 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-gray-700 rounded-xl text-sm font-semibold hover:text-red-600 hover:bg-red-50 transition-all flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 rounded-xl text-sm font-semibold hover:text-primary-600 hover:bg-primary-50/50 transition-all flex items-center gap-2 border-2 border-gray-300 hover:border-primary-400"
                >
                  <Stethoscope className="w-4 h-4" />
                  Lister Login
                </Link>
                <Link
                  to="/get-listed"
                  className="px-6 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-semibold hover:bg-primary-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Get Listed
                </Link>
              </div>
            )}

            {/* Modern Search Bar - Desktop (Right Side) */}
            <div className="hidden md:flex items-center ml-2">
              <form onSubmit={handleSearch} className="w-full">
                <div className={`relative transition-all duration-300 ${searchFocused ? 'w-80' : 'w-64'}`}>
                  <div className={`absolute inset-0 bg-gradient-to-r from-primary-500/10 to-primary-400/10 rounded-2xl blur-sm opacity-0 transition-opacity duration-300 ${searchFocused ? 'opacity-100' : ''}`}></div>
                  <div className="relative bg-gray-50 border-2 border-gray-200 rounded-2xl transition-all duration-300 hover:border-primary-300 hover:bg-white hover:shadow-lg focus-within:border-primary-500 focus-within:bg-white focus-within:shadow-xl">
                    <div className="flex items-center">
                      <Search className={`absolute left-4 text-gray-400 transition-colors duration-300 ${searchFocused ? 'text-primary-500' : ''} w-5 h-5`} />
                      <input
                        type="text"
                        placeholder="Search entire site..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        className="w-full pl-12 pr-4 py-2.5 bg-transparent border-0 rounded-2xl focus:outline-none text-sm placeholder-gray-400 text-gray-700"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md shadow-lg">
          <div className="px-4 py-4 space-y-3">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-primary-400/10 rounded-2xl blur-sm"></div>
              <div className="relative bg-gray-50 border-2 border-gray-200 rounded-2xl focus-within:border-primary-500 focus-within:bg-white focus-within:shadow-lg transition-all">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search entire site..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full pl-12 pr-4 py-3 bg-transparent border-0 rounded-2xl focus:outline-none text-sm placeholder-gray-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>

            {/* Mobile Navigation */}
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                isActive('/') ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:bg-primary-50/50'
              }`}
            >
              Home
            </Link>
            <Link
              to="/crisis-support"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                isActive('/crisis-support') ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:bg-primary-50/50'
              }`}
            >
              Crisis Support
            </Link>
            <Link
              to="/resources"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                isActive('/resources') ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:bg-primary-50/50'
              }`}
            >
              Resources
            </Link>
            <Link
              to="/events"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                isActive('/events') ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:bg-primary-50/50'
              }`}
            >
              Events
            </Link>
            {user ? (
              <>
                {role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 bg-red-600 text-white rounded-xl text-base font-semibold"
                  >
                    Admin
                  </Link>
                )}
                {role === 'lister' && (
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 bg-primary-500 text-white rounded-xl text-base font-semibold"
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-3 text-gray-700 rounded-xl text-base font-semibold hover:bg-red-50 hover:text-red-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-gray-700 rounded-xl text-base font-semibold hover:bg-primary-50/50 border-2 border-gray-300 hover:border-primary-400"
                >
                  <Stethoscope className="w-5 h-5" />
                  Lister Login
                </Link>
                <Link
                  to="/get-listed"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 bg-primary-500 text-white rounded-xl text-base font-semibold text-center"
                >
                  Get Listed
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
