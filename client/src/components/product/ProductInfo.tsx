import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import type { Product } from "../../types";
import { useCartContext } from "../../context/CartContext";
import { useAuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { ShoppingBag, LogIn } from "lucide-react";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import AddToWishlistButton from "../common/AddToWishlistButton";
import { calculateDiscountPercentage, formatCurrency } from "../../lib/utils";

interface ProductInfoProps {
  product: Product;
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addItem } = useCartContext();
  const { isAuthenticated } = useAuthContext();
  const [quantity, setQuantity] = useState(1);

  const price = product.price;
  const compareAtPrice = product.compareAtPrice;

  const discountPercentage = calculateDiscountPercentage(
    compareAtPrice || 0,
    price
  );

  // Get inventory quantity
  const inventoryQuantity = product.inventoryQuantity;

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
      slug: product.slug,
      name: product.name,
      price: price,
      quantity: quantity,
      image: imageUrl,
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

      {/* Price Display - Luxurious Style */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <span className="text-3xl font-serif font-semibold text-amber-800">
            {formatCurrency(price)}
          </span>
          {compareAtPrice && compareAtPrice > price && (
            <>
              <span className="text-gray-500 line-through text-lg">
                {formatCurrency(compareAtPrice)}
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
            <ShoppingBag size={18} className="mr-2" />
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
              <FaFacebook size={18} />
            </button>
            <button className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center hover:bg-sky-600 transition-colors">
              <FaTwitter size={18} />
            </button>
            <button className="w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center hover:bg-pink-700 transition-colors">
              <FaInstagram size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Add to wishlist button */}
      <AddToWishlistButton productId={product._id} className="mt-4" />

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
