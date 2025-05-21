import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Star, ShoppingCart } from "lucide-react";
import type { Product } from "../../types";
import { calculateDiscountPercentage, formatCurrency } from "../../lib/utils";

interface ProductListItemProps {
  product: Product;
}

const ProductListItem = ({ product }: ProductListItemProps) => {
  const { t } = useTranslation();

  const discountPercentage = calculateDiscountPercentage(
    product.compareAtPrice || 0,
    product.price
  );

  // Get the image URL from the product images
  const getImageUrl = () => {
    if (Array.isArray(product.images) && product.images.length > 0) {
      // Find default image if exists
      const defaultImage = product.images.find((img) => img.isDefault);
      if (defaultImage) return defaultImage.url;

      // Otherwise use first image
      return product.images[0].url;
    }
    return "https://placehold.co/300x400/png?text=No+Image";
  };

  // Get the category name
  const getCategoryName = () => {
    if (product.categoryName) {
      return product.categoryName;
    }
    if (product.category && typeof product.category === "object") {
      const category = product.category as { name?: string };
      return category.name || "";
    }
    return "";
  };

  // Generate star rating display
  const renderStars = () => {
    const rating = Math.round(product.averageRating * 2) / 2; // Round to nearest 0.5
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        // Full star
        stars.push(
          <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
        );
      } else if (i - 0.5 === rating) {
        // Half star - would require a custom SVG, using full star as placeholder
        stars.push(
          <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
        );
      } else {
        // Empty star
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }

    return stars;
  };

  return (
    <div className="group relative overflow-hidden border border-transparent hover:border-amber-100 hover:shadow-xl transition-all duration-300 ease-out bg-white rounded-lg">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-left"></div>

      <Link to={`/products/${product.slug}`} className="flex p-4">
        <div className="w-40 h-40 overflow-hidden bg-gray-50 relative flex-shrink-0">
          <img
            src={getImageUrl()}
            alt={product.name}
            className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
          />
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <div className="absolute top-2 right-2 bg-black text-amber-300 text-xs font-medium px-2 py-1 uppercase tracking-wider">
              -{discountPercentage}%
            </div>
          )}
        </div>

        <div className="ml-6 flex-1 flex flex-col">
          <div className="mb-auto">
            <div className="text-xs text-amber-700 uppercase tracking-wider mb-1 font-medium">
              {getCategoryName()}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2 transition-colors duration-300 ease-out group-hover:text-amber-800">
              {product.name}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-2 mb-3">
              {product.shortDescription || ""}
            </p>

            <div className="flex items-center mb-2">
              <div className="flex items-center mr-2">{renderStars()}</div>
              <span className="text-xs text-gray-500">
                ({product.reviewCount} {t("products.reviewCount")})
              </span>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {product.compareAtPrice &&
              product.compareAtPrice > product.price ? (
                <>
                  <span className="font-semibold text-gray-900 tracking-wide">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="text-gray-500 line-through text-sm">
                    {formatCurrency(product.compareAtPrice)}
                  </span>
                </>
              ) : (
                <span className="font-semibold text-gray-900 tracking-wide">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>

            <button className="flex items-center space-x-1 bg-amber-100 hover:bg-amber-200 text-amber-800 px-4 py-2 rounded-md transition-colors">
              <ShoppingCart className="w-4 h-4" />
              <span className="font-medium">{t("products.addToCart")}</span>
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductListItem;
