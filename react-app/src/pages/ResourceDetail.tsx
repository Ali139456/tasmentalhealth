import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Clock, Calendar, Users, Share2 } from 'lucide-react'
import { RESOURCES } from '../lib/resourceContent'

export function ResourceDetail() {
  const { slug } = useParams<{ slug: string }>()
  
  const resource = RESOURCES.find(r => r.slug === slug)

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
      <section className="relative bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white py-20 sm:py-24 md:py-28 overflow-hidden">
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
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                <Users className="w-5 h-5" />
                <span className="text-sm font-semibold">{resource.audience || 'General'}</span>
              </div>
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
                <button className="flex items-center gap-2 px-5 py-3 bg-primary-50 text-primary-600 rounded-xl hover:bg-primary-100 transition-all shadow-md hover:shadow-lg group">
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
                {RESOURCES.filter(r => r.id !== resource.id).slice(0, 3).map(related => (
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
                ))}
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
