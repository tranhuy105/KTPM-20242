export interface CategoryAncestor {
  _id: string;
  name: string;
  slug: string;
}

export interface ProductCategory {
  _id: string;
  name: string;
  slug: string;
  ancestors: CategoryAncestor[];
  id: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  id?: string;
  description?: string;
  image?: string;
  parent?: {
    _id: string;
    name: string;
    slug: string;
    id?: string;
  };
  ancestors?: CategoryAncestor[];
  isActive?: boolean;
  productsCount?: number;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

export interface CategoryFilters {
  parent?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Represents a simplified Category object used in the 'ancestors' array.
 */
export interface ProductFilterCategoryAncestor {
  _id: string;
  name: string;
  slug: string;
  id: string;
}

/**
 * Represents a single Category object in the 'flat' list.
 */
export interface ProductFilterCategoryFlat {
  _id: string;
  name: string;
  slug: string;
  parent: string | null; // Can be null for top-level categories
  ancestors: ProductFilterCategoryAncestor[];
  id: string; // Note: The JSON includes both _id and id which are the same string. Including both for exact mapping.
}

/**
 * Represents a single Category object in the 'hierarchical' tree structure.
 * This type is recursive to represent nested children.
 */
export interface ProductFilterCategoryHierarchical {
  _id: string;
  name: string;
  slug: string;
  children: ProductFilterCategoryHierarchical[]; // Can be an empty array
  // Note: parent, ancestors, and id are not present in the hierarchical structure based on the provided JSON.
}

/**
 * Represents the updated structure for the 'categories' section,
 * containing both a flat list and a hierarchical tree.
 */
export interface ProductFilterCategories {
  flat: ProductFilterCategoryFlat[];
  hierarchical: ProductFilterCategoryHierarchical[];
}
