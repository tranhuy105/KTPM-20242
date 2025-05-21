import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { ProductReview } from "../../types";
import {
  Star,
  ThumbsUp,
  MessageCircle,
  Pencil,
  Check,
  MessageSquare,
  AlertCircle,
  ShieldCheck,
  Clock,
  ArrowUpDown,
  BellRing,
  BadgeCheck,
} from "lucide-react";
import { formatDateRelative } from "../../lib/utils";
import { useAuthContext } from "../../context/AuthContext";
import productApi from "../../api/productApi";
import { toast } from "react-hot-toast";
import { z } from "zod";

// Form validation schema
const reviewFormSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().max(100, "Title cannot exceed 100 characters"),
  content: z
    .string()
    .min(10, "Review must be at least 10 characters")
    .max(1000, "Review cannot exceed 1000 characters"),
});

interface ProductReviewsProps {
  reviews: ProductReview[];
  productId: string;
  averageRating: number;
  reviewCount: number;
}

// Star Rating Component
interface StarRatingProps {
  rating: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const StarRating = ({
  rating,
  interactive = false,
  onChange,
}: StarRatingProps) => {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? "button" : undefined}
          onClick={interactive ? () => onChange?.(star) : undefined}
          onMouseEnter={interactive ? () => setHoveredStar(star) : undefined}
          onMouseLeave={interactive ? () => setHoveredStar(null) : undefined}
          className={`${
            interactive ? "cursor-pointer focus:outline-none" : ""
          } ${
            star <= (hoveredStar || rating) ? "text-amber-400" : "text-gray-300"
          }`}
          disabled={!interactive}
          aria-label={`${star} star${star !== 1 ? "s" : ""}`}
        >
          <Star
            className={`h-5 w-5 ${
              interactive ? "transition-transform hover:scale-110" : ""
            }`}
            fill={star <= (hoveredStar || rating) ? "currentColor" : "none"}
          />
        </button>
      ))}
    </div>
  );
};

// Review Form Component
interface ReviewFormProps {
  productId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const ReviewForm = ({ productId, onSuccess, onCancel }: ReviewFormProps) => {
  const { t } = useTranslation();
  const { user } = useAuthContext();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const validateForm = (): boolean => {
    try {
      if (!user) {
        setErrors({ general: t("products.reviews.loginRequired") });
        return false;
      }

      reviewFormSchema.parse({
        rating,
        title,
        content,
      });

      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            formattedErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(formattedErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await productApi.addProductReview(productId, {
        rating,
        title,
        content,
      });

      setSubmitSuccess(true);
      toast.success(t("products.reviews.thankYou"));

      // Reset form
      setTitle("");
      setContent("");
      setRating(5);

      // Notify parent component of success
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (error: unknown) {
      console.error("Error submitting review:", error);

      // Handle different error types
      if (error instanceof z.ZodError) {
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            formattedErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(formattedErrors);
      } else {
        // Extract error message from API response or use generic error
        const errorMessage = (
          error as {
            response?: {
              data?: {
                error?: string;
                errors?: Array<{
                  type: string;
                  msg: string;
                  path: string;
                  location: string;
                  value?: string;
                }>;
              };
            };
          }
        )?.response?.data;

        if (errorMessage?.errors && Array.isArray(errorMessage.errors)) {
          // Format validation errors from backend
          const formattedErrors: Record<string, string> = {};
          errorMessage.errors.forEach((err) => {
            formattedErrors[err.path] = err.msg;
          });
          setErrors(formattedErrors);
        } else {
          toast.error(errorMessage?.error || t("products.reviews.error"));
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 flex items-start">
        <Check className="h-5 w-5 mr-2 text-green-500" />
        <span>{t("products.reviews.thankYou")}</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("products.reviews.rating")}
        </label>
        <div className="flex items-center">
          <StarRating rating={rating} interactive={true} onChange={setRating} />
          <span className="ml-2 text-amber-800 font-medium">{rating}/5</span>
        </div>
      </div>

      <div className="mb-6">
        <label
          htmlFor="review-title"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {t("products.reviews.title")}
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`w-full px-4 py-3 border ${
            errors.title ? "border-red-500" : "border-gray-300"
          } rounded-lg focus:ring-amber-500 focus:border-amber-500`}
          placeholder={t("products.reviews.titlePlaceholder")}
        />
        {errors.title && (
          <div className="mt-2 text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span>{errors.title}</span>
          </div>
        )}
      </div>

      <div className="mb-6">
        <label
          htmlFor="review-content"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {t("products.reviews.comment")}
        </label>
        <textarea
          id="review-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={`w-full px-4 py-3 border ${
            errors.content ? "border-red-500" : "border-gray-300"
          } rounded-lg focus:ring-amber-500 focus:border-amber-500 resize-none`}
          rows={4}
          placeholder={t("products.reviews.commentPlaceholder")}
        ></textarea>
        {errors.content && (
          <div className="mt-2 text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span>{errors.content}</span>
          </div>
        )}
      </div>

      {/* Generic error message */}
      {errors.general && (
        <div className="mb-4 text-sm text-red-600 p-3 bg-red-50 rounded-lg border border-red-100 flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          <span>{errors.general}</span>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 rounded-full font-medium flex items-center border border-amber-300 text-amber-700 hover:bg-amber-50"
        >
          {t("common.cancel")}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-6 py-2 rounded-full font-medium flex items-center transition-all duration-300 ${
            isSubmitting
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-amber-600 to-amber-800 text-white hover:from-amber-700 hover:to-amber-900 shadow-md hover:shadow-lg"
          }`}
        >
          {isSubmitting ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              {t("products.reviews.submitting")}
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              {t("products.reviews.submit")}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

// Rating Distribution Component
interface RatingDistributionProps {
  reviews: ProductReview[];
  reviewCount: number;
}

const RatingDistribution = ({
  reviews,
  reviewCount,
}: RatingDistributionProps) => {
  const { t } = useTranslation();

  const distribution = [0, 0, 0, 0, 0]; // 5 stars to 1 star

  reviews.forEach((review) => {
    const index = 5 - review.rating;
    if (index >= 0 && index < 5) {
      distribution[index]++;
    }
  });

  return (
    <div className="md:col-span-2 p-6 bg-gradient-to-br from-amber-50 to-white rounded-lg shadow-sm">
      <h3 className="font-medium text-gray-900 mb-4">
        {t("products.reviews.ratingDistribution")}
      </h3>
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((star, index) => {
          const count = distribution[index];
          const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;

          return (
            <div key={star} className="flex items-center text-sm">
              <span className="w-6 text-gray-600">{star}</span>
              <Star
                className="h-4 w-4 text-amber-400 mx-1"
                fill="currentColor"
              />
              <div className="flex-1 ml-2">
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
              <span className="ml-2 text-gray-500 w-8 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Individual Review Component
interface ReviewItemProps {
  review: ProductReview;
  isUserReview?: boolean;
}

const ReviewItem = ({ review, isUserReview = false }: ReviewItemProps) => {
  const { t } = useTranslation();

  return (
    <div
      className={`p-6 ${
        isUserReview
          ? "bg-gradient-to-br from-amber-100 to-amber-50 border-l-4 border-amber-500"
          : "bg-gradient-to-br from-amber-50 to-white"
      } rounded-lg shadow-sm transition-all duration-300 hover:shadow-md`}
    >
      {isUserReview && (
        <div className="mb-3 flex items-center text-amber-800">
          <BadgeCheck className="h-5 w-5 mr-2" />
          <span className="font-medium">
            {t("products.reviews.yourReview")}
          </span>
        </div>
      )}
      <div className="flex justify-between mb-4">
        <div className="flex items-start space-x-3">
          {review.user?.avatar && (
            <img
              src={review.user.avatar}
              alt={review.user.fullName || review.user.username}
              className="w-10 h-10 rounded-full object-cover border border-amber-200"
            />
          )}
          <div>
            <h4 className="font-medium text-gray-900">{review.title}</h4>
            <div className="flex items-center mt-1">
              <StarRating rating={review.rating} />
              <span className="ml-2 text-sm text-gray-600">
                {formatDateRelative(review.createdAt)}
              </span>
            </div>
            <p className="text-sm text-gray-700 mt-1">
              {review.user?.fullName || review.user?.username}
            </p>
          </div>
        </div>
        {review.isVerifiedPurchase && (
          <div className="hidden md:flex md:items-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              <ShieldCheck className="h-3 w-3 mr-1" />
              {t("products.verifiedPurchase")}
            </span>
          </div>
        )}
      </div>

      <div className="prose prose-sm max-w-none text-gray-700 mt-3 pl-0 md:pl-12">
        <p>{review.content}</p>
      </div>

      <div className="mt-4 flex justify-between items-center pl-0 md:pl-12">
        {review.isVerifiedPurchase && (
          <div className="md:hidden">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              <ShieldCheck className="h-3 w-3 mr-1" />
              {t("products.verifiedPurchase")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Review Prompt Component for eligible users
const ReviewPrompt = ({ onClick }: { onClick: () => void }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-r from-amber-100 to-amber-50 p-6 rounded-lg shadow-sm border-l-4 border-amber-500 mb-8 animate-pulse-slow">
      <div className="flex items-center">
        <div className="flex-shrink-0 mr-4">
          <BellRing className="h-10 w-10 text-amber-600" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="font-medium text-amber-800 text-lg">
            {t("products.reviews.eligiblePromptTitle")}
          </h3>
          <p className="text-amber-700 mt-1">
            {t("products.reviews.eligiblePromptMessage")}
          </p>
          <button
            onClick={onClick}
            className="mt-3 inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-amber-600 text-white hover:bg-amber-700 transition-colors"
          >
            <Pencil className="h-4 w-4 mr-2" />
            {t("products.reviews.writeReview")}
          </button>
        </div>
      </div>
    </div>
  );
};

// Sort options for reviews
enum SortOption {
  NEWEST = "newest",
  OLDEST = "oldest",
  HIGHEST_RATING = "highest",
  LOWEST_RATING = "lowest",
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
