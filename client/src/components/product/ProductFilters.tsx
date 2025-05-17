import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  ChevronRight,
} from "lucide-react";
import type {
  ProductFilters as ProductFiltersType,
  AvailableProductFilters,
  ProductFilterCategoryHierarchical,
} from "../../types";

interface ProductFiltersProps {
  filters: ProductFiltersType;
  onFilterChange: (filters: Partial<ProductFiltersType>) => void;
  availableFilters: AvailableProductFilters | null;
  isMobile?: boolean;
}

const ProductFilters = ({
  filters,
  onFilterChange,
  availableFilters,
  isMobile = false,
}: ProductFiltersProps) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState(filters.filters?.search || "");
  const [selectedCategory, setSelectedCategory] = useState(
    filters.filters?.category || ""
  );
  const [selectedBrand, setSelectedBrand] = useState(
    filters.filters?.brand || ""
  );
  const [selectedColor, setSelectedColor] = useState(
    filters.filters?.color || ""
  );
  const [selectedSize, setSelectedSize] = useState(filters.filters?.size || "");
  const [selectedMaterial, setSelectedMaterial] = useState(
    filters.filters?.material || ""
  );
  const [priceMin, setPriceMin] = useState(
    filters.filters?.minPrice || availableFilters?.priceRange.min || 0
  );
  const [priceMax, setPriceMax] = useState(
    filters.filters?.maxPrice || availableFilters?.priceRange.max || 1000000
  );
  const [isFeatured, setIsFeatured] = useState(
    filters.filters?.isFeatured || false
  );

  // Update price range when availableFilters changes
  useEffect(() => {
    if (availableFilters?.priceRange) {
      if (!filters.filters?.minPrice) {
        setPriceMin(availableFilters.priceRange.min);
      }
      if (!filters.filters?.maxPrice) {
        setPriceMax(availableFilters.priceRange.max);
      }
    }
  }, [availableFilters, filters.filters?.minPrice, filters.filters?.maxPrice]);

  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    brands: true,
    price: true,
    colors: true,
    sizes: true,
    materials: true,
  });

  // Track expanded categories for hierarchical view
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});

  // Toggle category expansion in hierarchical view
  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Handle search input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.filters?.search) {
        handleFilterChange({
          filters: {
            ...filters.filters,
            search: searchTerm || undefined,
          },
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleFilterChange = (newFilters: Partial<ProductFiltersType>) => {
    onFilterChange(newFilters);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    handleFilterChange({
      filters: {
        ...filters.filters,
        category: categoryId || undefined,
      },
    });
  };

  const handleBrandChange = (brandId: string) => {
    setSelectedBrand(brandId);
    handleFilterChange({
      filters: {
        ...filters.filters,
        brand: brandId || undefined,
      },
    });
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    handleFilterChange({
      filters: {
        ...filters.filters,
        color: color || undefined,
      },
    });
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    handleFilterChange({
      filters: {
        ...filters.filters,
        size: size || undefined,
      },
    });
  };

  const handleMaterialChange = (material: string) => {
    setSelectedMaterial(material);
    handleFilterChange({
      filters: {
        ...filters.filters,
        material: material || undefined,
      },
    });
  };

  const handlePriceChange = () => {
    const minPriceRange = availableFilters?.priceRange.min || 0;
    const maxPriceRange = availableFilters?.priceRange.max || 1000000;

    handleFilterChange({
      filters: {
        ...filters.filters,
        minPrice: priceMin !== minPriceRange ? priceMin : undefined,
        maxPrice: priceMax !== maxPriceRange ? priceMax : undefined,
      },
    });
  };

  const handleFeaturedToggle = () => {
    const newValue = !isFeatured;
    setIsFeatured(newValue);
    handleFilterChange({
      filters: {
        ...filters.filters,
        isFeatured: newValue || undefined,
      },
    });
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedBrand("");
    setSelectedColor("");
    setSelectedSize("");
    setSelectedMaterial("");
    if (availableFilters?.priceRange) {
      setPriceMin(availableFilters.priceRange.min);
      setPriceMax(availableFilters.priceRange.max);
    }
    setIsFeatured(false);

    // Reset all filters but keep pagination and sorting
    handleFilterChange({
      filters: {},
    });
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  const hasActiveFilters = () => {
    return (
      !!filters.filters?.search ||
      !!filters.filters?.category ||
      !!filters.filters?.brand ||
      !!filters.filters?.tags ||
      !!filters.filters?.color ||
      !!filters.filters?.size ||
      !!filters.filters?.material ||
      !!filters.filters?.minPrice ||
      !!filters.filters?.maxPrice ||
      !!filters.filters?.isFeatured
    );
  };

  const filterClasses = isMobile
    ? "w-full bg-white p-4 rounded-lg shadow-lg"
    : "sticky top-24 w-full bg-white p-6 rounded-lg border border-gray-200 shadow-sm";

  // Render hierarchical categories recursively
  const renderCategoryTree = (
    categories: ProductFilterCategoryHierarchical[],
    depth: number = 0
  ) => {
    return categories.map((category) => (
      <div key={category._id} className="ml-2">
        <div className="flex items-center">
          {category.children.length > 0 && (
            <button
              onClick={() => toggleCategoryExpansion(category._id)}
              className="p-1 mr-1 text-gray-400 hover:text-gray-600"
            >
              {expandedCategories[category._id] ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
          <div
            onClick={() => handleCategoryChange(category._id)}
            className={`cursor-pointer py-1 ${
              depth > 0 ? "ml-2" : ""
            } rounded-md ${
              selectedCategory === category._id
                ? "text-amber-800 font-medium"
                : "hover:text-amber-600"
            }`}
          >
            {category.name}
          </div>
        </div>
        {expandedCategories[category._id] && category.children.length > 0 && (
          <div className="ml-4 mt-1 border-l border-gray-100 pl-2">
            {renderCategoryTree(category.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  // If no filters available yet, show a placeholder
  if (!availableFilters) {
    return (
      <div className={filterClasses}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mt-6"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={filterClasses}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <SlidersHorizontal className="w-5 h-5 mr-2" />
          {t("products.filters")}
        </h3>
        {hasActiveFilters() && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-amber-700 hover:text-amber-900 hover:underline flex items-center"
          >
            <X className="w-4 h-4 mr-1" />
            {t("products.clearAll")}
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t("products.searchPlaceholder")}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      {availableFilters.categories.flat.length > 0 && (
        <div className="mb-6 border-b border-gray-100 pb-6">
          <button
            onClick={() => toggleSection("categories")}
            className="flex items-center justify-between w-full text-left mb-3"
          >
            <h4 className="font-medium text-gray-900">
              {t("products.categories")}
            </h4>
            {expandedSections.categories ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {expandedSections.categories && (
            <div className="space-y-1">
              <div
                onClick={() => handleCategoryChange("")}
                className={`cursor-pointer px-2 py-1 rounded-md ${
                  selectedCategory === ""
                    ? "bg-amber-50 text-amber-800"
                    : "hover:bg-gray-50"
                }`}
              >
                {t("products.allCategories")}
              </div>
              {/* Hierarchical category view */}
              {renderCategoryTree(availableFilters.categories.hierarchical)}
            </div>
          )}
        </div>
      )}

      {/* Brands */}
      {availableFilters.brands.length > 0 && (
        <div className="mb-6 border-b border-gray-100 pb-6">
          <button
            onClick={() => toggleSection("brands")}
            className="flex items-center justify-between w-full text-left mb-3"
          >
            <h4 className="font-medium text-gray-900">
              {t("products.brands")}
            </h4>
            {expandedSections.brands ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {expandedSections.brands && (
            <div className="space-y-2">
              <div
                onClick={() => handleBrandChange("")}
                className={`cursor-pointer px-2 py-1 rounded-md ${
                  selectedBrand === ""
                    ? "bg-amber-50 text-amber-800"
                    : "hover:bg-gray-50"
                }`}
              >
                {t("products.allBrands")}
              </div>
              {availableFilters.brands.map((brand) => (
                <div
                  key={brand._id}
                  onClick={() => handleBrandChange(brand._id)}
                  className={`cursor-pointer px-2 py-1 rounded-md ${
                    selectedBrand === brand._id
                      ? "bg-amber-50 text-amber-800"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {brand.name}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Price Range */}
      <div className="mb-6 border-b border-gray-100 pb-6">
        <button
          onClick={() => toggleSection("price")}
          className="flex items-center justify-between w-full text-left mb-3"
        >
          <h4 className="font-medium text-gray-900">
            {t("products.priceRange")}
          </h4>
          {expandedSections.price ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {expandedSections.price && (
          <div className="space-y-4">
            <div className="flex space-x-4">
              <div className="w-1/2">
                <label className="text-xs text-gray-500 block mb-1">
                  {t("products.min")}
                </label>
                <input
                  type="number"
                  min={availableFilters.priceRange.min}
                  max={priceMax}
                  value={priceMin}
                  onChange={(e) => setPriceMin(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="w-1/2">
                <label className="text-xs text-gray-500 block mb-1">
                  {t("products.max")}
                </label>
                <input
                  type="number"
                  min={priceMin}
                  max={availableFilters.priceRange.max}
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <button
              onClick={handlePriceChange}
              className="w-full bg-amber-100 text-amber-800 hover:bg-amber-200 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {t("products.applyPrice")}
            </button>
          </div>
        )}
      </div>

      {/* Colors */}
      {availableFilters.colors.length > 0 && (
        <div className="mb-6 border-b border-gray-100 pb-6">
          <button
            onClick={() => toggleSection("colors")}
            className="flex items-center justify-between w-full text-left mb-3"
          >
            <h4 className="font-medium text-gray-900">
              {t("products.colors")}
            </h4>
            {expandedSections.colors ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {expandedSections.colors && (
            <div className="flex flex-wrap gap-2">
              {availableFilters.colors.map((color) => (
                <button
                  key={color}
                  onClick={() =>
                    handleColorChange(color === selectedColor ? "" : color)
                  }
                  className={`px-3 py-1 text-sm rounded-full border ${
                    color === selectedColor
                      ? "bg-amber-100 border-amber-300 text-amber-800"
                      : "border-gray-200 hover:border-amber-200 hover:bg-amber-50"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sizes */}
      {availableFilters.sizes.length > 0 && (
        <div className="mb-6 border-b border-gray-100 pb-6">
          <button
            onClick={() => toggleSection("sizes")}
            className="flex items-center justify-between w-full text-left mb-3"
          >
            <h4 className="font-medium text-gray-900">{t("products.sizes")}</h4>
            {expandedSections.sizes ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {expandedSections.sizes && (
            <div className="flex flex-wrap gap-2">
              {availableFilters.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() =>
                    handleSizeChange(size === selectedSize ? "" : size)
                  }
                  className={`px-3 py-1 text-sm rounded-full border ${
                    size === selectedSize
                      ? "bg-amber-100 border-amber-300 text-amber-800"
                      : "border-gray-200 hover:border-amber-200 hover:bg-amber-50"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Materials */}
      {availableFilters.materials.length > 0 && (
        <div className="mb-6 border-b border-gray-100 pb-6">
          <button
            onClick={() => toggleSection("materials")}
            className="flex items-center justify-between w-full text-left mb-3"
          >
            <h4 className="font-medium text-gray-900">
              {t("products.materials")}
            </h4>
            {expandedSections.materials ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {expandedSections.materials && (
            <div className="flex flex-wrap gap-2">
              {availableFilters.materials.map((material) => (
                <button
                  key={material}
                  onClick={() =>
                    handleMaterialChange(
                      material === selectedMaterial ? "" : material
                    )
                  }
                  className={`px-3 py-1 text-sm rounded-full border ${
                    material === selectedMaterial
                      ? "bg-amber-100 border-amber-300 text-amber-800"
                      : "border-gray-200 hover:border-amber-200 hover:bg-amber-50"
                  }`}
                >
                  {material}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Featured Products */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="featured-filter"
          checked={isFeatured}
          onChange={handleFeaturedToggle}
          className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
        />
        <label
          htmlFor="featured-filter"
          className="ml-2 text-sm text-gray-700 cursor-pointer"
        >
          {t("products.onlyFeatured")}
        </label>
      </div>
    </div>
  );
};

export default ProductFilters;
