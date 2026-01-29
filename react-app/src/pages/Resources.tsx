import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { RESOURCES } from '../lib/resourceContent'

const RESOURCES_PER_PAGE = 6

interface Article {
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

export function Resources() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false) // Start with false to show static resources immediately

  // Fetch articles from database (only fields needed for listing)
  useEffect(() => {
    let isMounted = true
    
    const fetchArticles = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('resources')
          .select('id, title, slug, category, excerpt, image_url, tags, read_time, published, created_at')
          .eq('published', true)
          .order('created_at', { ascending: false })

        if (error) throw error
        
        if (isMounted) {
          setArticles(data || [])
        }
      } catch (err) {
        console.error('Error fetching articles:', err)
        // On error, still show static resources
        if (isMounted) {
          setArticles([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchArticles()
    
    return () => {
      isMounted = false
    }
  }, [])

  // Combine database articles with static resources
  const allResources = [
    ...articles.map(article => ({
      id: article.id,
      title: article.title,
      category: article.category,
      excerpt: article.excerpt,
      image: article.image_url || '/images/resource-ocean.jpg',
      tags: article.tags || [],
      readTime: article.read_time,
      slug: article.slug
    })),
    ...RESOURCES.map(resource => ({
      id: resource.id.toString(),
      title: resource.title,
      category: resource.category,
      excerpt: resource.excerpt,
      image: resource.image,
      tags: resource.tags,
      readTime: resource.readTime,
      slug: resource.slug
    }))
  ]

  // Get unique categories from all resources
  const uniqueCategories = Array.from(new Set(allResources.map(r => r.category)))
  const CATEGORIES = ['All', ...uniqueCategories.sort()]

  const filteredResources = allResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === 'All' || resource.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategory])

  // Pagination logic
  const totalPages = Math.ceil(filteredResources.length / RESOURCES_PER_PAGE)
  const startIndex = (currentPage - 1) * RESOURCES_PER_PAGE
  const endIndex = startIndex + RESOURCES_PER_PAGE
  const paginatedResources = filteredResources.slice(startIndex, endIndex)

  const scrollToResources = () => {
    const resourcesSection = document.getElementById('resources-grid')
    if (resourcesSection) {
      resourcesSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const goToPage = (page: number) => {
    setCurrentPage(page)
    setTimeout(scrollToResources, 100)
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
      setTimeout(scrollToResources, 100)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      setTimeout(scrollToResources, 100)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/20 to-gray-50">
      {/* Hero Section */}
      <section className="hero-section bg-gradient-to-r from-primary-500 to-primary-600 text-white py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <span className="text-primary-100 font-semibold text-sm sm:text-lg mb-2 block">Knowledge Hub</span>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 px-2">Mental Health Insights & Resources</h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 px-2">
              Expert guides to help you navigate the mental health system in Tasmania, whether you are seeking support, supporting a loved one, or running a practice.
            </p>
            <div className="max-w-2xl mx-auto relative px-2">
              <Search className="absolute left-4 sm:left-5 top-1/2 transform -translate-y-1/2 text-primary-600 w-6 h-6 sm:w-7 sm:h-7 z-10" />
              <input
                type="text"
                placeholder="Search for topics, guides, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 sm:pl-16 pr-3 sm:pr-4 py-3 sm:py-4 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base shadow-md"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="px-4 sm:px-8 md:px-16 lg:px-[200px] xl:px-[200px] py-8 sm:py-12">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-8 sm:mb-12 justify-center">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-xl font-semibold transition-all transform hover:scale-105 text-xs sm:text-sm md:text-base ${
                selectedCategory === category
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-primary-50 border-2 border-gray-200 hover:border-primary-300 shadow-md'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Resources Grid */}
        <div id="resources-grid" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
          {loading && articles.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
              <p className="mt-4 text-gray-600">Loading articles...</p>
            </div>
          ) : paginatedResources.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 text-lg">No articles found matching your search.</p>
            </div>
          ) : (
            paginatedResources.map(resource => (
            <article key={resource.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-100">
              <div className="relative overflow-hidden">
                <img
                  src={resource.image}
                  alt={resource.title}
                  className="w-full h-40 sm:h-48 md:h-56 object-cover transition-transform duration-300 hover:scale-110"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/images/resource-ocean.jpg'
                  }}
                />
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                  <span className="px-3 sm:px-4 py-1.5 bg-primary-500 text-white rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap">
                    {resource.category}
                  </span>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                  {resource.tags.map(tag => (
                    <span key={tag} className="text-xs text-gray-500 font-medium">{tag}</span>
                  ))}
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900 leading-tight">
                  <Link to={`/resources/${resource.slug}`} className="hover:text-primary-600 transition-colors">
                    {resource.title}
                  </Link>
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">{resource.excerpt}</p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 pt-3 sm:pt-4 border-t border-gray-100">
                  <span className="text-xs sm:text-sm text-gray-500">
                    {resource.readTime} min read
                  </span>
                  <Link
                    to={`/resources/${resource.slug}`}
                    className="text-primary-600 hover:text-primary-700 font-semibold text-xs sm:text-sm flex items-center gap-1 group self-start sm:self-auto"
                  >
                    Read Article
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </article>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mb-8 sm:mb-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredResources.length)} of {filteredResources.length} resources
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-600 border border-gray-200 shadow-sm hover:shadow-md'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`w-10 h-10 rounded-xl font-semibold transition-all ${
                          currentPage === page
                            ? 'bg-primary-500 text-white shadow-md'
                            : 'bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-600 border border-gray-200'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="px-2 text-gray-400">
                        ...
                      </span>
                    )
                  }
                  return null
                })}
              </div>

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-600 border border-gray-200 shadow-sm hover:shadow-md'
                }`}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 sm:p-8 md:p-10 text-center text-white shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">Need personalised support?</h2>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8">While guides are helpful, talking to a professional can make a world of difference.</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              to="/"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-primary-50 transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base"
            >
              Find a Professional
            </Link>
            <Link
              to="/crisis-support"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-primary-700 text-white border-2 border-white/30 rounded-xl font-semibold hover:bg-primary-800 transition-all transform hover:scale-105 text-sm sm:text-base"
            >
              Crisis Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
