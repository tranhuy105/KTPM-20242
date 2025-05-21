import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCartContext } from "../context/CartContext";
import { Check } from "lucide-react";
import Breadcrumb from "../components/common/Breadcrumb";
import toast from "react-hot-toast";
import CheckoutSteps from "../components/checkout/CheckoutSteps";
import ShippingForm from "../components/checkout/ShippingForm";
import PaymentForm from "../components/checkout/PaymentForm";
import OrderSummary from "../components/checkout/OrderSummary";
import EmptyCartView from "../components/checkout/EmptyCartView";
import type { CheckoutFormData, OrderData } from "../types/Checkout";
import orderApi from "../api/orderApi";
import { AxiosError } from "axios";
import { formatCurrency } from "../lib/utils";
import { useAuthContext } from "../context/AuthContext";

// Error interface for API validation errors
interface ValidationError {
  msg: string;
  param: string;
  location: string;
}

interface ApiErrorResponse {
  errors?: ValidationError[];
  message?: string;
}

const CheckoutPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { cart, clearCart } = useCartContext();
  const [currentStep, setCurrentStep] = useState<"shipping" | "payment">(
    "shipping"
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: "",
    addressLine1: user?.addresses?.[0]?.addressLine1 || "",
    addressLine2: user?.addresses?.[0]?.addressLine2 || "",
    city: user?.addresses?.[0]?.city || "",
    state: user?.addresses?.[0]?.state || "",
    postalCode: user?.addresses?.[0]?.postalCode || "",
    country: "Vietnam",
    cardName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle shipping form submission
  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate shipping form
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.addressLine1 ||
      !formData.city ||
      !formData.state ||
      !formData.postalCode ||
      !formData.country
    ) {
      toast.error(t("checkout.fillAllFields"));
      return;
    }

    // Move to payment step
    setCurrentStep("payment");
    window.scrollTo(0, 0);
  };

  // Handle payment form submission
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate payment form
    if (
      !formData.cardName ||
      !formData.cardNumber ||
      !formData.expiryDate ||
      !formData.cvv
    ) {
      toast.error(t("checkout.fillAllFields"));
      return;
    }

    // Process payment
    handleProcessPayment();
  };

  // Handle payment processing
  const handleProcessPayment = async () => {
    setIsProcessing(true);

    try {
      // Fixed shipping cost
      const shippingCost = 30000;

      // Tax calculation (10%)
      const taxAmount = cart.totalPrice * 0.1;

      // Prepare order data
      const orderData: OrderData = {
        products: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          variantId: item.variantId,
        })),
        shipping: {
          method: "Standard Shipping",
          cost: shippingCost,
          address: {
            fullName: formData.fullName,
            addressLine1: formData.addressLine1,
            addressLine2: formData.addressLine2,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            country: formData.country,
            phone: formData.phone,
          },
        },
        billing: {
          paymentMethod: "Credit Card",
          address: {
            fullName: formData.fullName,
            addressLine1: formData.addressLine1,
            addressLine2: formData.addressLine2,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            country: formData.country,
            phone: formData.phone,
          },
        },
        taxAmount: taxAmount,
        customerNote: "",
        ipAddress: "127.0.0.1",
      };

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Debug log to see what's being sent
      console.log("Sending order data:", JSON.stringify(orderData, null, 2));

      // Call API to create order
      await orderApi.createOrder(orderData);

      // Show success message
      toast.success(
        <div className="flex items-center gap-2">
          <Check size={18} />
          <span>{t("checkout.orderSuccess")}</span>
        </div>
      );

      // Clear cart
      clearCart();

      // Redirect to order confirmation
      navigate("/order-confirmation");
    } catch (error) {
      console.error("Error creating order:", error);

      // Show more detailed error message if available
      if (error instanceof AxiosError && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        if (errorData.errors) {
          const errorMessages = errorData.errors
            .map((err) => err.msg)
            .join(", ");
          toast.error(`${t("checkout.orderError")}: ${errorMessages}`);
        } else if (errorData.message) {
          toast.error(`${t("checkout.orderError")}: ${errorData.message}`);
        } else {
          toast.error(t("checkout.orderError"));
        }
      } else {
        toast.error(t("checkout.orderError"));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Empty cart view
  if (cart.items.length === 0) {
    return <EmptyCartView />;
  }

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

        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-serif font-medium text-gray-900 mb-8 text-center">
            {t("checkout.title")}
          </h1>

          {/* Checkout steps */}
          <CheckoutSteps currentStep={currentStep} />

          {/* Checkout content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                {currentStep === "shipping" && (
                  <ShippingForm
                    formData={formData}
                    handleChange={handleChange}
                    handleSubmit={handleShippingSubmit}
                  />
                )}

                {currentStep === "payment" && (
                  <PaymentForm
                    formData={formData}
                    handleChange={handleChange}
                    handleSubmit={handlePaymentSubmit}
                    isProcessing={isProcessing}
                    onBackToShipping={() => setCurrentStep("shipping")}
                  />
                )}
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <OrderSummary cart={cart} formatPrice={formatCurrency} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
