import { useTranslation } from "react-i18next";
import { ShieldCheck, BadgeCheck } from "lucide-react";
import type { ProductReview } from "../../../types";
import StarRating from "./StarRating";
import { formatDateRelative } from "../../../lib/utils";

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

export default ReviewItem;
