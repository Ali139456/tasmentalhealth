import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, MapPin, Phone, Globe, BookOpen, FileText, Home, Heart, Shield } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { RESOURCES } from '../lib/resourceContent'
import type { Listing } from '../types'

interface SearchResult {
  type: 'listing' | 'resource' | 'page'
  id: string
  title: string
  description: string
  url: string
  metadata?: {
    location?: string
    phone?: string
    category?: string
    tags?: string[]
  }
}

export function SearchResults() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (query.trim()) {
      performSearch(query)
    } else {
      setResults([])
      setLoading(false)
    }
  }, [query])

  const performSearch = async (searchQuery: string) => {
    setLoading(true)
    const lowerQuery = searchQuery.toLowerCase().trim()
    const allResults: SearchResult[] = []

    try {
      // Search Listings
      const { data: listingsData, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'approved')
        .or(`practice_name.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%,profession.ilike.%${searchQuery}%`)

      if (!error && listingsData) {
        listingsData.forEach((listing: Listing) => {
          const matchesName = listing.practice_name.toLowerCase().includes(lowerQuery)
          const matchesBio = listing.bio?.toLowerCase().includes(lowerQuery)
          const matchesLocation = listing.location.toLowerCase().includes(lowerQuery)
          const matchesSpecialty = listing.specialties?.some(s => s.toLowerCase().includes(lowerQuery))
          const matchesProfession = listing.profession.toLowerCase().includes(lowerQuery)

          if (matchesName || matchesBio || matchesLocation || matchesSpecialty || matchesProfession) {
            allResults.push({
              type: 'listing',
              id: listing.id,
              title: listing.practice_name,
              description: listing.bio || `${listing.profession} in ${listing.location}`,
              url: `/?search=${encodeURIComponent(searchQuery)}#directory`,
              metadata: {
                location: listing.location,
                phone: listing.show_phone_publicly ? listing.phone : undefined,
                category: listing.profession
              }
            })
          }
        })
      }

      // If no database results, search sample listings
      if (allResults.filter(r => r.type === 'listing').length === 0) {
        const sampleListings = [
          {
            practice_name: 'Somnus Psychology',
            profession: 'Clinical Psychologist',
            bio: 'Somnus Psychology supports sleep and emotional wellbeing through CBT-I and individual therapy.',
            location: 'Hobart',
            specialties: ['Sleep', 'Anxiety', 'Neuromodulation', 'Depression', 'Trauma'],
            phone: '(03) 6234 5678'
          },
          {
            practice_name: 'Dr. Sarah Mitchell',
            profession: 'Psychologist',
            bio: 'Experienced psychologist specializing in anxiety, depression, and trauma-informed care.',
            location: 'Hobart',
            specialties: ['Anxiety', 'Depression', 'Trauma', 'CBT'],
            phone: '(03) 6234 5678'
          },
          {
            practice_name: 'Chloe Stone Psychology',
            profession: 'Psychologist',
            bio: 'Chloe Stone is a registered psychologist offering compassionate and evidence-based therapy.',
            location: 'Statewide (Telehealth)',
            specialties: ['Anxiety', 'Depression', 'Youth Mental Health', 'Telehealth'],
            phone: '(03) 6123 4567'
          }
        ]

        sampleListings.forEach((listing, idx) => {
          const matchesName = listing.practice_name.toLowerCase().includes(lowerQuery)
          const matchesBio = listing.bio?.toLowerCase().includes(lowerQuery)
          const matchesLocation = listing.location.toLowerCase().includes(lowerQuery)
          const matchesSpecialty = listing.specialties?.some(s => s.toLowerCase().includes(lowerQuery))
          const matchesProfession = listing.profession.toLowerCase().includes(lowerQuery)

          if (matchesName || matchesBio || matchesLocation || matchesSpecialty || matchesProfession) {
            allResults.push({
              type: 'listing',
              id: `sample-${idx}`,
              title: listing.practice_name,
              description: listing.bio || `${listing.profession} in ${listing.location}`,
              url: `/?search=${encodeURIComponent(searchQuery)}#directory`,
              metadata: {
                location: listing.location,
                phone: listing.phone,
                category: listing.profession
              }
            })
          }
        })
      }
    } catch (error) {
      console.error('Error searching listings:', error)
    }

    // Search Resources
    RESOURCES.forEach(resource => {
      const matchesTitle = resource.title.toLowerCase().includes(lowerQuery)
      const matchesExcerpt = resource.excerpt.toLowerCase().includes(lowerQuery)
      const matchesCategory = resource.category.toLowerCase().includes(lowerQuery)
      const matchesTags = resource.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      const matchesContent = resource.content?.some(section => 
        section.paragraphs.some(para => para.toLowerCase().includes(lowerQuery))
      )

      if (matchesTitle || matchesExcerpt || matchesCategory || matchesTags || matchesContent) {
        allResults.push({
          type: 'resource',
          id: resource.id.toString(),
          title: resource.title,
          description: resource.excerpt,
          url: `/resources/${resource.slug}`,
          metadata: {
            category: resource.category,
            tags: resource.tags
          }
        })
      }
    })

    // Search Pages
    const pages = [
      {
        title: 'Home',
        description: 'Find mental health professionals across Tasmania. Search for psychologists, counsellors, and mental health social workers.',
        url: '/',
        keywords: ['home', 'directory', 'find', 'search', 'professionals', 'psychologists', 'counsellors']
      },
      {
        title: 'Crisis Support',
        description: 'Immediate help, hospital contacts, and personal safety planning. National helplines and state-specific resources.',
        url: '/crisis-support',
        keywords: ['crisis', 'emergency', 'help', 'support', 'safety', 'helpline', 'hospital']
      },
      {
        title: 'Resources',
        description: 'Expert guides on finding support and growing your practice in Tasmania. Articles and educational content.',
        url: '/resources',
        keywords: ['resources', 'articles', 'guides', 'information', 'education', 'learn']
      },
      {
        title: 'Events',
        description: 'Professional development, training, and networking opportunities for mental health professionals across Tasmania.',
        url: '/events',
        keywords: ['events', 'training', 'conference', 'workshop', 'professional development']
      }
    ]

    pages.forEach(page => {
      const matchesTitle = page.title.toLowerCase().includes(lowerQuery)
      const matchesDescription = page.description.toLowerCase().includes(lowerQuery)
      const matchesKeywords = page.keywords.some(kw => kw.includes(lowerQuery))

      if (matchesTitle || matchesDescription || matchesKeywords) {
        allResults.push({
          type: 'page',
          id: page.url,
          title: page.title,
          description: page.description,
          url: page.url
        })
      }
    })

    // Sort results: listings first, then resources, then pages
    allResults.sort((a, b) => {
      const typeOrder = { listing: 0, resource: 1, page: 2 }
      return typeOrder[a.type] - typeOrder[b.type]
    })

    setResults(allResults)
    setLoading(false)
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'listing':
        return <MapPin className="w-5 h-5" />
      case 'resource':
        return <BookOpen className="w-5 h-5" />
      case 'page':
        return <Home className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  const getResultColor = (type: string) => {
    switch (type) {
      case 'listing':
        return 'bg-primary-100 text-primary-700'
      case 'resource':
        return 'bg-blue-100 text-blue-700'
      case 'page':
        return 'bg-emerald-100 text-emerald-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/20 to-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Search Results</h1>
              {query && (
                <p className="text-gray-600 mt-1">
                  {loading ? 'Searching...' : `Found ${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Searching...</p>
          </div>
        ) : query.trim() === '' ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter a search term</h2>
            <p className="text-gray-600">Use the search bar in the header to search across the entire website.</p>
          </div>
        ) : results.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No results found</h2>
            <p className="text-gray-600 mb-6">We couldn't find anything matching "{query}". Try different keywords.</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Link to="/" className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                Browse Directory
              </Link>
              <Link to="/resources" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                View Resources
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result, idx) => (
              <Link
                key={`${result.type}-${result.id}-${idx}`}
                to={result.url}
                className="block bg-white rounded-xl shadow-lg hover:shadow-xl transition-all p-6 border border-gray-200 hover:border-primary-300"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${getResultColor(result.type)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    {getResultIcon(result.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{result.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getResultColor(result.type)}`}>
                        {result.type === 'listing' ? 'Professional' : result.type === 'resource' ? 'Article' : 'Page'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{result.description}</p>
                    {result.metadata && (
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        {result.metadata.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {result.metadata.location}
                          </span>
                        )}
                        {result.metadata.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {result.metadata.phone}
                          </span>
                        )}
                        {result.metadata.category && (
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                            {result.metadata.category}
                          </span>
                        )}
                        {result.metadata.tags && result.metadata.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {result.metadata.tags.slice(0, 3).map((tag, tagIdx) => (
                              <span key={tagIdx} className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
