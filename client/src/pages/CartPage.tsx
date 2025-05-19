import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCartContext } from "../context/CartContext";
import {
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  ShoppingBag,
  Check,
} from "lucide-react";
import Breadcrumb from "../components/common/Breadcrumb";
import toast from "react-hot-toast";

const CartPage = () => {
  const { t } = useTranslation();
  const { cart, updateQuantity, removeItem } = useCartContext();
  const [isProcessing, setIsProcessing] = useState(false);

  // Format price in VND
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Handle checkout
  const handleCheckout = () => {
    setIsProcessing(true);

    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      // Redirect to checkout would happen here
      toast.success(
        <div className="flex items-center gap-2">
          <Check size={18} />
          <span>{t("cart.checkoutSoon")}</span>
        </div>
      );
    }, 1500);
  };

  // Handle remove item with toast notification
  const handleRemoveItem = (productId: string, variantId?: string) => {
    removeItem(productId, variantId);
    toast(
      <div className="flex items-center gap-2">
        <Trash2 size={18} />
        <span>{t("cart.itemRemoved")}</span>
      </div>,
      {
        icon: "🗑️",
      }
    );
  };

  // Handle quantity update with toast notification for significant changes
  const handleUpdateQuantity = (
    productId: string,
    newQuantity: number,
    oldQuantity: number,
    variantId?: string
  ) => {
    updateQuantity(productId, newQuantity, variantId);

    // Only show toast for significant quantity changes (e.g., more than doubling or halving)
    if (newQuantity >= oldQuantity * 2) {
      toast.success(
        <div className="flex items-center gap-2">
          <Plus size={18} />
          <span>{t("cart.quantityIncreased")}</span>
        </div>
      );
    } else if (newQuantity <= oldQuantity / 2 && newQuantity > 0) {
      toast(
        <div className="flex items-center gap-2">
          <Minus size={18} />
          <span>{t("cart.quantityDecreased")}</span>
        </div>,
        {
          icon: "📉",
        }
      );
    }
  };

  // Empty cart view
  if (cart.items.length === 0) {
    return (
      <div className="bg-white min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <Breadcrumb
            items={[
              { label: t("common.home"), path: "/" },
              { label: t("cart.title"), path: "/cart" },
            ]}
          />

          <div className="max-w-2xl mx-auto text-center mt-16 mb-24">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-amber-50 rounded-full mb-8">
              <ShoppingBag className="h-12 w-12 text-amber-600" />
            </div>
            <h1 className="text-3xl font-serif font-medium text-gray-900 mb-6">
              {t("cart.empty")}
            </h1>
            <p className="text-gray-600 mb-8">{t("cart.emptyMessage")}</p>
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-800 text-white rounded-full shadow-md hover:from-amber-700 hover:to-amber-900 transition-all duration-300"
            >
              {t("cart.continueShopping")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <Breadcrumb
          items={[
            { label: t("common.home"), path: "/" },
            { label: t("cart.title"), path: "/cart" },
          ]}
        />

        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-serif font-medium text-gray-900 mb-8 text-center">
            {t("cart.title")}
          </h1>

          {/* Cart content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="hidden md:grid grid-cols-12 gap-4 mb-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                    <div className="col-span-6">{t("cart.product")}</div>
                    <div className="col-span-2 text-center">
                      {t("cart.price")}
                    </div>
                    <div className="col-span-2 text-center">
                      {t("cart.quantity")}
                    </div>
                    <div className="col-span-2 text-right">
                      {t("cart.total")}
                    </div>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {cart.items.map((item) => (
                      <div
                        key={`${item.productId}-${item.variantId || ""}`}
                        className="py-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                      >
                        {/* Product */}
                        <div className="col-span-6 flex items-center space-x-4">
                          <Link
                            to={`/products/${item.productId}`}
                            className="shrink-0"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-24 h-24 object-cover rounded-md border border-gray-200"
                            />
                          </Link>
                          <div>
                            <Link
                              to={`/products/${item.productId}`}
                              className="text-gray-800 font-medium hover:text-amber-600 transition-colors"
                            >
                              {item.name}
                            </Link>
                            {item.variantName && (
                              <p className="text-sm text-gray-500 mt-1">
                                {item.variantName}
                              </p>
                            )}
                            <button
                              onClick={() =>
                                handleRemoveItem(item.productId, item.variantId)
                              }
                              className="flex items-center text-sm text-red-600 hover:text-red-800 mt-2 transition-colors"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              {t("cart.remove")}
                            </button>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="md:col-span-2 flex md:block items-center justify-between">
                          <span className="md:hidden text-gray-600">
                            {t("cart.price")}:
                          </span>
                          <span className="text-gray-800 font-medium text-center block">
                            {formatPrice(item.price)}
                          </span>
                        </div>

                        {/* Quantity */}
                        <div className="md:col-span-2 flex md:justify-center items-center">
                          <span className="md:hidden text-gray-600 mr-2">
                            {t("cart.quantity")}:
                          </span>
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.productId,
                                  Math.max(1, item.quantity - 1),
                                  item.quantity,
                                  item.variantId
                                )
                              }
                              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <input
                              type="text"
                              value={item.quantity}
                              readOnly
                              className="w-10 text-center border-x border-gray-300 h-8"
                            />
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.productId,
                                  item.quantity + 1,
                                  item.quantity,
                                  item.variantId
                                )
                              }
                              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {/* Total */}
                        <div className="md:col-span-2 flex md:block items-center justify-between">
                          <span className="md:hidden text-gray-600">
                            {t("cart.total")}:
                          </span>
                          <span className="text-gray-800 font-medium md:text-right block">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-lg font-medium text-gray-900 mb-6 pb-4 border-b border-gray-200">
                  {t("cart.orderSummary")}
                </h2>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("cart.subtotal")}</span>
                    <span className="text-gray-800 font-medium">
                      {formatPrice(cart.totalPrice)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("cart.shipping")}</span>
                    <span className="text-gray-800 font-medium">
                      {t("cart.calculatedAtCheckout")}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("cart.tax")}</span>
                    <span className="text-gray-800 font-medium">
                      {t("cart.calculatedAtCheckout")}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between">
                      <span className="text-lg font-medium text-gray-900">
                        {t("cart.total")}
                      </span>
                      <span className="text-lg font-medium text-amber-700">
                        {formatPrice(cart.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className={`w-full mt-8 py-4 px-6 rounded-full font-medium text-base uppercase tracking-wider transition-all duration-300 flex items-center justify-center ${
                    isProcessing
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-600 to-amber-800 text-white hover:from-amber-700 hover:to-amber-900 shadow-md hover:shadow-lg"
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
                      {t("cart.processing")}
                    </>
                  ) : (
                    <>
                      {t("cart.proceedToCheckout")}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>

                <div className="mt-6">
                  <Link
                    to="/products"
                    className="text-amber-600 hover:text-amber-800 text-sm flex items-center justify-center transition-colors"
                  >
                    <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                    {t("cart.continueShopping")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
