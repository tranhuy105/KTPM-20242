import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Product } from "../../types";

interface ProductCardProps {
  product: Product;
}

interface ImageObject {
  url: string;
  alt?: string;
  isDefault?: boolean;
  _id?: string;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { t } = useTranslation();

  // Calculate discount percentage if compareAtPrice exists
  const discountPercentage = product.compareAtPrice
    ? Math.round(
        ((product.compareAtPrice - product.price) / product.compareAtPrice) *
          100
      )
    : 0;

  // Format price in VND with thousands separator
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Get the image URL, handling both old and new API response format
  const getImageUrl = () => {
    if (Array.isArray(product.images)) {
      // Find default image or use first image
      if (typeof product.images[0] === "string") {
        return product.images[0];
      } else if (product.images[0] && typeof product.images[0] === "object") {
        // Find default image if exists
        const defaultImage = (product.images as unknown as ImageObject[]).find(
          (img) => img.isDefault
        );
        if (defaultImage) return defaultImage.url;

        // Otherwise use first image
        const image = product.images[0] as unknown as ImageObject;
        return image.url;
      }
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

  return (
    <div className="group relative overflow-hidden border border-transparent hover:border-amber-100 hover:shadow-xl transition-all duration-300 ease-out bg-white">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-left"></div>

      <Link to={`/products/${product.slug}`} className="block p-2">
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-50 mb-4 relative">
          <img
            src={getImageUrl()}
            alt={product.name}
            className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
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
                  {formatPrice(product.price)}
                </span>
                <span className="text-gray-500 line-through text-sm">
                  {formatPrice(product.compareAtPrice)}
                </span>
              </>
            ) : (
              <span className="font-semibold text-gray-900 tracking-wide">
                {formatPrice(product.price)}
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
