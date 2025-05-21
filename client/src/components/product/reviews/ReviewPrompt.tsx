import { useTranslation } from "react-i18next";
import { BellRing, Pencil } from "lucide-react";

interface ReviewPromptProps {
  onClick: () => void;
}

const ReviewPrompt = ({ onClick }: ReviewPromptProps) => {
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

export default ReviewPrompt;
