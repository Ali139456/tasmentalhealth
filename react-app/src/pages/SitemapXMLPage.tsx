import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function SitemapXMLPage() {
  const [xml, setXml] = useState('')

  useEffect(() => {
    const generateSitemap = async () => {
      try {
        // Fetch all published articles
        const { data: articles } = await supabase
          .from('resources')
          .select('slug, updated_at')
          .eq('published', true)

        // Fetch all approved listings
        const { data: listings } = await supabase
          .from('listings')
          .select('id, updated_at')
          .eq('status', 'approved')

        // Fetch all published events
        const { data: events } = await supabase
          .from('events')
          .select('id, updated_at')
          .eq('published', true)

        const baseUrl = 'https://tasmentalhealthdirectory.com.au'
        const currentDate = new Date().toISOString().split('T')[0]

        // Static pages
        const staticPages = [
          { path: '', priority: '1.0', changefreq: 'daily' },
          { path: '/crisis-support', priority: '0.9', changefreq: 'weekly' },
          { path: '/resources', priority: '0.9', changefreq: 'weekly' },
          { path: '/events', priority: '0.9', changefreq: 'weekly' },
          { path: '/get-listed', priority: '0.8', changefreq: 'monthly' },
          { path: '/featured-listings', priority: '0.8', changefreq: 'monthly' },
          { path: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
          { path: '/terms-of-service', priority: '0.3', changefreq: 'yearly' },
          { path: '/sitemap', priority: '0.3', changefreq: 'monthly' },
        ]

        // Generate XML
        let sitemapXml = '<?xml version="1.0" encoding="UTF-8"?>\n'
        sitemapXml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

        // Add static pages
        staticPages.forEach(page => {
          sitemapXml += '  <url>\n'
          sitemapXml += `    <loc>${baseUrl}${page.path}</loc>\n`
          sitemapXml += `    <lastmod>${currentDate}</lastmod>\n`
          sitemapXml += `    <changefreq>${page.changefreq}</changefreq>\n`
          sitemapXml += `    <priority>${page.priority}</priority>\n`
          sitemapXml += '  </url>\n'
        })

        // Add articles
        articles?.forEach(article => {
          const lastmod = article.updated_at ? new Date(article.updated_at).toISOString().split('T')[0] : currentDate
          sitemapXml += '  <url>\n'
          sitemapXml += `    <loc>${baseUrl}/resources/${article.slug}</loc>\n`
          sitemapXml += `    <lastmod>${lastmod}</lastmod>\n`
          sitemapXml += '    <changefreq>monthly</changefreq>\n'
          sitemapXml += '    <priority>0.7</priority>\n'
          sitemapXml += '  </url>\n'
        })

        // Add listings
        listings?.forEach(listing => {
          const lastmod = listing.updated_at ? new Date(listing.updated_at).toISOString().split('T')[0] : currentDate
          sitemapXml += '  <url>\n'
          sitemapXml += `    <loc>${baseUrl}/listing/${listing.id}</loc>\n`
          sitemapXml += `    <lastmod>${lastmod}</lastmod>\n`
          sitemapXml += '    <changefreq>monthly</changefreq>\n'
          sitemapXml += '    <priority>0.6</priority>\n'
          sitemapXml += '  </url>\n'
        })

        // Add events
        events?.forEach(event => {
          const lastmod = event.updated_at ? new Date(event.updated_at).toISOString().split('T')[0] : currentDate
          sitemapXml += '  <url>\n'
          sitemapXml += `    <loc>${baseUrl}/events#event-${event.id}</loc>\n`
          sitemapXml += `    <lastmod>${lastmod}</lastmod>\n`
          sitemapXml += '    <changefreq>weekly</changefreq>\n'
          sitemapXml += '    <priority>0.5</priority>\n'
          sitemapXml += '  </url>\n'
        })

        sitemapXml += '</urlset>'
        setXml(sitemapXml)
      } catch (error) {
        console.error('Error generating sitemap:', error)
      }
    }

    generateSitemap()
  }, [])

  // Return XML content
  useEffect(() => {
    if (xml) {
      // Set content type to XML
      document.contentType = 'application/xml'
    }
  }, [xml])

  if (!xml) {
    return <div>Generating sitemap...</div>
  }

  return <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{xml}</pre>
}
