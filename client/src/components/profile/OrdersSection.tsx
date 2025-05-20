import { useTranslation } from "react-i18next";

const OrdersSection = () => {
  const { t } = useTranslation();

  return (
    <div className="py-8">
      <h2 className="text-xl font-semibold mb-6">
        {t("orders.title") || "My Orders"}
      </h2>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          {t("orders.comingSoon") || "Orders Feature Coming Soon"}
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          {t("orders.comingSoonDescription") ||
            "We're working on implementing order tracking and management. Check back soon to view and manage your orders."}
        </p>
      </div>
    </div>
  );
};

export default OrdersSection;
