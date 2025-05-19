import { Truck } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Cart } from "../../types";

interface OrderSummaryProps {
  cart: Cart;
  formatPrice: (price: number) => string;
}

const OrderSummary = ({ cart, formatPrice }: OrderSummaryProps) => {
  const { t } = useTranslation();

  // Fixed shipping cost
  const shippingCost = 30000;

  // Tax calculation (10%)
  const taxAmount = cart.totalPrice * 0.1;

  // Total amount
  const totalAmount = cart.totalPrice + shippingCost + taxAmount;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
      <h2 className="text-lg font-medium text-gray-900 mb-6 pb-4 border-b border-gray-200">
        {t("cart.orderSummary")}
      </h2>

      <div className="space-y-4 mb-6">
        {cart.items.map((item) => (
          <div
            key={`${item.productId}-${item.variantId || ""}`}
            className="flex items-center space-x-4"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-16 h-16 object-cover rounded-md border border-gray-200"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.name}
              </p>
              {item.variantName && (
                <p className="text-xs text-gray-500">{item.variantName}</p>
              )}
              <p className="text-sm text-gray-600">
                {item.quantity} x {formatPrice(item.price)}
              </p>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {formatPrice(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-4 space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">{t("cart.subtotal")}</span>
          <span className="text-gray-800 font-medium">
            {formatPrice(cart.totalPrice)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">{t("cart.shipping")}</span>
          <span className="text-gray-800 font-medium">
            {formatPrice(shippingCost)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">{t("cart.tax")}</span>
          <span className="text-gray-800 font-medium">
            {formatPrice(taxAmount)}
          </span>
        </div>

        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex justify-between">
            <span className="text-lg font-medium text-gray-900">
              {t("cart.total")}
            </span>
            <span className="text-lg font-medium text-amber-700">
              {formatPrice(totalAmount)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center mb-4">
          <Truck className="h-5 w-5 text-amber-600 mr-2" />
          <span className="text-sm text-gray-600">
            {t("checkout.estimatedDelivery")}: 3-5 {t("checkout.businessDays")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
