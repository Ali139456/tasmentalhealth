import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Clock, Calendar, Users, Share2, BookOpen } from 'lucide-react'
import { RESOURCES, type ResourceContent } from '../lib/resourceContent'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface DatabaseArticle {
  id: string
  title: string
  slug: string
  category: string
  content: string
  excerpt: string
  image_url: string | null
  tags: string[]
  read_time: number
  published: boolean
  created_at: string
  updated_at: string
}

interface RelatedArticle {
  id: string
  title: string
  slug: string
  category: string
  excerpt: string
  image_url: string | null
  tags: string[]
  read_time: number
  published: boolean
  created_at: string
}

// Parse content from database (plain text) into structured format
function parseContent(content: string): Array<{ heading?: string; paragraphs: string[] }> {
  if (!content) return []
  
  // Try to parse as JSON first (for structured content)
  try {
    const parsed = JSON.parse(content)
    if (Array.isArray(parsed)) {
      return parsed
    }
  } catch {
    // Not JSON, treat as plain text
  }
  
  // Split content by double newlines (paragraphs) and detect headings
  const sections: Array<{ heading?: string; paragraphs: string[] }> = []
  const lines = content.split('\n\n').filter(line => line.trim())
  
  let currentSection: { heading?: string; paragraphs: string[] } = { paragraphs: [] }
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    // Detect headings (lines that are short and end without period, or start with numbers)
    if (trimmed.length < 100 && (trimmed.match(/^\d+\./) || (!trimmed.endsWith('.') && !trimmed.endsWith('!') && !trimmed.endsWith('?')))) {
      // If we have content in current section, save it
      if (currentSection.paragraphs.length > 0 || currentSection.heading) {
        sections.push(currentSection)
      }
      currentSection = { heading: trimmed, paragraphs: [] }
    } else {
      currentSection.paragraphs.push(trimmed)
    }
  }
  
  // Add the last section
  if (currentSection.paragraphs.length > 0 || currentSection.heading) {
    sections.push(currentSection)
  }
  
  // If no sections were created, create one with all content
  if (sections.length === 0) {
    sections.push({ paragraphs: content.split('\n\n').filter(p => p.trim()) })
  }
  
  return sections
}

export function ResourceDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [article, setArticle] = useState<DatabaseArticle | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([])
  const [loading, setLoading] = useState(true)
  
  // Fetch article from database
  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('resources')
          .select('*')
          .eq('slug', slug)
          .eq('published', true)
          .single()

        if (error && error.code !== 'PGRST116') {
          throw error
        }

        if (data) {
          setArticle(data)
          
          // Fetch related articles (same category first, then others if needed)
          let related: RelatedArticle[] = []
          
          // First, try to get articles from the same category
          const { data: sameCategory, error: sameCategoryError } = await supabase
            .from('resources')
            .select('id, title, slug, category, excerpt, image_url, tags, read_time, published, created_at')
            .eq('published', true)
            .eq('category', data.category)
            .neq('id', data.id)
            .limit(4)
            .order('created_at', { ascending: false })

          if (!sameCategoryError && sameCategory) {
            related = sameCategory
          }

          // If we don't have enough articles (less than 4), fetch from other categories
          if (related.length < 4) {
            const { data: otherCategory, error: otherCategoryError } = await supabase
              .from('resources')
              .select('id, title, slug, category, excerpt, image_url, tags, read_time, published, created_at')
              .eq('published', true)
              .neq('category', data.category)
              .neq('id', data.id)
              .limit(4 - related.length)
              .order('created_at', { ascending: false })

            if (!otherCategoryError && otherCategory) {
              // Combine and remove duplicates
              const existingIds = new Set(related.map(a => a.id))
              const additional = otherCategory.filter(a => !existingIds.has(a.id))
              related = [...related, ...additional].slice(0, 4)
            }
          }

          setRelatedArticles(related)
        }
      } catch (err) {
        console.error('Error fetching article:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [slug])

  // Fallback to static resources
  const staticResource = RESOURCES.find(r => r.slug === slug)
  
  // Use database article if available, otherwise use static resource
  const resource: ResourceContent | undefined = article ? {
    id: article.id as any, // Convert string to any for compatibility with static resources
    title: article.title,
    slug: article.slug,
    category: article.category,
    excerpt: article.excerpt,
    image: article.image_url || '/images/resource-ocean.jpg',
    tags: article.tags || [],
    readTime: article.read_time,
    updated: format(new Date(article.updated_at || article.created_at), 'MMMM yyyy'),
    content: parseContent(article.content),
    audience: undefined // Database articles don't have audience field
  } : staticResource

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-primary-50/20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    )
  }

  if (!resource) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-primary-50/20">
        <div className="text-center bg-white rounded-2xl shadow-xl p-12 max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Article Not Found</h1>
          <p className="text-gray-600 mb-6">The article you're looking for doesn't exist.</p>
          <Link 
            to="/resources" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Resources
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-gray-50">
      {/* Enhanced Hero Section */}
      <section className="hero-section relative bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white py-20 sm:py-24 md:py-28 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <Link
            to="/resources"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-8 transition-colors group bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Resources</span>
          </Link>

          <div className="max-w-5xl">
            <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold border border-white/30">
                {resource.category}
              </span>
              {resource.tags.map(tag => (
                <span key={tag} className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm border border-white/20">
                  {tag}
                </span>
              ))}
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              {resource.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-white/95">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                <Clock className="w-5 h-5" />
                <span className="text-sm font-semibold">{resource.readTime} min read</span>
              </div>
              {!article && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                  <Users className="w-5 h-5" />
                  <span className="text-sm font-semibold">{resource.audience || 'General'}</span>
                </div>
              )}
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                <Calendar className="w-5 h-5" />
                <span className="text-sm font-semibold">{resource.updated || 'January 2026'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content - Enhanced */}
      <article className="py-12 sm:py-16 px-4 sm:px-8 md:px-16 lg:px-[200px] xl:px-[200px]">
        <div className="grid lg:grid-cols-12 gap-8 max-w-full">
          {/* Main Content */}
          <div className="lg:col-span-8">
              {resource.image && (
              <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden mb-8">
                  <img
                    src={resource.image}
                    alt={resource.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                    target.src = '/images/resource-ocean.jpg'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                  <div className="text-white text-sm">
                      <span className="font-medium">Featured Article</span>
                    </div>
                  </div>
                </div>
              )}

            {/* Article Meta */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 pb-8 border-b-2 border-gray-100">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={async () => {
                        try {
                          // Try native share API first (mobile)
                          if (navigator.share) {
                            await navigator.share({
                              title: resource.title,
                              text: resource.excerpt,
                              url: window.location.href
                            })
                            return
                          }
                        } catch (err) {
                          // User cancelled share, fall through to clipboard
                        }
                        
                        // Copy to clipboard
                        try {
                          await navigator.clipboard.writeText(window.location.href)
                          toast.success('Link copied to clipboard!')
                        } catch (err) {
                          toast.error('Failed to copy link')
                        }
                      }}
                      className="flex items-center gap-2 px-5 py-3 bg-primary-50 text-primary-600 rounded-xl hover:bg-primary-100 transition-all shadow-md hover:shadow-lg group"
                    >
                      <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-semibold">Share Article</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                <span>{resource.readTime} min</span>
                    <span>•</span>
                    <span>{resource.updated || 'Jan 2026'}</span>
                  </div>
                </div>

            {/* Article Body */}
                <div className="prose prose-lg max-w-none">
              <p className="text-xl sm:text-2xl text-gray-800 leading-relaxed font-semibold mb-10">
                      {resource.excerpt}
                    </p>

                  {resource.content && (
                    <div className="space-y-8 sm:space-y-10">
                      {resource.content.map((section, index) => (
                    <div key={index}>
                            {section.heading && (
                              <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                                  <span className="text-white font-bold text-lg">{index + 1}</span>
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            {section.heading.replace(/^\d+\.\s*/, '')}
                                </h3>
                              </div>
                            )}
                            {section.paragraphs && section.paragraphs.map((para, pIndex) => (
                              <div key={pIndex} className="mb-6 last:mb-0">
                                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                                  {para}
                                </p>
                              </div>
                            ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

            {/* CTA Section */}
                <div className="mt-12 sm:mt-16 pt-10 border-t-2 border-gray-100">
              <div className="text-center">
                <h3 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">Need to talk to someone?</h3>
                <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Browse our directory to find a professional near you.
                      </p>
                      <Link
                        to="/"
                  className="inline-flex items-center gap-3 px-8 sm:px-10 py-4 sm:py-5 bg-primary-500 text-white rounded-xl font-bold text-lg hover:bg-primary-600 transition-all"
                      >
                        Find Support
                      </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* Article Info */}
            <div>
              <h4 className="text-xl font-bold mb-6 text-gray-900">Article Info</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Read Time</span>
                  <span className="font-bold text-lg text-gray-900">{resource.readTime} min</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Category</span>
                  <span className="font-bold text-sm text-gray-900">{resource.category.split(' ')[0]}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Updated</span>
                  <span className="font-bold text-sm text-gray-900">{resource.updated || 'Jan 2026'}</span>
                </div>
              </div>
            </div>

            {/* Related Resources */}
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-6">
                Related Articles
              </h4>
              <div className="space-y-4">
                {article ? (
                  // Show related articles from database
                  relatedArticles.length > 0 ? (
                    relatedArticles.map(related => (
                      <Link
                        key={related.id}
                        to={`/resources/${related.slug}`}
                        className="block p-4 hover:bg-primary-50 transition-all group"
                      >
                        <h5 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                          {related.title}
                        </h5>
                        <div className="text-xs text-gray-500">
                          <span>{related.read_time} min read</span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No related articles found.</p>
                  )
                ) : (
                  // Fallback to static resources
                  RESOURCES.filter(r => r.id !== resource.id).slice(0, 4).map(related => (
                    <Link
                      key={related.id}
                      to={`/resources/${related.slug}`}
                      className="block p-4 hover:bg-primary-50 transition-all group"
                    >
                      <h5 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                        {related.title}
                      </h5>
                      <div className="text-xs text-gray-500">
                        <span>{related.readTime} min read</span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Tags */}
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {resource.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium border border-primary-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
