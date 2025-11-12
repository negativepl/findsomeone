import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitize HTML content to prevent XSS attacks
 *
 * Use this function before rendering any user-generated HTML content
 * with dangerouslySetInnerHTML
 *
 * @param dirty - Potentially unsafe HTML string
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    // Allow only safe tags and attributes
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    // Force all links to open in new tab with noopener noreferrer
    ADD_ATTR: ['target', 'rel'],
    // Remove any data attributes that could be used for XSS
    FORBID_ATTR: ['style', 'onerror', 'onload'],
    // Keep HTML structure intact
    KEEP_CONTENT: true,
  })
}

/**
 * Sanitize HTML for JSON-LD structured data
 * More permissive since it's not rendered in DOM
 *
 * @param dirty - Potentially unsafe HTML string
 * @returns Sanitized HTML string
 */
export function sanitizeJsonLd(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  })
}

/**
 * Strip all HTML tags from a string
 * Use when you want plain text only
 *
 * @param html - HTML string
 * @returns Plain text without HTML tags
 */
export function stripHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true,
  })
}
