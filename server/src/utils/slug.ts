/**
 * Utility functions for generating and validating slugs
 */

/**
 * Convert a string to a URL-friendly slug
 * @param text The input text to convert
 * @returns URL-friendly slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Replace spaces and special characters with hyphens
    .replace(/[^\w\s-]/g, '') // Remove non-word chars except spaces and hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
}

/**
 * Generate a unique slug by appending a number if the slug already exists
 * @param baseSlug The base slug to start with
 * @param existingSlugs Array of existing slugs to check against
 * @returns Unique slug
 */
export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug;
  let counter = 1;

  // If base slug exists, append number until we find a unique one
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Validate if a string is a valid slug format
 * @param slug The slug to validate
 * @returns True if valid, false otherwise
 */
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9-]+$/;
  return slugRegex.test(slug) && slug.length > 0;
}