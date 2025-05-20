import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Product } from "../../types";
import {
  calculateDiscountPercentage,
  formatCurrencyVND,
} from "../../lib/utils";
import { Heart } from "lucide-react";
import { useAuthContext } from "../../context/AuthContext";
interface ProductCardProps {
  product: Product;
  isMasonry?: boolean;
}

const ProductCard = ({ product, isMasonry = true }: ProductCardProps) => {
  const { t } = useTranslation();
  const { user } = useAuthContext();

  const discountPercentage = calculateDiscountPercentage(
    product.compareAtPrice || 0,
    product.price
  );

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

  const isInWishlist = user?.wishlist?.some(
    (wishlistItem) => wishlistItem.product === product._id
  );

  return (
    <div className="group relative overflow-hidden border border-transparent hover:border-amber-100 hover:shadow-xl transition-all duration-300 ease-out bg-white">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-left"></div>

      <Link to={`/products/${product.slug}`} className="block p-2">
        <div className="w-full overflow-hidden bg-gray-50 mb-4 relative">
          {isInWishlist && (
            <div className="absolute z-10 top-3 left-3">
              <Heart className="h-4 w-4 md:h-6 md:w-6 fill-red-500" />
            </div>
          )}
          <img
            src={getImageUrl()}
            alt={product.name}
            className={`w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105 ${
              !isMasonry ? "h-[300px]" : ""
            }`}
          />
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <div className="absolute top-3 right-3 bg-black text-amber-300 text-xs font-medium px-3 py-1.5 uppercase tracking-wider">
              -{discountPercentage}%
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></div>
        </div>

        <div className="transform transition-all duration-300 ease-out group-hover:-translate-y-2 px-2">
          <div className="text-xs text-amber-700 uppercase tracking-wider mb-2 font-medium">
            {getCategoryName()}
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-2 transition-colors duration-300 ease-out group-hover:text-amber-800">
            {product.name}
          </h3>

          <div className="flex items-center space-x-2 mb-3">
            {product.compareAtPrice &&
            product.compareAtPrice > product.price ? (
              <>
                <span className="font-semibold text-gray-900 tracking-wide">
                  {formatCurrencyVND(product.price)}
                </span>
                <span className="text-gray-500 line-through text-sm">
                  {formatCurrencyVND(product.compareAtPrice)}
                </span>
              </>
            ) : (
              <span className="font-semibold text-gray-900 tracking-wide">
                {formatCurrencyVND(product.price)}
              </span>
            )}
          </div>

          <div className="mt-3 mb-2 relative overflow-hidden">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-200 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"></div>
            <span className="inline-block bg-amber-800 text-amber-100 text-xs px-5 py-2 uppercase tracking-widest font-medium transform transition-all duration-300 ease-out translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 mt-3 hover:bg-amber-900">
              {t("common.viewDetails")}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
