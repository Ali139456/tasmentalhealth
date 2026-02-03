import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { SEO } from '../components/SEO'
import { sanitizeHTMLWithSafeTags } from '../lib/sanitize'

export function CustomPage() {
  const { slug } = useParams<{ slug: string }>()
  const [page, setPage] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (slug) {
      fetchPage()
    }
  }, [slug])

  const fetchPage = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('custom_pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle()

      if (fetchError) throw fetchError

      if (!data) {
        setError('Page not found')
        return
      }

      setPage(data)
    } catch (err: any) {
      console.error('Error fetching page:', err)
      setError(err.message || 'Failed to load page')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The page you are looking for does not exist.'}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta text-white rounded-lg font-semibold hover:bg-terracotta-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://tasmentalhealthdirectory.com.au'
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.meta_description || page.title,
    url: `${siteUrl}/page/${page.slug}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
      <SEO
        title={`${page.title} | Tasmanian Mental Health Directory`}
        description={page.meta_description || page.title}
        keywords={page.meta_keywords || 'mental health, Tasmania'}
        image="/images/hero-mountain.jpg"
        structuredData={structuredData}
      />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white py-16 sm:py-20 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">{page.title}</h1>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-4xl">
          <div
            className="prose prose-lg max-w-none
              prose-headings:text-gray-900
              prose-p:text-gray-700
              prose-a:text-primary-600
              prose-strong:text-gray-900
              prose-ul:text-gray-700
              prose-ol:text-gray-700
              prose-li:text-gray-700"
            dangerouslySetInnerHTML={{ __html: sanitizeHTMLWithSafeTags(page.content) }}
          />
        </div>
      </section>
    </div>
  )
}
