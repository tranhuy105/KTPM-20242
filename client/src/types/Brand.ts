export interface Brand {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  isActive?: boolean;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  productsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFilterBrand {
  _id: string;
  name: string;
  slug: string;
  logo: string;
  productsCount: number;
}
