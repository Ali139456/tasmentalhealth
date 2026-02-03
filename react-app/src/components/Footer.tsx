import { Link } from 'react-router-dom'
import { Mail, MapPin, Heart, LogIn } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useContentSettings } from '../hooks/useContentSettings'

export function Footer() {
  const { settings } = useContentSettings()
  const [footerLinks, setFooterLinks] = useState<any[]>([])

  useEffect(() => {
    fetchFooterLinks()
  }, [])

  const fetchFooterLinks = async () => {
    try {
      const { data } = await supabase
        .from('footer_links')
        .select('*')
        .eq('is_active', true)
        .order('section, order_index')

      setFooterLinks(data || [])
    } catch (error) {
      console.error('Error fetching footer links:', error)
    }
  }

  const findSupportLinks = footerLinks.filter(link => link.section === 'find_support')
  const informationLinks = footerLinks.filter(link => link.section === 'information')
  const customLinks = footerLinks.filter(link => link.section === 'custom')

  const footerDescription = settings['footer_description'] || 'The trusted directory connecting Tasmanians with verified psychologists, counsellors, and mental health social workers. Find support in Hobart, Launceston, Devonport, Burnie and rural Tasmania.'
  const footerCopyright = settings['footer_copyright'] || '© 2026 Tasmanian Mental Health Directory. All rights reserved.'
  const footerTagline = settings['footer_tagline'] || 'Made with care for Tasmania'
  const footerEmail = settings['footer_email'] || 'info@tasmentalhealthdirectory.com.au'
  const findSupportTitle = settings['footer_find_support_title'] || 'Find Support'
  const informationTitle = settings['footer_information_title'] || 'Information'

  return (
    <footer className="bg-white text-gray-700">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Brand Column */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
              <img 
                src="/images/tashmanian-logo.png" 
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
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3 sm:mb-4">
              {footerDescription}
            </p>
          </div>

          {/* Find Support Column */}
          <div>
            <h4 className="text-gray-900 font-bold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />
              {findSupportTitle}
            </h4>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              {findSupportLinks.length > 0 ? (
                findSupportLinks.map((link) => (
                  <li key={link.id}>
                    <Link to={link.url} className="text-gray-600 hover:text-primary-600 transition-colors flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
                      {link.label}
                    </Link>
                  </li>
                ))
              ) : (
                // Fallback to default links if none in database
                <>
                  <li>
                    <Link to="/" className="text-gray-600 hover:text-primary-600 transition-colors flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
                      Find a Clinician
                    </Link>
                  </li>
                  <li>
                    <Link to="/crisis-support" className="text-gray-600 hover:text-primary-600 transition-colors flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
                      Crisis Support & Safety Plan
                    </Link>
                  </li>
                  <li>
                    <Link to="/resources" className="text-gray-600 hover:text-primary-600 transition-colors flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
                      Resources & Guides
                    </Link>
                  </li>
                  <li>
                    <Link to="/get-listed" className="text-gray-600 hover:text-primary-600 transition-colors flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
                      List Your Practice
                    </Link>
                  </li>
                  <li>
                    <Link to="/featured-listings" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
                      Featured Clinician Listings
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Information Column */}
          <div>
            <h4 className="text-gray-900 font-bold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />
              {informationTitle}
            </h4>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <li>
                <a href={`mailto:${footerEmail}`} className="text-gray-600 hover:text-primary-600 transition-colors flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {footerEmail}
                </a>
              </li>
              {informationLinks.length > 0 ? (
                informationLinks.map((link) => (
                  <li key={link.id}>
                    <Link to={link.url} className="text-gray-600 hover:text-primary-600 transition-colors flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
                      {link.label}
                    </Link>
                  </li>
                ))
              ) : (
                // Fallback to default links
                <>
                  <li>
                    <Link to="/privacy-policy" className="text-gray-600 hover:text-primary-600 transition-colors flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link to="/terms-of-service" className="text-gray-600 hover:text-primary-600 transition-colors flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link to="/sitemap" className="text-gray-600 hover:text-primary-600 transition-colors flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
                      Site Map
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin-login" className="text-terracotta hover:text-terracotta-600 font-semibold transition-colors flex items-center gap-2">
                      <LogIn className="w-4 h-4" />
                      Admin Login
                    </Link>
                  </li>
                </>
              )}
              {/* Custom links section */}
              {customLinks.length > 0 && customLinks.map((link) => (
                <li key={link.id}>
                  <Link to={link.url} className="text-gray-600 hover:text-primary-600 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="border-t border-gray-300 pt-6 sm:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm text-gray-600 text-center md:text-left">
              {footerCopyright}
            </p>
            <div className="flex items-center gap-2 text-primary-600">
              <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">{footerTagline}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
