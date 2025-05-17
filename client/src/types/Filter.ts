import type { ProductFilterBrand } from "./Brand";
import type { ProductFilterCategories } from "./Category";

export interface ProductFilterPriceRange {
  min: number;
  max: number;
}

export interface AvailableProductFilters {
  brands: ProductFilterBrand[];
  categories: ProductFilterCategories;
  colors: string[];
  sizes: string[];
  materials: string[];
  priceRange: ProductFilterPriceRange;
}
