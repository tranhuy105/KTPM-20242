import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { Product } from "../../types";
import ProductCard from "./ProductCard";
import { ChevronLeft, ChevronRight, Loader } from "lucide-react";

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

  useEffect(() => {
    setDisplayedProducts(products);
  }, [products]);

  const handlePageChange = (newPage: number) => {
    if (onPageChange && newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if there are fewer than maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(1);

      // Calculate start and end of page range
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if at the beginning
      if (currentPage <= 3) {
        endPage = 4;
      }

      // Adjust if at the end
      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
      }

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push("...");
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push("...");
      }

      // Always include last page
      pages.push(totalPages);
    }

    return pages;
  };

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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {displayedProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {onPageChange && totalPages > 1 && (
            <div className="mt-12 flex flex-col items-center">
              <div className="text-sm text-gray-500 mb-4">
                {t("products.showing")}{" "}
                {(currentPage - 1) * products.length + 1}-
                {Math.min(currentPage * products.length, totalProducts)}{" "}
                {t("products.of")} {totalProducts} {t("products.items")}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border ${
                    currentPage === 1
                      ? "border-gray-200 text-gray-300 cursor-not-allowed"
                      : "border-gray-300 text-gray-700 hover:bg-amber-50 hover:border-amber-300"
                  } transition-colors`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      typeof page === "number" && handlePageChange(page)
                    }
                    disabled={page === "..."}
                    className={`flex items-center justify-center w-10 h-10 rounded-full border ${
                      page === currentPage
                        ? "bg-amber-600 border-amber-600 text-white"
                        : page === "..."
                        ? "border-transparent text-gray-500"
                        : "border-gray-300 text-gray-700 hover:bg-amber-50 hover:border-amber-300"
                    } transition-colors`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border ${
                    currentPage === totalPages
                      ? "border-gray-200 text-gray-300 cursor-not-allowed"
                      : "border-gray-300 text-gray-700 hover:bg-amber-50 hover:border-amber-300"
                  } transition-colors`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductGrid;
