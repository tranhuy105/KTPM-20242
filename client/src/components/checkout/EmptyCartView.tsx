import { ArrowLeft, CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../common/Breadcrumb";

const EmptyCartView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <Breadcrumb
          items={[
            { label: t("common.home"), path: "/" },
            { label: t("cart.title"), path: "/cart" },
            { label: t("checkout.title"), path: "/checkout" },
          ]}
        />

        <div className="max-w-2xl mx-auto text-center mt-16 mb-24">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-amber-50 rounded-full mb-8">
            <CreditCard className="h-12 w-12 text-amber-600" />
          </div>
          <h1 className="text-3xl font-serif font-medium text-gray-900 mb-6">
            {t("checkout.emptyCart")}
          </h1>
          <p className="text-gray-600 mb-8">{t("checkout.addItemsMessage")}</p>
          <button
            onClick={() => navigate("/products")}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-800 text-white rounded-full shadow-md hover:from-amber-700 hover:to-amber-900 transition-all duration-300"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            {t("checkout.backToShopping")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmptyCartView;
