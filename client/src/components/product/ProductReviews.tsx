import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { ProductReview } from "../../types";
import {
  Pencil,
  MessageSquare,
  AlertCircle,
  Clock,
  ArrowUpDown,
} from "lucide-react";
import { useAuthContext } from "../../context/AuthContext";
import productApi from "../../api/productApi";

// Import components from the dedicated reviews folder
import {
  StarRating,
  ReviewItem,
  ReviewForm,
  ReviewPrompt,
  RatingDistribution,
  SortOption,
} from "./reviews";

interface ProductReviewsProps {
  reviews: ProductReview[];
  productId: string;
  averageRating: number;
  reviewCount: number;
}

// Main Product Reviews Component
const ProductReviews = ({
  reviews,
  productId,
  averageRating,
  reviewCount,
}: ProductReviewsProps) => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuthContext();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [canUserReview, setCanUserReview] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.NEWEST);

  // Check if user can review this product by doing a lightweight check
  useEffect(() => {
    const checkUserCanReview = async () => {
      if (!isAuthenticated || !user) {
        setCanUserReview(false);
        return;
      }

      // Check if user has already reviewed
      const hasReviewed = reviews.some(
        (review) =>
          review.user &&
          (review.user.id === user.id || review.user._id === user._id)
      );

      if (hasReviewed) {
        setCanUserReview(false);
        return;
      }

      // Only perform this check if user is authenticated and hasn't already reviewed
      setCheckingEligibility(true);
      try {
        // Call the API to check if user can review this product
        const result = await productApi.canReviewProduct(productId);
        setCanUserReview(result.canReview);
      } catch (err) {
        console.error("Error checking review eligibility:", err);
        setCanUserReview(false);
      } finally {
        setCheckingEligibility(false);
      }
    };

    checkUserCanReview();
  }, [isAuthenticated, user, productId, reviews]);

  // Find the user's own review if it exists
  const userReview = useMemo(() => {
    if (!user || !isAuthenticated) return null;
    return reviews.find(
      (review) =>
        review.user &&
        (review.user.id === user.id || review.user._id === user._id)
    );
  }, [reviews, user, isAuthenticated]);

  // Sort reviews based on selected option
  const sortedReviews = useMemo(() => {
    const reviewsCopy = [...reviews];

    switch (sortOption) {
      case SortOption.NEWEST:
        return reviewsCopy.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case SortOption.OLDEST:
        return reviewsCopy.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case SortOption.HIGHEST_RATING:
        return reviewsCopy.sort((a, b) => b.rating - a.rating);
      case SortOption.LOWEST_RATING:
        return reviewsCopy.sort((a, b) => a.rating - b.rating);
      default:
        return reviewsCopy;
    }
  }, [reviews, sortOption]);

  // Filtered reviews without the user's review (to avoid duplication)
  const filteredReviews = useMemo(() => {
    if (!userReview) return sortedReviews;
    return sortedReviews.filter((review) => review._id !== userReview._id);
  }, [sortedReviews, userReview]);

  // Check if user can review this product
  const canReview = () => {
    return isAuthenticated && canUserReview;
  };

  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    // Refresh the page to show the new review
    window.location.reload();
  };

  return (
    <div className="product-reviews">
      {/* Section header with elegant styling */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-4 border-b border-amber-100">
        <div>
          <h2 className="text-2xl font-serif font-medium text-gray-900 mb-2">
            {t("products.reviews.title")}
          </h2>
          {reviewCount > 0 && (
            <p className="text-gray-600">
              {t("products.reviews.basedOn", { count: reviewCount })}
            </p>
          )}
        </div>
        {canReview() ? (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="mt-4 md:mt-0 bg-gradient-to-r from-amber-600 to-amber-800 text-white py-2 px-6 rounded-full hover:from-amber-700 hover:to-amber-900 transition-all duration-300 font-medium shadow-md hover:shadow-lg flex items-center"
          >
            <Pencil className="h-5 w-5 mr-2" />
            {showReviewForm
              ? t("products.reviews.cancelReview")
              : t("products.reviews.writeReview")}
          </button>
        ) : checkingEligibility ? (
          <div className="mt-4 md:mt-0 text-amber-600 flex items-center">
            <Clock className="h-5 w-5 mr-2 animate-spin" />
            <span>{t("products.reviews.checkingEligibility")}</span>
          </div>
        ) : isAuthenticated ? (
          <div className="mt-4 md:mt-0 text-amber-700 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            <span>{t("products.reviews.cannotReview")}</span>
          </div>
        ) : (
          <div className="mt-4 md:mt-0 text-amber-700 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{t("products.reviews.loginToReview")}</span>
          </div>
        )}
      </div>

      {/* Eligibility Prompt - Show prominently for eligible users */}
      {canReview() && !showReviewForm && !userReview && (
        <ReviewPrompt onClick={() => setShowReviewForm(true)} />
      )}

      {/* Review form */}
      {showReviewForm && (
        <div className="mb-12 bg-gradient-to-br from-amber-50 to-white p-6 rounded-lg shadow-md animate-fade-in">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t("products.reviews.yourReview")}
          </h3>
          <ReviewForm
            productId={productId}
            onSuccess={handleReviewSuccess}
            onCancel={() => setShowReviewForm(false)}
          />
        </div>
      )}

      {/* Reviews summary */}
      {reviewCount > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Average rating */}
          <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-amber-50 to-white rounded-lg shadow-sm">
            <div className="text-5xl font-serif font-bold text-amber-800 mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="mb-2">
              <StarRating rating={Math.round(averageRating)} />
            </div>
            <div className="text-sm text-gray-600">
              {t("products.reviews.basedOn", { count: reviewCount })}
            </div>
          </div>

          {/* Rating distribution */}
          <RatingDistribution reviews={reviews} reviewCount={reviewCount} />
        </div>
      )}

      {/* Sorting options */}
      {reviews.length > 1 && (
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-800">
            {t("products.reviews.customerReviews")}
          </h3>
          <div className="flex items-center">
            <ArrowUpDown className="h-4 w-4 mr-2 text-amber-700" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="bg-white border border-amber-200 text-amber-800 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value={SortOption.NEWEST}>
                {t("products.reviews.sortNewest")}
              </option>
              <option value={SortOption.OLDEST}>
                {t("products.reviews.sortOldest")}
              </option>
              <option value={SortOption.HIGHEST_RATING}>
                {t("products.reviews.sortHighestRated")}
              </option>
              <option value={SortOption.LOWEST_RATING}>
                {t("products.reviews.sortLowestRated")}
              </option>
            </select>
          </div>
        </div>
      )}

      {/* Reviews list */}
      <div className="space-y-8">
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-amber-50 to-white rounded-lg">
            <MessageSquare
              className="h-12 w-12 mx-auto text-amber-300 mb-4"
              strokeWidth={1}
            />
            <p className="text-gray-600 italic font-serif">
              {t("products.reviews.noReviews")}
            </p>
            <p className="mt-4 text-amber-800">
              {t("products.reviews.beFirst")}
            </p>
          </div>
        ) : (
          <>
            {/* User's own review always on top */}
            {userReview && (
              <ReviewItem
                key={userReview._id}
                review={userReview}
                isUserReview={true}
              />
            )}

            {/* Other reviews */}
            {filteredReviews.map((review) => (
              <ReviewItem key={review._id} review={review} />
            ))}
          </>
        )}
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ProductReviews;
