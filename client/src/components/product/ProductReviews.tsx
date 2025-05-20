import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { ProductReview } from "../../types";
import {
  Star,
  ThumbsUp,
  MessageCircle,
  Pencil,
  Check,
  MessageSquare,
} from "lucide-react";
import { formatDateRelative } from "../../lib/utils";
interface ProductReviewsProps {
  reviews: ProductReview[];
  productId: string;
  averageRating: number;
  reviewCount: number;
}

const ProductReviews = ({
  reviews,
  productId,
  averageRating,
  reviewCount,
}: ProductReviewsProps) => {
  const { t } = useTranslation();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  // Handle submit review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!title.trim()) {
      setSubmitError(t("products.reviews.titleRequired"));
      return;
    }

    if (!content.trim()) {
      setSubmitError(t("products.reviews.commentRequired"));
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // This would typically call an API to submit the review
      console.log("Submitting review:", {
        productId,
        rating,
        title,
        content,
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Show success message
      setSubmitSuccess(true);
      setTitle("");
      setContent("");
      setRating(5);

      // Hide form after 2 seconds
      setTimeout(() => {
        setShowReviewForm(false);
        setSubmitSuccess(false);
      }, 2000);
    } catch {
      setSubmitError(t("products.reviews.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate star rating display
  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => setRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoveredStar(star) : undefined}
            onMouseLeave={interactive ? () => setHoveredStar(null) : undefined}
            className={`${
              interactive ? "cursor-pointer focus:outline-none" : ""
            } ${
              star <= (hoveredStar || rating)
                ? "text-amber-400"
                : "text-gray-300"
            }`}
            disabled={!interactive}
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

  // Generate rating distribution bar
  const renderRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0]; // 5 stars to 1 star

    reviews.forEach((review) => {
      const index = 5 - review.rating;
      if (index >= 0 && index < 5) {
        distribution[index]++;
      }
    });

    return (
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
    );
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
        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="mt-4 md:mt-0 bg-gradient-to-r from-amber-600 to-amber-800 text-white py-2 px-6 rounded-full hover:from-amber-700 hover:to-amber-900 transition-all duration-300 font-medium shadow-md hover:shadow-lg flex items-center"
        >
          <Pencil className="h-5 w-5 mr-2" />
          {showReviewForm
            ? t("products.reviews.cancelReview")
            : t("products.reviews.writeReview")}
        </button>
      </div>

      {/* Review form */}
      {showReviewForm && (
        <div className="mb-12 bg-gradient-to-br from-amber-50 to-white p-6 rounded-lg shadow-md animate-fade-in">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t("products.reviews.yourReview")}
          </h3>

          {submitSuccess ? (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 flex items-start">
              <Check className="h-5 w-5 mr-2 text-green-500" />
              <span>{t("products.reviews.thankYou")}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmitReview}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("products.reviews.rating")}
                </label>
                <div className="flex items-center">
                  {renderStars(rating, true)}
                  <span className="ml-2 text-amber-800 font-medium">
                    {rating}/5
                  </span>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                  placeholder={t("products.reviews.titlePlaceholder")}
                  required
                />
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 resize-none"
                  rows={4}
                  placeholder={t("products.reviews.commentPlaceholder")}
                  required
                ></textarea>
                {submitError && (
                  <p className="mt-2 text-sm text-red-600">{submitError}</p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                    isSubmitting
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-600 to-amber-800 text-white hover:from-amber-700 hover:to-amber-900 shadow-md hover:shadow-lg"
                  }`}
                >
                  {isSubmitting
                    ? t("products.reviews.submitting")
                    : t("products.reviews.submit")}
                </button>
              </div>
            </form>
          )}
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
            <div className="mb-2">{renderStars(Math.round(averageRating))}</div>
            <div className="text-sm text-gray-600">
              {t("products.reviews.basedOn", { count: reviewCount })}
            </div>
          </div>

          {/* Rating distribution */}
          <div className="md:col-span-2 p-6 bg-gradient-to-br from-amber-50 to-white rounded-lg shadow-sm">
            <h3 className="font-medium text-gray-900 mb-4">
              {t("products.reviews.ratingDistribution")}
            </h3>
            {renderRatingDistribution()}
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
          reviews.map((review) => (
            <div
              key={review._id}
              className="p-6 bg-gradient-to-br from-amber-50 to-white rounded-lg shadow-sm transition-all duration-300 hover:shadow-md"
            >
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
                    <h4 className="font-medium text-gray-900">
                      {review.title}
                    </h4>
                    <div className="flex items-center mt-1">
                      {renderStars(review.rating)}
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
                  <div className="hidden md:block">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      {t("products.verifiedPurchase")}
                    </span>
                  </div>
                )}
              </div>

              <div className="prose prose-sm max-w-none text-gray-700 mt-3 pl-0 md:pl-12">
                <p>{review.content}</p>
              </div>

              <div className="mt-4 flex justify-between items-center pl-0 md:pl-12">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <button className="flex items-center hover:text-amber-700 transition-colors">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {t("products.reviews.helpful")}
                  </button>
                  <button className="flex items-center hover:text-amber-700 transition-colors">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {t("products.reviews.reply")}
                  </button>
                </div>
                {review.isVerifiedPurchase && (
                  <div className="md:hidden">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      {t("products.verifiedPurchase")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
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
      `}</style>
    </div>
  );
};

export default ProductReviews;
