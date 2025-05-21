import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, Check, Clock } from "lucide-react";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { useAuthContext } from "../../../context/AuthContext";
import productApi from "../../../api/productApi";
import StarRating from "./StarRating";

// Form validation schema
const reviewFormSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().max(100, "Title cannot exceed 100 characters"),
  content: z
    .string()
    .min(10, "Review must be at least 10 characters")
    .max(1000, "Review cannot exceed 1000 characters"),
});

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

export default ReviewForm;
