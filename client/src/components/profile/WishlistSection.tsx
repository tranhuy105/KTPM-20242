import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { productApi } from "../../api";
import { Loader2, ShoppingBag, Heart } from "lucide-react";
import type { Product } from "../../types";
import { Link } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { formatCurrencyVND } from "../../lib/utils";
import toast from "react-hot-toast";

interface WishlistProduct extends Product {
  addedToWishlistAt?: string;
}

const WishlistSection = () => {
  const { t } = useTranslation();
  const { user } = useAuthContext();
  const [wishlistProducts, setWishlistProducts] = useState<WishlistProduct[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWishlistProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const products =
        (await productApi.getWishlistProducts()) as WishlistProduct[];
      setWishlistProducts(products);
    } catch (err) {
      console.error("Failed to fetch wishlist products:", err);
      setError(t("products.fetchError") || "Failed to load wishlist products");
      toast.error(
        t("products.fetchError") || "Failed to load wishlist products"
      );
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchWishlistProducts();
  }, [fetchWishlistProducts]);

  useEffect(() => {
    if (user?.wishlist) {
      fetchWishlistProducts();
    }
  }, [user?.wishlist, fetchWishlistProducts]);

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await productApi.toggleProductInWishlist(productId);
      setWishlistProducts((prev) =>
        prev.filter((product) => product._id !== productId)
      );
      toast.success(t("wishlist.removed") || "Product removed from wishlist");
    } catch (error) {
      console.error("Failed to remove product from wishlist:", error);
      fetchWishlistProducts();
    }
  };

  if (isLoading && wishlistProducts.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

  if (wishlistProducts.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
        <Heart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-medium text-gray-700 mb-2">
          {t("wishlist.empty")}
        </h3>
        <p className="text-gray-500 max-w-md mx-auto mb-6">
          {t("wishlist.emptyDescription") ||
            "Items you add to your wishlist will appear here."}
        </p>
        <Link
          to="/products"
          className="inline-flex items-center px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-md transition-colors"
        >
          <ShoppingBag className="h-5 w-5 mr-2" />
          {t("common.viewAll") || "View All Products"}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          {t("wishlist.title") || "My Wishlist"}
          <span className="ml-2 text-sm text-gray-500 font-normal">
            ({wishlistProducts.length}{" "}
            {wishlistProducts.length === 1 ? "item" : "items"})
          </span>
        </h2>
        <Link
          to="/products"
          className="text-amber-600 hover:text-amber-800 font-medium text-sm flex items-center"
        >
          <ShoppingBag className="h-4 w-4 mr-1" />
          {t("common.viewAll") || "View All Products"}
        </Link>
      </div>

      {isLoading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative">
        {wishlistProducts.map((product) => (
          <div
            key={product._id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative">
              <Link to={`/products/${product.slug}`}>
                <img
                  src={
                    product.images?.[0]?.url ||
                    "https://placehold.co/300x300/png?text=No+Image"
                  }
                  alt={product.name}
                  className="w-full h-64 object-cover object-center"
                />
              </Link>
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => handleRemoveFromWishlist(product._id)}
                  className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 text-red-500"
                  aria-label="Remove from wishlist"
                >
                  <Heart className="h-5 w-5 fill-current" />
                </button>
              </div>
            </div>

            <div className="p-4">
              <Link to={`/products/${product.slug}`} className="block">
                <h3 className="text-lg font-medium text-gray-900 mb-1 hover:text-amber-700 transition-colors">
                  {product.name}
                </h3>

                <div className="text-xs text-amber-700 uppercase tracking-wider mb-2 font-medium">
                  {typeof product.category === "object" &&
                  product.category?.name
                    ? product.category.name
                    : ""}
                </div>
              </Link>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-2">
                  {product.compareAtPrice &&
                  product.compareAtPrice > product.price ? (
                    <>
                      <span className="font-semibold text-gray-900">
                        {formatCurrencyVND(product.price)}
                      </span>
                      <span className="text-gray-500 line-through text-sm">
                        {formatCurrencyVND(product.compareAtPrice)}
                      </span>
                    </>
                  ) : (
                    <span className="font-semibold text-gray-900">
                      {formatCurrencyVND(product.price)}
                    </span>
                  )}
                </div>

                <div className="text-xs text-gray-500">
                  {product.addedToWishlistAt && (
                    <>
                      Added:{" "}
                      {new Date(product.addedToWishlistAt).toLocaleDateString()}
                    </>
                  )}
                </div>
              </div>

              <Link
                to={`/products/${product.slug}`}
                className="mt-4 block w-full text-center bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-md transition-colors"
              >
                {t("common.viewDetails") || "View Details"}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistSection;
