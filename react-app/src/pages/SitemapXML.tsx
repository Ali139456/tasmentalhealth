import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function SitemapXML() {
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
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

        // Add static pages
        staticPages.forEach(page => {
          xml += '  <url>\n'
          xml += `    <loc>${baseUrl}${page.path}</loc>\n`
          xml += `    <lastmod>${currentDate}</lastmod>\n`
          xml += `    <changefreq>${page.changefreq}</changefreq>\n`
          xml += `    <priority>${page.priority}</priority>\n`
          xml += '  </url>\n'
        })

        // Add articles
        articles?.forEach(article => {
          const lastmod = article.updated_at ? new Date(article.updated_at).toISOString().split('T')[0] : currentDate
          xml += '  <url>\n'
          xml += `    <loc>${baseUrl}/resources/${article.slug}</loc>\n`
          xml += `    <lastmod>${lastmod}</lastmod>\n`
          xml += '    <changefreq>monthly</changefreq>\n'
          xml += '    <priority>0.7</priority>\n'
          xml += '  </url>\n'
        })

        // Add listings
        listings?.forEach(listing => {
          const lastmod = listing.updated_at ? new Date(listing.updated_at).toISOString().split('T')[0] : currentDate
          xml += '  <url>\n'
          xml += `    <loc>${baseUrl}/listing/${listing.id}</loc>\n`
          xml += `    <lastmod>${lastmod}</lastmod>\n`
          xml += '    <changefreq>monthly</changefreq>\n'
          xml += '    <priority>0.6</priority>\n'
          xml += '  </url>\n'
        })

        // Add events
        events?.forEach(event => {
          const lastmod = event.updated_at ? new Date(event.updated_at).toISOString().split('T')[0] : currentDate
          xml += '  <url>\n'
          xml += `    <loc>${baseUrl}/events#event-${event.id}</loc>\n`
          xml += `    <lastmod>${lastmod}</lastmod>\n`
          xml += '    <changefreq>weekly</changefreq>\n'
          xml += '    <priority>0.5</priority>\n'
          xml += '  </url>\n'
        })

        xml += '</urlset>'

        // Set content type and return XML
        const headers = new Headers()
        headers.set('Content-Type', 'application/xml; charset=utf-8')
        
        // This component should be used with a route that returns XML
        // For now, we'll just log it - you'll need to set up a server route
      } catch (error) {
        console.error('Error generating sitemap:', error)
      }
    }

    generateSitemap()
  }, [])

  return null
}
