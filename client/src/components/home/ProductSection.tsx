import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Product } from "../../types";
import ProductCard from "../product/ProductCard";

interface ProductSectionProps {
  title: string;
  viewAllLink: string;
  fetchProducts: () => Promise<Product[]>;
}

const ProductSection = ({
  title,
  viewAllLink,
  fetchProducts,
}: ProductSectionProps) => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [fetchProducts]);

  return (
    <div className="py-20 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-center">
            {title}
          </h2>
          <div className="h-0.5 w-16 bg-amber-500 mb-6"></div>
          <Link
            to={viewAllLink}
            className="text-sm font-medium text-gray-700 hover:text-amber-600 transition-colors flex items-center"
          >
            {t("common.viewAll")}
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-w-1 aspect-h-1 w-full bg-gray-200 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                isMasonry={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSection;
