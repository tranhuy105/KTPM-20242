import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import type { Product, ProductVariant } from "../../types";
import { useCartContext } from "../../context/CartContext";
import { useAuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { ShoppingBag, LogIn } from "lucide-react";

interface ProductInfoProps {
  product: Product;
  selectedVariant: ProductVariant | null;
}

const ProductInfo = ({ product, selectedVariant }: ProductInfoProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addItem } = useCartContext();
  const { isAuthenticated } = useAuthContext();
  const [quantity, setQuantity] = useState(1);

  // Format price in VND with thousands separator
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Get the current price (either from selected variant or base product)
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentComparePrice = selectedVariant
    ? selectedVariant.compareAtPrice
    : product.compareAtPrice;

  // Calculate discount percentage if compareAtPrice exists
  const discountPercentage = currentComparePrice
    ? Math.round(
        ((currentComparePrice - currentPrice) / currentComparePrice) * 100
      )
    : 0;

  // Get inventory quantity (either from selected variant or base product)
  const inventoryQuantity = selectedVariant
    ? selectedVariant.inventoryQuantity
    : product.inventoryQuantity;

  // Determine stock status
  const isInStock = inventoryQuantity > 0;
  const isLowStock = isInStock && inventoryQuantity <= 5;

  // Handle quantity change
  const handleQuantityChange = (newQuantity: number) => {
    // Ensure quantity is between 1 and available inventory (if tracking)
    if (newQuantity < 1) newQuantity = 1;
    if (
      product.inventoryTracking &&
      isInStock &&
      newQuantity > inventoryQuantity
    ) {
      newQuantity = inventoryQuantity;
    }
    setQuantity(newQuantity);
  };

  // Handle add to cart
  const handleAddToCart = () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast(
        <div className="flex items-center gap-2">
          <LogIn size={18} />
          <span>Please log in to add items to your cart</span>
        </div>,
        {
          icon: "🔒",
        }
      );
      navigate("/auth");
      return;
    }

    // Get the first image URL
    const imageUrl =
      product.images && product.images.length > 0
        ? typeof product.images[0] === "string"
          ? product.images[0]
          : product.images[0].url
        : "";

    // Add item to cart
    addItem({
      productId: product._id,
      name: product.name,
      price: currentPrice,
      quantity: quantity,
      image: imageUrl,
      variantId: selectedVariant?._id,
      variantName: selectedVariant?.name,
    });

    // Show toast notification
    toast.success(
      <div className="flex items-center gap-2">
        <ShoppingBag size={18} />
        <span>{t("products.addedToCart")}</span>
      </div>
    );
  };

  return (
    <div className="product-info relative">
      {/* Brand and Category Badge */}
      <div className="flex items-center space-x-2 mb-4">
        {product.brandName && (
          <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider">
            {product.brandName}
          </span>
        )}
        {typeof product.category === "object" && (
          <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider">
            {product.category.name}
          </span>
        )}
      </div>

      {/* Product Name with elegant styling */}
      <h1 className="text-3xl md:text-4xl font-serif font-medium text-gray-900 mb-4 leading-tight">
        {product.name}
      </h1>

      {/* Selected Variant Name (if applicable) */}
      {selectedVariant && (
        <div className="mb-6 text-gray-700 italic border-l-4 border-amber-200 pl-3 py-1">
          {selectedVariant.name}
        </div>
      )}

      {/* Price Display - Luxurious Style */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <span className="text-3xl font-serif font-semibold text-amber-800">
            {formatPrice(currentPrice)}
          </span>
          {currentComparePrice && currentComparePrice > currentPrice && (
            <>
              <span className="text-gray-500 line-through text-lg">
                {formatPrice(currentComparePrice)}
              </span>
              <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold">
                -{discountPercentage}%
              </span>
            </>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent my-6"></div>

      {/* Short Description - Elegant Style */}
      <div className="mb-8 leading-relaxed text-gray-700 font-light text-lg">
        {product.shortDescription}
      </div>

      {/* Stock Status - Elegant Display */}
      <div className="mb-8">
        <h3 className="text-sm uppercase tracking-wider text-gray-700 mb-3 font-medium">
          {t("products.status")}
        </h3>
        {isInStock ? (
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
            {isLowStock ? (
              <span className="text-sm text-amber-700 font-medium">
                {t("products.lowStock", { count: inventoryQuantity })}
              </span>
            ) : (
              <span className="text-sm text-green-700 font-medium">
                {t("products.inStock")}
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
            <span className="text-sm text-red-700 font-medium">
              {t("products.outOfStock")}
            </span>
          </div>
        )}
      </div>

      {/* Tags - Luxurious Tag Style */}
      {product.tags && product.tags.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm uppercase tracking-wider text-gray-700 mb-3 font-medium">
            {t("products.features")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="inline-block bg-gradient-to-r from-amber-50 to-amber-100 px-4 py-2 text-sm text-amber-800 rounded-full shadow-sm border border-amber-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quantity Selector and Add to Cart - Luxurious Design */}
      <div className="mb-10">
        <h3 className="text-sm uppercase tracking-wider text-gray-700 mb-3 font-medium">
          {t("products.quantity")}
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="quantity-selector flex border border-gray-300 rounded-full overflow-hidden shadow-sm bg-white">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              className="w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:ring-inset transition-colors"
              disabled={quantity <= 1}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <input
              type="number"
              min="1"
              max={isInStock ? inventoryQuantity : 1}
              value={quantity}
              onChange={(e) =>
                handleQuantityChange(parseInt(e.target.value, 10) || 1)
              }
              className="w-16 h-12 text-center border-x border-gray-300 focus:outline-none"
            />
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              className="w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:ring-inset transition-colors"
              disabled={isInStock ? quantity >= inventoryQuantity : true}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!isInStock}
            className={`flex-1 py-4 px-8 rounded-full font-medium text-base uppercase tracking-wider transition-all duration-300 flex items-center justify-center ${
              isInStock
                ? "bg-gradient-to-r from-amber-600 to-amber-800 text-white hover:from-amber-700 hover:to-amber-900 shadow-md hover:shadow-lg"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            {isInStock ? t("products.addToCart") : t("products.outOfStock")}
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent my-6"></div>

      {/* Product Metadata - Elegant Table */}
      <div className="pt-4">
        <h3 className="text-sm uppercase tracking-wider text-gray-700 mb-4 font-medium">
          {t("products.details")}
        </h3>
        <div className="grid grid-cols-1 gap-3 text-sm">
          {product.brandName && (
            <div className="flex py-2 border-b border-gray-100">
              <span className="text-gray-600 w-32 font-medium">
                {t("products.brand")}
              </span>
              <span className="text-gray-800">{product.brandName}</span>
            </div>
          )}
          {selectedVariant && selectedVariant.sku && (
            <div className="flex py-2 border-b border-gray-100">
              <span className="text-gray-600 w-32 font-medium">
                {t("products.sku")}
              </span>
              <span className="text-gray-800">{selectedVariant.sku}</span>
            </div>
          )}
          {typeof product.category === "object" && (
            <div className="flex py-2 border-b border-gray-100">
              <span className="text-gray-600 w-32 font-medium">
                {t("categories.all")}
              </span>
              <span className="text-gray-800">{product.category.name}</span>
            </div>
          )}

          {/* Release date if available */}
          {product.releaseDate && (
            <div className="flex py-2 border-b border-gray-100">
              <span className="text-gray-600 w-32 font-medium">
                {t("products.releaseDate")}
              </span>
              <span className="text-gray-800">
                {new Date(product.releaseDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Social sharing */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 font-medium">Share:</span>
          <div className="flex space-x-2">
            <button className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z" />
              </svg>
            </button>
            <button className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center hover:bg-sky-600 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z" />
              </svg>
            </button>
            <button className="w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center hover:bg-pink-700 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Add to wishlist button */}
      <button className="mt-6 flex items-center text-gray-600 hover:text-amber-700 transition-colors">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <span className="text-sm font-medium">
          {t("products.addToWishlist")}
        </span>
      </button>

      {/* CSS for animations */}
      <style>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translate3d(0, -20px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProductInfo;
