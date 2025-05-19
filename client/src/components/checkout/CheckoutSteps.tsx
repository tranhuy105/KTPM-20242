import { CreditCard, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CheckoutStepsProps {
  currentStep: "shipping" | "payment";
}

const CheckoutSteps = ({ currentStep }: CheckoutStepsProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-center mb-12">
      <div className="flex items-center w-full max-w-3xl">
        <div
          className={`flex-1 flex flex-col items-center ${
            currentStep === "shipping" ? "text-amber-600" : "text-gray-500"
          }`}
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
              currentStep === "shipping"
                ? "bg-amber-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            <MapPin size={20} />
          </div>
          <span className="text-sm font-medium">{t("checkout.shipping")}</span>
        </div>

        <div className="w-24 h-px bg-gray-300 mx-4"></div>

        <div
          className={`flex-1 flex flex-col items-center ${
            currentStep === "payment" ? "text-amber-600" : "text-gray-500"
          }`}
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
              currentStep === "payment"
                ? "bg-amber-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            <CreditCard size={20} />
          </div>
          <span className="text-sm font-medium">{t("checkout.payment")}</span>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSteps;
