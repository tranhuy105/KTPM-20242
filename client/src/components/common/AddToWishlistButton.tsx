import { Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { productApi } from "../../api";
import { useAuthContext } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface AddToWishlistButtonProps {
  productId: string;
  className?: string;
  showText?: boolean;
}

const AddToWishlistButton = ({
  productId,
  className = "",
  showText = true,
}: AddToWishlistButtonProps) => {
  const { t } = useTranslation();
  const { user, isAuthenticated, updateUserData } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const navigate = useNavigate();

  // Initialize wishlist state on component mount and when user data changes
  useEffect(() => {
    if (user?.wishlist) {
      setIsInWishlist(
        user.wishlist.some(
          (item) =>
            item._id === productId ||
            (item.product && item.product === productId)
        )
      );
    }
  }, [user, productId]);

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      toast.error(t("auth.loginRequired"));
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    setIsLoading(true);
    try {
      const response = await productApi.toggleProductInWishlist(productId);

      // Immediately toggle the local state for immediate UI feedback
      setIsInWishlist(!isInWishlist);

      // Make sure we're accessing the wishlist from the data property
      if (response && response.wishlist) {
        // Update user context with new wishlist
        updateUserData({ wishlist: response.wishlist });

        // Show success message
        toast.success(
          response.message ||
            (!isInWishlist
              ? t("products.addedToWishlist")
              : t("products.removedFromWishlist"))
        );
      }
    } catch (error) {
      console.error(error);
      toast.error(t("products.wishlistError"));
      // Revert the local state in case of error
      setIsInWishlist(isInWishlist);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className={`flex items-center text-gray-600 hover:text-amber-700 transition-colors ${className}`}
      onClick={handleAddToWishlist}
      disabled={isLoading}
      aria-label={
        isInWishlist
          ? t("products.removeFromWishlist")
          : t("products.addToWishlist")
      }
    >
      <Heart
        size={18}
        className={`mr-2 ${isLoading ? "animate-pulse" : ""} ${
          isInWishlist ? "fill-red-500 text-red-500" : "text-gray-600"
        }`}
      />
      {showText && (
        <span className="text-sm font-medium">
          {isInWishlist
            ? t("products.removeFromWishlist")
            : t("products.addToWishlist")}
        </span>
      )}
    </button>
  );
};

export default AddToWishlistButton;
