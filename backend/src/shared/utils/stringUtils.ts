// Description: String manipulation and encoding utilities

/**
 * Decodes HTML entities in a string
 * Converts HTML-encoded characters back to their original form
 *
 * @param str - The string containing HTML entities to decode
 * @returns The decoded string
 *
 * @example
 * decodeHtmlEntities('4&#x2F;0ATX...') // Returns '4/0ATX...'
 */
export function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#x2F;/g, "/")
    .replace(/&#x3D;/g, "=")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
