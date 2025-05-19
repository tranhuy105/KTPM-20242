import { ArrowLeft, CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { CheckoutFormData } from "../../types/Checkout";

interface PaymentFormProps {
  formData: CheckoutFormData;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isProcessing: boolean;
  onBackToShipping: () => void;
}

const PaymentForm = ({
  formData,
  handleChange,
  handleSubmit,
  isProcessing,
  onBackToShipping,
}: PaymentFormProps) => {
  const { t } = useTranslation();

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-medium text-gray-900 mb-6 pb-4 border-b border-gray-200 flex items-center">
        <CreditCard className="mr-2" size={20} />
        {t("checkout.paymentInformation")}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="md:col-span-2">
          <label
            htmlFor="cardName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("checkout.nameOnCard")} *
          </label>
          <input
            type="text"
            id="cardName"
            name="cardName"
            value={formData.cardName}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="cardNumber"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("checkout.cardNumber")} *
          </label>
          <input
            type="text"
            id="cardNumber"
            name="cardNumber"
            value={formData.cardNumber}
            onChange={handleChange}
            placeholder="XXXX XXXX XXXX XXXX"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="expiryDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("checkout.expiryDate")} *
          </label>
          <input
            type="text"
            id="expiryDate"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            placeholder="MM/YY"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="cvv"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("checkout.cvv")} *
          </label>
          <input
            type="text"
            id="cvv"
            name="cvv"
            value={formData.cvv}
            onChange={handleChange}
            placeholder="XXX"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={onBackToShipping}
          className="px-6 py-3 text-amber-600 border border-amber-600 rounded-md hover:bg-amber-50 transition-colors flex items-center"
        >
          <ArrowLeft size={18} className="mr-2" />
          {t("checkout.backToShipping")}
        </button>

        <button
          type="submit"
          disabled={isProcessing}
          className={`px-8 py-3 rounded-md shadow-md transition-all duration-300 flex items-center ${
            isProcessing
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-amber-600 to-amber-800 text-white hover:from-amber-700 hover:to-amber-900"
          }`}
        >
          {isProcessing ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {t("checkout.processing")}
            </>
          ) : (
            t("checkout.placeOrder")
          )}
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;
