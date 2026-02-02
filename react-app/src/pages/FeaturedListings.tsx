import { Link } from 'react-router-dom'
import { CheckCircle2, ArrowRight } from 'lucide-react'

export function FeaturedListings() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="hero-section bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm font-semibold mb-4">
              For Health Professionals
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Grow Your Tasmanian Practice with Featured Listings
            </h1>
            <p className="text-lg md:text-xl text-primary-100 max-w-2xl mx-auto">
              Connect with more patients seeking <strong>therapy near me Tasmania</strong>. <strong>List your practice for free</strong> or upgrade to featured. We help{' '}
              <strong>psychologists Hobart</strong> and <strong>counsellors Launceston</strong> find new clients with <strong>free directory listing</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <div className="bg-gradient-to-br from-primary-50 to-white p-6 rounded-2xl shadow-lg border border-primary-100">
              <h3 className="text-xl font-bold mb-3 text-gray-900">Top of Search Results</h3>
              <p className="text-gray-700">
                Your profile appears first when clients search for terms like 'clinicians Hobart' or 'therapy near me Tasmania'.
              </p>
            </div>

            <div className="bg-gradient-to-br from-primary-50 to-white p-6 rounded-2xl shadow-lg border border-primary-100">
              <h3 className="text-xl font-bold mb-3 text-gray-900">Verified Badge</h3>
              <p className="text-gray-700">
                Stand out with a 'Verified Professional' badge that builds instant trust with potential clients in Launceston, Devonport & Burnie.
              </p>
            </div>

            <div className="bg-gradient-to-br from-primary-50 to-white p-6 rounded-2xl shadow-lg border border-primary-100">
              <h3 className="text-xl font-bold mb-3 text-gray-900">Enhanced Profile</h3>
              <p className="text-gray-700">
                Add video introductions, unlimited photos, and detailed service descriptions to showcase your practice.
              </p>
            </div>

            <div className="bg-gradient-to-br from-primary-50 to-white p-6 rounded-2xl shadow-lg border border-primary-100">
              <h3 className="text-xl font-bold mb-3 text-gray-900">Priority Support</h3>
              <p className="text-gray-700">
                Get direct access to our support team for profile optimisation tips to reach more Tasmanian clients.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {/* Standard Listing */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200">
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Standard Listing</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">Free</span>
                  <span className="text-gray-600 ml-2">Forever</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Basic Profile Listing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Searchable by Location</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Contact Details</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Standard Support</span>
                  </li>
                </ul>
                <Link
                  to="/get-listed"
                  className="block w-full text-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Get Listed Free
                </Link>
              </div>

              {/* Basic Featured Listing */}
              <div className="bg-gradient-to-br from-primary-400 to-primary-500 rounded-2xl shadow-xl p-8 border-2 border-primary-300">
                <h3 className="text-2xl font-bold mb-4 text-white">Basic Featured</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">$15</span>
                  <span className="text-primary-100 ml-2">per month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                    <span className="text-white">Everything in Standard</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                    <span className="text-white">Top Placement in Search</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                    <span className="text-white">Featured Badge</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                    <span className="text-white">Enhanced Profile Visibility</span>
                  </li>
                </ul>
                <Link
                  to="/get-listed"
                  className="block w-full text-center px-6 py-3 bg-white text-primary-600 rounded-xl font-semibold hover:bg-primary-50 transition-colors flex items-center justify-center gap-2"
                >
                  Choose Basic Plan
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <div className="mt-4 flex items-center justify-center text-primary-100 text-sm">
                  <span>Secure payment via Stripe</span>
                </div>
              </div>

              {/* Professional Featured Listing */}
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-xl p-8 border-2 border-primary-400">
                <h3 className="text-2xl font-bold mb-4 text-white">Professional Featured</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">$29</span>
                  <span className="text-primary-100 ml-2">per month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                    <span className="text-white">Everything in Basic</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                    <span className="text-white">Priority Placement (Top of Results)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                    <span className="text-white">Featured Verified Badge</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                    <span className="text-white">Logo & Photo Gallery</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                    <span className="text-white">Detailed Bio & Specialities</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                    <span className="text-white">Priority Support</span>
                  </li>
                </ul>
                <Link
                  to="/get-listed"
                  className="block w-full text-center px-6 py-3 bg-white text-primary-600 rounded-xl font-semibold hover:bg-primary-50 transition-colors flex items-center justify-center gap-2"
                >
                  Become a Featured Lister
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <div className="mt-4 flex items-center justify-center text-primary-100 text-sm">
                  <span>Secure payment via Stripe</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
              How to Become a Featured Lister
            </h2>
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Create an Account</h3>
                <p className="text-gray-700">
                  Register and submit your free standard listing for approval.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Go to Dashboard</h3>
                <p className="text-gray-700">
                  Log in to your Provider Dashboard to manage your profile.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Subscribe</h3>
                <p className="text-gray-700">
                  Click "Upgrade to Featured" to activate your premium benefits instantly via Stripe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
