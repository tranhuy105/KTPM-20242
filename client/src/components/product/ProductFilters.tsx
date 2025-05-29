import {
    ChevronDown,
    ChevronRight,
    ChevronUp,
    Search,
    SlidersHorizontal,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    formatCurrency,
    getUserCurrency,
} from "../../lib/utils";
import type {
    AvailableProductFilters,
    ProductFilterCategoryHierarchical,
    ProductFilters as ProductFiltersType,
} from "../../types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";

interface ProductFiltersProps {
    filters: ProductFiltersType;
    onFilterChange: (
        filters: Partial<ProductFiltersType>
    ) => void;
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
    const [searchTerm, setSearchTerm] = useState(
        filters.filters?.search || ""
    );
    const [selectedCategory, setSelectedCategory] =
        useState(filters.filters?.category || "");
    const [selectedBrand, setSelectedBrand] = useState(
        filters.filters?.brand || ""
    );
    const [selectedColor, setSelectedColor] = useState(
        filters.filters?.color || ""
    );
    const [selectedSize, setSelectedSize] = useState(
        filters.filters?.size || ""
    );
    const [selectedMaterial, setSelectedMaterial] =
        useState(filters.filters?.material || "");

    // Get user's currency preference
    const userCurrency = getUserCurrency();

    // Convert VND price to display currency for input fields
    const convertVNDToDisplayCurrency = (
        vndPrice: number
    ): number => {
        if (userCurrency === "USD") {
            // Assuming you have a conversion function, or use the same logic as formatCurrency
            // This should match the conversion logic in your formatCurrency function
            return Math.round(vndPrice / 25000); // Replace with actual exchange rate logic
        }
        return vndPrice;
    };

    // Convert display currency back to VND for database
    const convertDisplayCurrencyToVND = (
        displayPrice: number
    ): number => {
        if (userCurrency === "USD") {
            return Math.round(displayPrice * 25000); // Replace with actual exchange rate logic
        }
        return displayPrice;
    };

    // Initialize price states with converted values for display
    const [priceMin, setPriceMin] = useState(() => {
        const minPrice =
            filters.filters?.minPrice ||
            availableFilters?.priceRange.min ||
            0;
        return convertVNDToDisplayCurrency(minPrice);
    });

    const [priceMax, setPriceMax] = useState(() => {
        const maxPrice =
            filters.filters?.maxPrice ||
            availableFilters?.priceRange.max ||
            1000000;
        return convertVNDToDisplayCurrency(maxPrice);
    });

    const [isFeatured, setIsFeatured] = useState(
        filters.filters?.isFeatured || false
    );

    // Update price range when availableFilters changes
    useEffect(() => {
        if (availableFilters?.priceRange) {
            // Only set initial values when filters don't have values yet
            if (filters.filters?.minPrice === undefined) {
                setPriceMin(
                    convertVNDToDisplayCurrency(
                        availableFilters.priceRange.min
                    )
                );
            } else {
                setPriceMin(
                    convertVNDToDisplayCurrency(
                        filters.filters.minPrice
                    )
                );
            }

            if (filters.filters?.maxPrice === undefined) {
                setPriceMax(
                    convertVNDToDisplayCurrency(
                        availableFilters.priceRange.max
                    )
                );
            } else {
                setPriceMax(
                    convertVNDToDisplayCurrency(
                        filters.filters.maxPrice
                    )
                );
            }
        }
    }, [
        availableFilters,
        filters.filters?.minPrice,
        filters.filters?.maxPrice,
        userCurrency,
    ]);

    const [expandedSections, setExpandedSections] =
        useState({
            categories: true,
            brands: false,
            price: false,
            colors: false,
            sizes: false,
            materials: false,
        });

    // Track expanded categories for hierarchical view
    const [expandedCategories, setExpandedCategories] =
        useState<Record<string, boolean>>({});

    // Toggle category expansion in hierarchical view
    const toggleCategoryExpansion = (
        categoryId: string
    ) => {
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

    // Update local state when filters change (e.g., from URL or header search)
    useEffect(() => {
        if (
            filters.filters?.search !== undefined &&
            filters.filters.search !== searchTerm
        ) {
            setSearchTerm(filters.filters.search);
        }
    }, [filters.filters?.search]);

    const handleFilterChange = (
        newFilters: Partial<ProductFiltersType>
    ) => {
        onFilterChange(newFilters);
        // Scroll to top when applying filters
        // skip the brand section
        window.scrollTo({ top: 0, behavior: "smooth" });
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
        if (!availableFilters?.priceRange) return;

        const minPriceRangeDisplay =
            convertVNDToDisplayCurrency(
                availableFilters.priceRange.min
            );
        const maxPriceRangeDisplay =
            convertVNDToDisplayCurrency(
                availableFilters.priceRange.max
            );

        // Convert display prices back to VND before sending to server
        const minPriceVND =
            convertDisplayCurrencyToVND(priceMin);
        const maxPriceVND =
            convertDisplayCurrencyToVND(priceMax);

        // Only send VND values to the server
        handleFilterChange({
            filters: {
                ...filters.filters,
                minPrice:
                    priceMin !== minPriceRangeDisplay
                        ? minPriceVND
                        : undefined,
                maxPrice:
                    priceMax !== maxPriceRangeDisplay
                        ? maxPriceVND
                        : undefined,
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
            setPriceMin(
                convertVNDToDisplayCurrency(
                    availableFilters.priceRange.min
                )
            );
            setPriceMax(
                convertVNDToDisplayCurrency(
                    availableFilters.priceRange.max
                )
            );
        }
        setIsFeatured(false);

        // Reset all filters but keep pagination and sorting
        handleFilterChange({
            filters: {},
        });
    };

    const toggleSection = (
        section: keyof typeof expandedSections
    ) => {
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
        : "sticky top-24 w-full bg-white p-6 rounded-lg border border-gray-200 shadow-sm max-h-[calc(100vh-120px)] overflow-y-auto";

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
                            onClick={() =>
                                toggleCategoryExpansion(
                                    category._id
                                )
                            }
                            className="p-1 mr-1 text-gray-400 hover:text-gray-600"
                        >
                            {expandedCategories[
                                category._id
                            ] ? (
                                <ChevronDown className="w-4 h-4" />
                            ) : (
                                <ChevronRight className="w-4 h-4" />
                            )}
                        </button>
                    )}
                    <div
                        onClick={() =>
                            handleCategoryChange(
                                category._id
                            )
                        }
                        className={`cursor-pointer py-1 ${
                            depth > 0 ? "ml-2" : ""
                        } rounded-md ${
                            selectedCategory ===
                            category._id
                                ? "text-amber-800 font-medium"
                                : "hover:text-amber-600"
                        }`}
                    >
                        {category.name}
                    </div>
                </div>
                {expandedCategories[category._id] &&
                    category.children.length > 0 && (
                        <div className="ml-4 mt-1 border-l border-gray-100 pl-2">
                            {renderCategoryTree(
                                category.children,
                                depth + 1
                            )}
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
                    <Button
                        onClick={clearAllFilters}
                        variant="ghost"
                        size="sm"
                        className="text-amber-700 hover:text-amber-900 hover:bg-amber-50"
                    >
                        <X className="w-4 h-4 mr-1" />
                        {t("products.clearAll")}
                    </Button>
                )}
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative">
                    <Input
                        type="text"
                        value={searchTerm}
                        onChange={(e) =>
                            setSearchTerm(e.target.value)
                        }
                        placeholder={t(
                            "products.searchPlaceholder"
                        )}
                        className="pl-10 pr-8"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    {searchTerm && (
                        <button
                            onClick={() =>
                                setSearchTerm("")
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Categories */}
            {availableFilters.categories.flat.length >
                0 && (
                <div className="mb-6 border-b border-gray-100 pb-6">
                    <button
                        onClick={() =>
                            toggleSection("categories")
                        }
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
                                onClick={() =>
                                    handleCategoryChange("")
                                }
                                className={`cursor-pointer px-2 py-1 rounded-md ${
                                    selectedCategory === ""
                                        ? "bg-amber-50 text-amber-800"
                                        : "hover:bg-gray-50"
                                }`}
                            >
                                {t(
                                    "products.allCategories"
                                )}
                            </div>
                            {/* Hierarchical category view */}
                            {renderCategoryTree(
                                availableFilters.categories
                                    .hierarchical
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Brands */}
            {availableFilters.brands.length > 0 && (
                <div className="mb-6 border-b border-gray-100 pb-6">
                    <button
                        onClick={() =>
                            toggleSection("brands")
                        }
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
                                onClick={() =>
                                    handleBrandChange("")
                                }
                                className={`cursor-pointer px-2 py-1 rounded-md ${
                                    selectedBrand === ""
                                        ? "bg-amber-50 text-amber-800"
                                        : "hover:bg-gray-50"
                                }`}
                            >
                                {t("products.allBrands")}
                            </div>
                            {availableFilters.brands.map(
                                (brand) => (
                                    <div
                                        key={brand._id}
                                        onClick={() =>
                                            handleBrandChange(
                                                brand._id
                                            )
                                        }
                                        className={`cursor-pointer px-2 py-1 rounded-md ${
                                            selectedBrand ===
                                            brand._id
                                                ? "bg-amber-50 text-amber-800"
                                                : "hover:bg-gray-50"
                                        }`}
                                    >
                                        {brand.name}
                                    </div>
                                )
                            )}
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
                    <div className="space-y-6">
                        <div className="px-2">
                            <div className="flex justify-between mb-2 text-sm text-gray-500">
                                <span>
                                    {formatCurrency(
                                        convertDisplayCurrencyToVND(
                                            priceMin
                                        )
                                    )}
                                </span>
                                <span>
                                    {formatCurrency(
                                        convertDisplayCurrencyToVND(
                                            priceMax
                                        )
                                    )}
                                </span>
                            </div>

                            <div className="flex space-x-4 mt-4">
                                <div className="w-1/2">
                                    <label className="text-xs text-gray-500 block mb-1">
                                        {t(
                                            "products.minPrice"
                                        )}
                                    </label>
                                    <Input
                                        type="number"
                                        min={convertVNDToDisplayCurrency(
                                            availableFilters
                                                .priceRange
                                                .min
                                        )}
                                        max={priceMax}
                                        value={priceMin}
                                        onChange={(e) =>
                                            setPriceMin(
                                                Number(
                                                    e.target
                                                        .value
                                                )
                                            )
                                        }
                                        className="w-full"
                                        placeholder={
                                            userCurrency ===
                                            "USD"
                                                ? "$"
                                                : "₫"
                                        }
                                    />
                                </div>
                                <div className="w-1/2">
                                    <label className="text-xs text-gray-500 block mb-1">
                                        {t(
                                            "products.maxPrice"
                                        )}
                                    </label>
                                    <Input
                                        type="number"
                                        min={priceMin}
                                        max={convertVNDToDisplayCurrency(
                                            availableFilters
                                                .priceRange
                                                .max
                                        )}
                                        value={priceMax}
                                        onChange={(e) =>
                                            setPriceMax(
                                                Number(
                                                    e.target
                                                        .value
                                                )
                                            )
                                        }
                                        className="w-full"
                                        placeholder={
                                            userCurrency ===
                                            "USD"
                                                ? "$"
                                                : "₫"
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handlePriceChange}
                            variant="outline"
                            className="w-full bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200"
                        >
                            {t("products.applyPriceFilter")}
                        </Button>
                    </div>
                )}
            </div>

            {/* Colors */}
            {availableFilters.colors.length > 0 && (
                <div className="mb-6 border-b border-gray-100 pb-6">
                    <button
                        onClick={() =>
                            toggleSection("colors")
                        }
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
                            {availableFilters.colors.map(
                                (color) => (
                                    <Badge
                                        key={color}
                                        onClick={() =>
                                            handleColorChange(
                                                color ===
                                                    selectedColor
                                                    ? ""
                                                    : color
                                            )
                                        }
                                        variant={
                                            color ===
                                            selectedColor
                                                ? "default"
                                                : "outline"
                                        }
                                        className={`cursor-pointer px-3 py-1 ${
                                            color ===
                                            selectedColor
                                                ? "bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300"
                                                : "hover:border-amber-200 hover:bg-amber-50"
                                        }`}
                                    >
                                        {color}
                                    </Badge>
                                )
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Sizes */}
            {availableFilters.sizes.length > 0 && (
                <div className="mb-6 border-b border-gray-100 pb-6">
                    <button
                        onClick={() =>
                            toggleSection("sizes")
                        }
                        className="flex items-center justify-between w-full text-left mb-3"
                    >
                        <h4 className="font-medium text-gray-900">
                            {t("products.sizes")}
                        </h4>
                        {expandedSections.sizes ? (
                            <ChevronUp className="w-4 h-4 text-gray-500" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                        )}
                    </button>

                    {expandedSections.sizes && (
                        <div className="flex flex-wrap gap-2">
                            {availableFilters.sizes.map(
                                (size) => (
                                    <Badge
                                        key={size}
                                        onClick={() =>
                                            handleSizeChange(
                                                size ===
                                                    selectedSize
                                                    ? ""
                                                    : size
                                            )
                                        }
                                        variant={
                                            size ===
                                            selectedSize
                                                ? "default"
                                                : "outline"
                                        }
                                        className={`cursor-pointer px-3 py-1 ${
                                            size ===
                                            selectedSize
                                                ? "bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300"
                                                : "hover:border-amber-200 hover:bg-amber-50"
                                        }`}
                                    >
                                        {size}
                                    </Badge>
                                )
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Materials */}
            {availableFilters.materials.length > 0 && (
                <div className="mb-6 border-b border-gray-100 pb-6">
                    <button
                        onClick={() =>
                            toggleSection("materials")
                        }
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
                            {availableFilters.materials.map(
                                (material) => (
                                    <Badge
                                        key={material}
                                        onClick={() =>
                                            handleMaterialChange(
                                                material ===
                                                    selectedMaterial
                                                    ? ""
                                                    : material
                                            )
                                        }
                                        variant={
                                            material ===
                                            selectedMaterial
                                                ? "default"
                                                : "outline"
                                        }
                                        className={`cursor-pointer px-3 py-1 ${
                                            material ===
                                            selectedMaterial
                                                ? "bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300"
                                                : "hover:border-amber-200 hover:bg-amber-50"
                                        }`}
                                    >
                                        {material}
                                    </Badge>
                                )
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Featured Products */}
            <div className="flex items-center">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="featured-filter"
                        checked={isFeatured}
                        onCheckedChange={
                            handleFeaturedToggle
                        }
                        className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                    />
                    <label
                        htmlFor="featured-filter"
                        className="text-sm text-gray-700 cursor-pointer"
                    >
                        {t("products.onlyFeatured")}
                    </label>
                </div>
            </div>
        </div>
    );
};

export default ProductFilters;
