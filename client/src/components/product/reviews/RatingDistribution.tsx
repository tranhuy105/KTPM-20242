import { useTranslation } from "react-i18next";
import { Star } from "lucide-react";
import type { ProductReview } from "../../../types";

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

export default RatingDistribution;
