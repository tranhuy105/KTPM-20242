import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { Product } from "../../types";
import ProductCard from "./ProductCard";
import { Loader } from "lucide-react";
import Masonry from "react-masonry-css";
import Pagination from "../common/Pagination";

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  totalProducts?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const ProductGrid = ({
  products,
  isLoading,
  totalProducts = 0,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: ProductGridProps) => {
  const { t } = useTranslation();
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);

  // Breakpoints for the masonry layout
  const breakpointColumnsObj = {
    default: 4, // default is 4 columns
    1280: 4, // lg: 4 columns
    1024: 3, // md: 3 columns
    768: 2, // sm: 2 columns
    640: 1, // xs: 1 column
  };

  useEffect(() => {
    setDisplayedProducts(products);
  }, [products]);

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="min-h-[400px] flex items-center justify-center">
          <Loader className="h-12 w-12 animate-spin text-amber-600" />
        </div>
      ) : displayedProducts.length === 0 ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 border border-gray-200 rounded-lg bg-white">
          <div className="text-5xl mb-4">✨</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {t("products.noProductsFound")}
          </h3>
          <p className="text-gray-500 max-w-md">
            {t("products.tryDifferentFilters")}
          </p>
        </div>
      ) : (
        <>
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="flex w-auto -ml-6 md:-ml-8"
            columnClassName="pl-6 md:pl-8 bg-clip-padding"
          >
            {displayedProducts.map((product) => (
              <div key={product._id} className="mb-6 md:mb-8">
                <ProductCard product={product} isMasonry={true} />
              </div>
            ))}
          </Masonry>

          {/* Pagination */}
          {onPageChange && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalProducts}
              itemsPerPage={products.length}
              onPageChange={onPageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ProductGrid;
