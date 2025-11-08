/**
 * Category DTO
 * Represents a template category
 */
export type ApiCategory = {
  id: string;
  name: string;
};

/**
 * Categories List Response
 */
export type CategoriesListResponse = {
  categories: ApiCategory[];
};

