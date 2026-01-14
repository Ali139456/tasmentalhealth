import { Link } from 'react-router-dom'
import { Map, ArrowRight, Home, Heart, BookOpen, Calendar, Star, Shield, FileText, LogIn, LayoutDashboard, UserCog, Sparkles } from 'lucide-react'

export function Sitemap() {
  const mainPages = [
    { path: '/', title: 'Home', description: 'Find mental health professionals across Tasmania', icon: Home, color: 'from-primary-500 to-primary-600' },
    { path: '/crisis-support', title: 'Crisis Support', description: '24/7 crisis support and safety planning resources', icon: Heart, color: 'from-red-500 to-red-600' },
    { path: '/resources', title: 'Resources & Guides', description: 'Mental health resources and educational content', icon: BookOpen, color: 'from-blue-500 to-blue-600' },
    { path: '/events', title: 'Events', description: 'Upcoming mental health events and workshops', icon: Calendar, color: 'from-purple-500 to-purple-600' },
    { path: '/get-listed', title: 'Get Listed', description: 'List your practice in our directory', icon: Star, color: 'from-yellow-500 to-yellow-600' },
    { path: '/featured-listings', title: 'Featured Listings', description: 'Premium featured listings for professionals', icon: Star, color: 'from-orange-500 to-orange-600' },
  ]

  const informationPages = [
    { path: '/privacy-policy', title: 'Privacy Policy', description: 'How we handle your data', icon: Shield, color: 'from-green-500 to-green-600' },
    { path: '/terms-of-service', title: 'Terms of Service', description: 'Terms and conditions of use', icon: FileText, color: 'from-indigo-500 to-indigo-600' },
    { path: '/sitemap', title: 'Site Map', description: 'Complete site navigation', icon: Map, color: 'from-teal-500 to-teal-600' },
  ]

  const accountPages = [
    { path: '/login', title: 'Lister Login', description: 'Sign in to manage your listing', icon: LogIn, color: 'from-pink-500 to-pink-600' },
    { path: '/dashboard', title: 'Dashboard', description: 'Manage your listing and profile', icon: LayoutDashboard, color: 'from-cyan-500 to-cyan-600' },
    { path: '/admin', title: 'Admin Login', description: 'Administrator access', icon: UserCog, color: 'from-violet-500 to-violet-600' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
      {/* Enhanced Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white py-16 md:py-24 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-6 shadow-2xl">
              <Map className="w-10 h-10 text-white" />
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-300 animate-pulse" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Site Map
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 max-w-2xl mx-auto">
              Navigate all pages and resources on the Tasmanian Mental Health Directory.
            </p>
          </div>
        </div>
      </section>

      {/* Main Pages Section */}
      <section className="py-12 md:py-16 -mt-8 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Explore Our Directory</h2>
            <p className="text-xl text-gray-600">Find everything you need in one place</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* Main Pages */}
            <div className="bg-gradient-to-br from-white via-primary-50/30 to-white rounded-3xl shadow-xl p-6 md:p-8 border border-primary-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Main Pages</h2>
              </div>
              <ul className="space-y-3">
                {mainPages.map((page) => {
                  const Icon = page.icon
                  return (
                    <li key={page.path}>
                      <Link
                        to={page.path}
                        className="group flex items-start gap-3 p-4 rounded-xl hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-primary-200"
                      >
                        <div className={`w-10 h-10 bg-gradient-to-br ${page.color} rounded-lg flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-1">
                            {page.title}
                          </h3>
                          <p className="text-sm text-gray-600">{page.description}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-primary-500 mt-1 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Information Pages */}
            <div className="bg-gradient-to-br from-white via-emerald-50/30 to-white rounded-3xl shadow-xl p-6 md:p-8 border border-emerald-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Information</h2>
              </div>
              <ul className="space-y-3">
                {informationPages.map((page) => {
                  const Icon = page.icon
                  return (
                    <li key={page.path}>
                      <Link
                        to={page.path}
                        className="group flex items-start gap-3 p-4 rounded-xl hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-emerald-200"
                      >
                        <div className={`w-10 h-10 bg-gradient-to-br ${page.color} rounded-lg flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors mb-1">
                            {page.title}
                          </h3>
                          <p className="text-sm text-gray-600">{page.description}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-emerald-500 mt-1 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Account Pages */}
            <div className="bg-gradient-to-br from-white via-purple-50/30 to-white rounded-3xl shadow-xl p-6 md:p-8 border border-purple-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <UserCog className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Account & Admin</h2>
              </div>
              <ul className="space-y-3">
                {accountPages.map((page) => {
                  const Icon = page.icon
                  return (
                    <li key={page.path}>
                      <Link
                        to={page.path}
                        className="group flex items-start gap-3 p-4 rounded-xl hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-purple-200"
                      >
                        <div className={`w-10 h-10 bg-gradient-to-br ${page.color} rounded-lg flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors mb-1">
                            {page.title}
                          </h3>
                          <p className="text-sm text-gray-600">{page.description}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-purple-500 mt-1 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="mt-12 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-3xl shadow-2xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Quick Links</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { path: '/', label: 'Find a Clinician' },
                  { path: '/crisis-support', label: 'Crisis Support' },
                  { path: '/resources', label: 'Resources' },
                  { path: '/get-listed', label: 'Get Listed' },
                ].map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="group bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center font-semibold hover:bg-white/20 transition-all transform hover:scale-105 border border-white/20"
                  >
                    {link.label}
                    <ArrowRight className="w-4 h-4 inline-block ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
