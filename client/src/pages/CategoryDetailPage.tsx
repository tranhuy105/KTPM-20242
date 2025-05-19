import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router-dom";
import { ChevronRight, Folder } from "lucide-react";
import categoryApi from "../api/categoryApi";
import productApi from "../api/productApi";
import ProductGrid from "../components/product/ProductGrid";
import ProductSort from "../components/product/ProductSort";
import type { Category, Product } from "../types";

const CategoryDetailPage = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);
  const [childCategories, setChildCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Simple filters (just sorting and pagination)
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
    filters: {
      category: slug,
    },
  });

  // Fetch category details
  useEffect(() => {
    const fetchCategory = async () => {
      if (!slug) return;

      setIsLoading(true);
      try {
        const response = await categoryApi.getCategoryBySlug(slug);
        if (response.data) {
          setCategory(response.data);

          // Update filters with the category ID
          setFilters((prev) => ({
            ...prev,
            filters: {
              ...prev.filters,
              category: response.data._id,
            },
          }));

          // If we have a category, fetch its children
          if (response.data._id) {
            fetchChildCategories(response.data._id);
          }
        }
      } catch (error) {
        console.error("Error fetching category:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategory();
  }, [slug]);

  // Fetch child categories
  const fetchChildCategories = async (parentId: string) => {
    setIsLoadingChildren(true);
    try {
      const response = await categoryApi.getCategoryChildren(parentId);
      if (response.data) {
        setChildCategories(response.data);
      }
    } catch (error) {
      console.error("Error fetching child categories:", error);
      setChildCategories([]);
    } finally {
      setIsLoadingChildren(false);
    }
  };

  // Fetch products for the category
  useEffect(() => {
    const fetchProducts = async () => {
      if (!category?._id) return;

      setIsLoadingProducts(true);
      try {
        const filter = {
          page: filters.page,
          limit: filters.limit,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
          category: category._id,
        };

        const data = await productApi.getAllProducts(filter);

        console.log(data);

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
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
        setTotalProducts(0);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [category, filters]);

  // Handle sort changes
  const handleSortChange = (sort: string) => {
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {t("categories.categoryNotFound")}
          </h1>
          <p className="text-gray-600 mb-6">
            {t("categories.categoryNotFoundDesc")}
          </p>
          <Link
            to="/"
            className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
          >
            {t("common.backToHome")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm">
          <ol className="flex items-center space-x-1">
            <li>
              <Link to="/" className="text-gray-500 hover:text-amber-700">
                {t("common.home")}
              </Link>
            </li>
            {category.parent && (
              <li className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
                <Link
                  to={`/categories/${category.parent.slug}`}
                  className="text-gray-500 hover:text-amber-700"
                >
                  {category.parent.name}
                </Link>
              </li>
            )}
            <li className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
              <span className="text-amber-800 font-medium">
                {category.name}
              </span>
            </li>
          </ol>
        </nav>

        {/* Category Header with Image */}
        <div className="mb-8 bg-white rounded-lg overflow-hidden shadow-sm">
          {category.image ? (
            <div className="h-[75vh] overflow-hidden">
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover object-center"
              />
            </div>
          ) : (
            <div className="h-64 bg-amber-50 flex items-center justify-center text-amber-700">
              <Folder className="h-10 w-10" />
            </div>
          )}
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-gray-600 mb-4">{category.description}</p>
            )}
            <div className="flex items-center text-sm text-gray-500">
              <span>
                {totalProducts} {t("products.items")}
              </span>
            </div>
          </div>
        </div>

        {/* Child Categories Section (if any) */}
        {isLoadingChildren ? (
          <div className="mb-8 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          </div>
        ) : childCategories.length > 0 ? (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t("categories.subcategories")}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {childCategories.map((childCategory) => (
                <Link
                  key={childCategory._id}
                  to={`/categories/${childCategory.slug}`}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  {childCategory.image ? (
                    <div className="h-32 overflow-hidden">
                      <img
                        src={childCategory.image}
                        alt={childCategory.name}
                        className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-32 bg-amber-50 flex items-center justify-center text-amber-700">
                      <Folder className="h-10 w-10" />
                    </div>
                  )}
                  <div className="p-3 text-center">
                    <h3 className="font-medium text-gray-900">
                      {childCategory.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {/* Products Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {t("products.inThisCategory")}
            </h2>
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

          {/* Product Grid */}
          <ProductGrid
            products={products}
            isLoading={isLoadingProducts}
            totalProducts={totalProducts}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailPage;
