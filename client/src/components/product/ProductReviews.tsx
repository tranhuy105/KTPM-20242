import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { ProductReview } from "../../types";
import { formatDistanceToNow } from "date-fns";

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
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  // Handle submit review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!comment.trim()) {
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
        comment,
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Show success message
      setSubmitSuccess(true);
      setComment("");
      setRating(5);

      // Hide form after 2 seconds
      setTimeout(() => {
        setShowReviewForm(false);
        setSubmitSuccess(false);
      }, 2000);
    } catch (_) {
      setSubmitError(t("products.reviews.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date to relative time (e.g., "2 days ago")
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (_) {
      return dateString;
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 ${
                interactive ? "transition-transform hover:scale-110" : ""
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-amber-400 mx-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
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
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-green-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
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
                  htmlFor="review-comment"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {t("products.reviews.comment")}
                </label>
                <textarea
                  id="review-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-amber-300 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
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
                <div>
                  <h4 className="font-medium text-gray-900">
                    {review.userName}
                  </h4>
                  <div className="flex items-center mt-1">
                    {renderStars(review.rating)}
                    <span className="ml-2 text-sm text-gray-600">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="hidden md:block">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    {t("products.verifiedPurchase")}
                  </span>
                </div>
              </div>

              <div className="prose prose-sm max-w-none text-gray-700">
                <p>{review.comment}</p>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <button className="flex items-center hover:text-amber-700 transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                      />
                    </svg>
                    {t("products.helpful")}
                  </button>
                  <button className="flex items-center hover:text-amber-700 transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                    {t("products.reply")}
                  </button>
                </div>
                <div className="md:hidden">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    {t("products.verifiedPurchase")}
                  </span>
                </div>
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
