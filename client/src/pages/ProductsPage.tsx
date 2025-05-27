import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import productApi from "../api/productApi";
import Pagination from "../components/common/Pagination";
import ProductFilters from "../components/product/ProductFilters";
import ProductGrid from "../components/product/ProductGrid";
import ProductListItem from "../components/product/ProductListItem";
import ProductSort from "../components/product/ProductSort";
import ProductsHeader from "../components/product/ProductsHeader";
import type {
    AvailableProductFilters,
    Product,
    ProductFilterBrand,
    ProductFilters as ProductFiltersType,
} from "../types";

const ProductsPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [availableFilters, setAvailableFilters] =
    useState<AvailableProductFilters | null>(null);
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);

  // Parse URL parameters for initial filter state
  const parseUrlToFilters = (search: string): ProductFiltersType => {
    const searchParams = new URLSearchParams(search);
    return {
      page: parseInt(searchParams.get("page") || "1"),
      limit: 24,
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
      filters: {
        search: searchParams.get("search") || undefined,
        category: searchParams.get("category") || undefined,
        minPrice: searchParams.get("minPrice")
          ? parseInt(searchParams.get("minPrice") || "0")
          : undefined,
        maxPrice: searchParams.get("maxPrice")
          ? parseInt(searchParams.get("maxPrice") || "0")
          : undefined,
        brand: searchParams.get("brand") || undefined,
        color: searchParams.get("color") || undefined,
        size: searchParams.get("size") || undefined,
        material: searchParams.get("material") || undefined,
        isFeatured:
          searchParams.get("isFeatured") === "true" ? true : undefined,
      },
    };
  };

  const initialFilters = parseUrlToFilters(location.search);
  const [filters, setFilters] = useState<ProductFiltersType>(initialFilters);

  // Fetch available filters from API - only once on component mount
  useEffect(() => {
    const fetchAvailableFilters = async () => {
      setIsLoadingFilters(true);
      try {
        const data = await productApi.getAllProductFilters();
        setAvailableFilters(data);
      } catch (error) {
        console.error("Error fetching available filters:", error);
      } finally {
        setIsLoadingFilters(false);
      }
    };

    fetchAvailableFilters();
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    // Add pagination and sorting
    if (filters.page && filters.page > 1)
      params.set("page", filters.page.toString());
    if (filters.limit && filters.limit !== 12)
      params.set("limit", filters.limit.toString());
    if (filters.sortBy && filters.sortBy !== "createdAt")
      params.set("sortBy", filters.sortBy);
    if (filters.sortOrder && filters.sortOrder !== "desc")
      params.set("sortOrder", filters.sortOrder);

    // Add filter fields (flat structure, not nested)
    if (filters.filters?.search) params.set("search", filters.filters.search);
    if (filters.filters?.category)
      params.set("category", filters.filters.category);
    if (filters.filters?.minPrice)
      params.set("minPrice", filters.filters.minPrice.toString());
    if (filters.filters?.maxPrice)
      params.set("maxPrice", filters.filters.maxPrice.toString());
    if (filters.filters?.brand) params.set("brand", filters.filters.brand);
    if (filters.filters?.color) params.set("color", filters.filters.color);
    if (filters.filters?.size) params.set("size", filters.filters.size);
    if (filters.filters?.material)
      params.set("material", filters.filters.material);
    if (filters.filters?.isFeatured) params.set("isFeatured", "true");

    // Use string comparison to avoid unnecessary navigation
    const newSearch = params.toString();
    const currentSearch = location.search.replace(/^\?/, ""); // Remove leading ? for comparison

    if (newSearch !== currentSearch) {
      navigate({ search: newSearch }, { replace: true });
    }
  }, [filters, navigate, location.search]);

  // Fetch products when filters change
  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // Transform our internal filter structure to match what the API expects
        const apiFilters = {
          page: filters.page,
          limit: filters.limit,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
          ...filters.filters,
        };

        const data = await productApi.getAllProducts(apiFilters);

        // Only update state if component is still mounted
        if (isMounted) {
          if (data.products && data.pagination) {
            setProducts(data.products);
            setTotalProducts(data.pagination.totalCount);
            setCurrentPage(data.pagination.currentPage);
            setTotalPages(data.pagination.totalPages);
          } else {
            setProducts([]);
            setTotalProducts(0);
            setCurrentPage(1);
            setTotalPages(1);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching products:", error);
          setProducts([]);
          setTotalProducts(0);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProducts();

    // Cleanup function to handle unmounting
    return () => {
      isMounted = false;
    };
  }, [
    // Stringify the filters to prevent unnecessary re-fetching
    JSON.stringify({
      page: filters.page,
      limit: filters.limit,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      filters: filters.filters,
    }),
  ]);

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<ProductFiltersType>) => {
    // Check if this is a "clear all filters" action
    const isClearAll =
      newFilters.filters && Object.keys(newFilters.filters).length === 0;

    if (isClearAll) {
      // Complete reset of filter values, but preserve pagination and sorting settings
      setFilters({
        page: 1,
        limit: filters.limit,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        filters: {}, // Clear all filter values
      });
    } else {
      // Regular filter change - merge with existing filters
      setFilters({
        ...filters,
        ...newFilters,
        filters: {
          ...filters.filters,
          ...(newFilters.filters || {}),
        },
        // Reset page to 1 when filters change (if it wasn't explicitly set)
        page: newFilters.page !== undefined ? newFilters.page : 1,
      });
    }
  };

  // Handle clicking on a brand
  const handleBrandClick = (brandId: string) => {
    handleFilterChange({
      filters: {
        ...filters.filters,
        brand: brandId,
      },
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle sort changes
  const handleSortChange = (sort: string) => {
    // Parse the sort string (e.g., "-createdAt" to { sortBy: "createdAt", sortOrder: "desc" })
    const sortBy = sort.startsWith("-") ? sort.substring(1) : sort;
    const sortOrder = sort.startsWith("-") ? "desc" : "asc";

    setFilters({
      ...filters,
      sortBy,
      sortOrder,
      page: 1,
    });
  };

  // Handle page changes
  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Toggle mobile filters
  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };

  // Get top brands with products (sorted by product count)
  const getTopBrands = (): ProductFilterBrand[] => {
    if (!availableFilters?.brands) return [];

    // Sort brands by product count (descending) and take the top ones
    return [...availableFilters.brands]
      .sort((a, b) => b.productsCount - a.productsCount)
      .slice(0, 8); // Display up to 8 top brands
  };

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm">
          <ol className="flex items-center space-x-1">
            <li>
              <a href="/" className="text-gray-500 hover:text-amber-700">
                {t("common.home")}
              </a>
            </li>
            <li className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
              <span className="text-amber-800 font-medium">
                {t("common.products")}
              </span>
            </li>
          </ol>
        </nav>

        {/* Featured Brands Section */}
        {!isLoadingFilters &&
          availableFilters?.brands &&
          availableFilters.brands.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-serif font-medium text-gray-900 mb-6">
                {t("products.shopByBrand")}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {getTopBrands().map((brand) => (
                  <div
                    key={brand._id}
                    onClick={() => handleBrandClick(brand._id)}
                    className={`
                                        flex flex-col items-center justify-center p-4 bg-white border 
                                        rounded-lg shadow-sm cursor-pointer transition-all duration-300
                                        hover:shadow-md hover:border-amber-200
                                        ${
                                          filters.filters?.brand === brand._id
                                            ? "border-amber-500 bg-amber-50"
                                            : "border-gray-200"
                                        }
                                    `}
                  >
                    {brand.logo ? (
                      <div className="w-16 h-16 mb-3 flex items-center justify-center">
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 mb-3 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                        <span className="text-xl font-medium">
                          {brand.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-800 text-center">
                      {brand.name}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      {brand.productsCount} {t("products.items")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Header */}
        <ProductsHeader
          totalProducts={totalProducts}
          onToggleFilters={toggleMobileFilters}
          onViewChange={setView}
          currentView={view}
          showMobileFilters={showMobileFilters}
        />

        {/* Mobile Filters (conditionally rendered) */}
        {showMobileFilters && (
          <div className="md:hidden mb-6">
            {isLoadingFilters ? (
              <div className="w-full bg-white p-4 rounded-lg shadow-lg flex justify-center items-center h-32">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
              </div>
            ) : (
              <ProductFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                availableFilters={availableFilters}
                isMobile={true}
              />
            )}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          {/* Desktop Filters (always visible on desktop) */}
          <div className="hidden md:block w-full md:w-64 flex-shrink-0">
            {isLoadingFilters ? (
              <div className="sticky top-24 w-full bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex justify-center items-center h-64">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
              </div>
            ) : (
              <ProductFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                availableFilters={availableFilters}
              />
            )}
          </div>

          {/* Products Section */}
          <div className="flex-1">
            <div className="mb-6 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {!isLoading && (
                  <>
                    {t("products.showing")}{" "}
                    {(currentPage - 1) * (filters.limit || 12) + 1}-
                    {Math.min(
                      currentPage * (filters.limit || 12),
                      totalProducts
                    )}{" "}
                    {t("products.of")} {totalProducts} {t("products.items")}
                  </>
                )}
              </div>
              <div className="w-48">
                <ProductSort
                  currentSort={
                    filters.sortOrder === "desc"
                      ? `-${filters.sortBy}`
                      : filters.sortBy || ""
                  }
                  onSortChange={handleSortChange}
                />
              </div>
            </div>

            {/* Product Grid or List */}
            {view === "grid" ? (
              <ProductGrid
                products={products}
                isLoading={isLoading}
                totalProducts={totalProducts}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            ) : (
              <div className="space-y-4">
                {isLoading ? (
                  <div className="min-h-[400px] flex items-center justify-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
                  </div>
                ) : products.length === 0 ? (
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
                    {products.map((product) => (
                      <ProductListItem key={product._id} product={product} />
                    ))}

                    {/* Pagination for list view */}
                    {totalPages > 1 && (
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalProducts}
                        itemsPerPage={products.length}
                        onPageChange={handlePageChange}
                      />
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
