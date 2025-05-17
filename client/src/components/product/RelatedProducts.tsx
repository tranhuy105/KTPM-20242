import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type { Product } from "../../types";
import ProductCard from "./ProductCard";
import productApi from "../../api/productApi";
import LoadingSpinner from "../common/LoadingSpinner";

interface RelatedProductsProps {
  productId: string;
  limit?: number;
}

const RelatedProducts = ({ productId, limit = 4 }: RelatedProductsProps) => {
  const { t } = useTranslation();
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const products = await productApi.getRelatedProducts(productId, limit);
        setRelatedProducts(products);
      } catch (err) {
        console.error("Error fetching related products:", err);
        setError(t("products.errors.relatedProducts"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [productId, limit, t]);

  if (isLoading) {
    return (
      <div className="py-12">
        <div className="relative mb-8">
          <div className="absolute top-0 left-0 w-1/5 h-px bg-gradient-to-r from-amber-400 to-amber-600"></div>
          <h2 className="text-2xl font-serif font-medium text-gray-900 pt-6 pb-3 border-b border-amber-100">
            {t("products.relatedProducts")}
          </h2>
        </div>
        <div className="flex justify-center py-16">
          <LoadingSpinner size="md" color="amber" />
        </div>
      </div>
    );
  }

  if (error || relatedProducts.length === 0) {
    return null; // Don't show the section if there are no related products
  }

  return (
    <div className="related-products py-12 bg-gradient-to-b from-white to-amber-50">
      <div className="relative mb-10">
        <div className="absolute top-0 left-0 w-1/5 h-px bg-gradient-to-r from-amber-400 to-amber-600"></div>
        <div className="flex justify-between items-center pt-6 pb-3 border-b border-amber-100">
          <h2 className="text-2xl font-serif font-medium text-gray-900">
            {t("products.relatedProducts")}
          </h2>
          <Link
            to="/products"
            className="text-amber-800 hover:text-amber-900 font-medium transition-colors flex items-center group"
          >
            <span>{t("common.viewAll")}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-1 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {relatedProducts.map((product) => (
          <div
            key={product._id}
            className="transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <ProductCard key={product._id} product={product} />
          </div>
        ))}
      </div>

      {/* Decorative element */}
      <div className="flex justify-center mt-12">
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
      </div>
    </div>
  );
};

export default RelatedProducts;
