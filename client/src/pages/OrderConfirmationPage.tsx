import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle, ShoppingBag, Truck } from "lucide-react";
import Breadcrumb from "../components/common/Breadcrumb";

const OrderConfirmationPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <Breadcrumb
          items={[
            { label: t("common.home"), path: "/" },
            { label: t("checkout.title"), path: "/checkout" },
            { label: t("checkout.confirmation"), path: "/order-confirmation" },
          ]}
        />

        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-50 rounded-full mb-8">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>

            <h1 className="text-3xl font-serif font-medium text-gray-900 mb-4">
              {t("checkout.orderConfirmed")}
            </h1>

            <p className="text-gray-600 mb-8">
              {t("checkout.orderConfirmationMessage")}
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                <div className="flex items-center mb-4 md:mb-0"></div>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center mb-4 md:mb-0">
                  <Truck className="h-5 w-5 text-amber-600 mr-2" />
                  <span className="text-gray-700 font-medium">
                    {t("checkout.estimatedDelivery")}:
                  </span>
                </div>
                <span className="text-gray-900">
                  3-5 {t("checkout.businessDays")}
                </span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-center gap-4 mt-8">
              <button
                onClick={() => navigate("/")}
                className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-800 text-white rounded-md shadow-md hover:from-amber-700 hover:to-amber-900 transition-all duration-300"
              >
                {t("common.backToHome")}
              </button>

              <button
                onClick={() => navigate("/products")}
                className="px-8 py-3 border border-amber-600 text-amber-600 rounded-md hover:bg-amber-50 transition-colors flex items-center justify-center"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                {t("checkout.continueShopping")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
