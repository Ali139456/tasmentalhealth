/**
 * HTML Sanitization Utility
 * 
 * Basic sanitization for HTML content from admin-controlled sources.
 * For production, consider using a library like DOMPurify for more robust protection.
 */

/**
 * Sanitizes HTML content by escaping dangerous characters
 * This is a basic sanitizer - for production, use DOMPurify or similar
 */
export function sanitizeHTML(html: string): string {
  if (!html || typeof html !== 'string') return ''
  
  // Escape HTML entities to prevent XSS
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Sanitizes HTML but allows safe tags (for admin content that needs formatting)
 * Only allows basic formatting tags: <strong>, <em>, <p>, <br>, <a>
 */
export function sanitizeHTMLWithSafeTags(html: string): string {
  if (!html || typeof html !== 'string') return ''
  
  // Remove script tags and event handlers
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
    .replace(/javascript:/gi, '') // Remove javascript: protocol
  
  // Allow only safe tags
  const allowedTags = ['strong', 'em', 'p', 'br', 'a', 'b', 'i', 'u']
  const tagRegex = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi
  
  sanitized = sanitized.replace(tagRegex, (match, tagName) => {
    if (allowedTags.includes(tagName.toLowerCase())) {
      // For anchor tags, only allow href attribute and sanitize URL
      if (tagName.toLowerCase() === 'a') {
        const hrefMatch = match.match(/href=["']([^"']*)["']/i)
        if (hrefMatch && hrefMatch[1]) {
          const url = hrefMatch[1]
          // Only allow http, https, or relative URLs
          if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/') || url.startsWith('#')) {
            return match
          }
        }
        return match.replace(/href=["'][^"']*["']/i, '') // Remove unsafe href
      }
      return match
    }
    return '' // Remove disallowed tags
  })
  
  return sanitized
}

/**
 * Sanitizes user input for database queries
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return ''
  
  // Remove SQL wildcards and escape special characters
  return input
    .trim()
    .replace(/[%_\\]/g, '') // Remove SQL wildcards
    .replace(/[<>\"']/g, '') // Remove potentially dangerous characters
}
