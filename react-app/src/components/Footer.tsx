import { Link } from 'react-router-dom'
import { Mail, MapPin, Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Brand Column */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
              <img 
                src="/images/tashmanian%20full%20%20logo%20%281%29.png" 
                alt="Tasmanian Mental Health Directory" 
                className="h-12 sm:h-16 w-auto"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  const fallback = target.nextElementSibling as HTMLElement
                  if (fallback) fallback.style.display = 'flex'
                }}
              />
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-500 rounded-lg flex items-center justify-center hidden">
                <span className="text-white font-bold text-base sm:text-lg">TM</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-3 sm:mb-4">
              The trusted directory connecting Tasmanians with verified psychologists, counsellors, and mental health social workers. Find support in Hobart, Launceston, Devonport, Burnie and rural Tasmania.
            </p>
            <div className="flex items-center gap-2 text-primary-400">
              <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">Supporting mental health across Tasmania</span>
            </div>
          </div>

          {/* Find Support Column */}
          <div>
            <h4 className="text-white font-bold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400" />
              Find Support
            </h4>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <li>
                <Link to="/" className="hover:text-primary-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary-400 rounded-full"></span>
                  Find a Clinician
                </Link>
              </li>
              <li>
                <Link to="/crisis-support" className="hover:text-primary-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary-400 rounded-full"></span>
                  Crisis Support & Safety Plan
                </Link>
              </li>
              <li>
                <Link to="/resources" className="hover:text-primary-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary-400 rounded-full"></span>
                  Resources & Guides
                </Link>
              </li>
              <li>
                <Link to="/get-listed" className="hover:text-primary-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary-400 rounded-full"></span>
                  List Your Practice
                </Link>
              </li>
              <li>
                <Link to="/featured-listings" className="hover:text-primary-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary-400 rounded-full"></span>
                  Featured Clinician Listings
                </Link>
              </li>
            </ul>
          </div>

          {/* Information Column */}
          <div>
            <h4 className="text-white font-bold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400" />
              Information
            </h4>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <li>
                <a href="mailto:info@tasmentalhealthdirectory.com.au" className="hover:text-primary-400 transition-colors flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  info@tasmentalhealthdirectory.com.au
                </a>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-primary-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary-400 rounded-full"></span>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="hover:text-primary-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary-400 rounded-full"></span>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/sitemap" className="hover:text-primary-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary-400 rounded-full"></span>
                  Site Map
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-primary-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary-400 rounded-full"></span>
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Contact Column */}
          <div>
            <h4 className="text-white font-bold text-base sm:text-lg mb-3 sm:mb-4">Quick Contact</h4>
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <div className="flex items-start gap-2 sm:gap-3">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-400 mb-1">Email Us</p>
                  <a href="mailto:info@tasmentalhealthdirectory.com.au" className="text-primary-400 hover:text-primary-300 break-all">
                    info@tasmentalhealthdirectory.com.au
                  </a>
                </div>
              </div>
              <div className="pt-3 sm:pt-4 border-t border-gray-700">
                <p className="text-gray-400 text-xs leading-relaxed">
                  Connecting Hobart, Launceston & Burnie with mental health care.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 sm:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm text-gray-400 text-center md:text-left">
              &copy; 2026 Tasmanian Mental Health Directory. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-primary-400">
              <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">Made with care for Tasmania</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
