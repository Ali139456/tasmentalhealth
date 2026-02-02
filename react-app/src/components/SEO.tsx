import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  type?: string
  url?: string
  structuredData?: object
}

export function SEO({
  title = 'Tasmanian Mental Health Directory | Find Support or List Your Practice',
  description = 'Tasmanian Mental Health Directory - Find trusted mental health professionals across Hobart, Launceston, and beyond.',
  keywords = 'mental health Tasmania, psychologists Hobart, counsellors Launceston, therapy near me Tasmania, mental health professionals, mental health directory',
  image = '/images/hero-mountain.jpg',
  type = 'website',
  url,
  structuredData
}: SEOProps) {
  const location = useLocation()
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://tasmentalhealthdirectory.com.au'
  const fullUrl = url || `${siteUrl}${location.pathname}`
  const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`

  useEffect(() => {
    // Update document title
    document.title = title

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, attribute: string = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attribute, name)
        document.head.appendChild(element)
      }
      element.setAttribute('content', content)
    }

    // Basic meta tags
    updateMetaTag('description', description)
    updateMetaTag('keywords', keywords)

    // Open Graph tags
    updateMetaTag('og:title', title, 'property')
    updateMetaTag('og:description', description, 'property')
    updateMetaTag('og:image', fullImageUrl, 'property')
    updateMetaTag('og:url', fullUrl, 'property')
    updateMetaTag('og:type', type, 'property')
    updateMetaTag('og:site_name', 'Tasmanian Mental Health Directory', 'property')

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image')
    updateMetaTag('twitter:title', title)
    updateMetaTag('twitter:description', description)
    updateMetaTag('twitter:image', fullImageUrl)

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', fullUrl)

    // Structured Data (JSON-LD)
    let structuredDataScript = document.querySelector('script[type="application/ld+json"]')
    if (structuredData) {
      if (!structuredDataScript) {
        structuredDataScript = document.createElement('script')
        structuredDataScript.setAttribute('type', 'application/ld+json')
        document.head.appendChild(structuredDataScript)
      }
      structuredDataScript.textContent = JSON.stringify(structuredData)
    } else if (structuredDataScript) {
      structuredDataScript.remove()
    }
  }, [title, description, keywords, image, type, url, fullUrl, fullImageUrl, structuredData])

  return null
}
