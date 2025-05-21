import { ArrowLeft, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import type { CheckoutFormData } from "../../types/Checkout";
import { useState } from "react";
import AddressSelector from "./AddressSelector";
import type { Address } from "../../types/User";
import { useAuthContext } from "../../context/AuthContext";

interface ShippingFormProps {
  formData: CheckoutFormData;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const ShippingForm = ({
  formData,
  handleChange,
  handleSubmit,
}: ShippingFormProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [useCustomAddress, setUseCustomAddress] = useState(
    !user?.addresses || user.addresses.length === 0
  );

  // Handle address selection from saved addresses
  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
    setUseCustomAddress(false);

    // Update form data with selected address
    const updatedFormData = {
      ...formData,
      fullName: address.fullName,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || "",
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone || formData.phone,
    };

    // Simulate onChange events to update parent state
    Object.entries(updatedFormData).forEach(([name, value]) => {
      const event = {
        target: { name, value },
      } as React.ChangeEvent<HTMLInputElement>;
      handleChange(event);
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-medium text-gray-900 mb-6 pb-4 border-b border-gray-200 flex items-center">
        <MapPin className="mr-2" size={20} />
        {t("checkout.shippingInformation")}
      </h2>

      {/* Saved Addresses Section */}
      {!useCustomAddress && user?.addresses && user.addresses.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            {t("checkout.savedAddresses")}
          </h3>
          <AddressSelector
            selectedAddress={selectedAddress}
            onAddressSelect={handleAddressSelect}
            onAddNewClick={(e) => {
              e.preventDefault();
              setUseCustomAddress(true);
            }}
            title={t("checkout.selectSavedAddress")}
          />
        </div>
      )}

      {/* Custom Address Form */}
      {useCustomAddress && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("checkout.fullName")} *
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("checkout.email")} *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("checkout.phone")} *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="country"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("checkout.country")} *
            </label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              defaultValue={"Vietnam"}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            >
              <option value="">{t("checkout.selectCountry")}</option>
              <option value="Vietnam">Vietnam</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="addressLine1"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("checkout.addressLine1")} *
            </label>
            <input
              type="text"
              id="addressLine1"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="addressLine2"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("checkout.addressLine2")}
            </label>
            <input
              type="text"
              id="addressLine2"
              name="addressLine2"
              value={formData.addressLine2}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label
              htmlFor="city"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("checkout.city")} *
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="state"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("checkout.state")} *
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="postalCode"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("checkout.postalCode")} *
            </label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>
        </div>
      )}

      {/* If user has addresses and is using custom form, show option to go back to saved addresses */}
      {useCustomAddress && user?.addresses && user.addresses.length > 0 && (
        <button
          type="button"
          onClick={() => {
            setUseCustomAddress(false);
            // If there was a previously selected address, select it again
            if (selectedAddress) {
              handleAddressSelect(selectedAddress);
            } else if (user?.addresses && user.addresses.length > 0) {
              // Otherwise select the default address or the first one
              const defaultAddress =
                user.addresses.find((addr) => addr.isDefault) ||
                user.addresses[0];
              handleAddressSelect(defaultAddress);
            }
          }}
          className="mb-6 text-amber-600 underline hover:text-amber-700"
        >
          {t("checkout.useSavedAddress")}
        </button>
      )}

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={() => navigate("/cart")}
          className="px-6 py-3 text-amber-600 border border-amber-600 rounded-md hover:bg-amber-50 transition-colors flex items-center"
        >
          <ArrowLeft size={18} className="mr-2" />
          {t("checkout.backToCart")}
        </button>

        <button
          type="submit"
          className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-800 text-white rounded-md shadow-md hover:from-amber-700 hover:to-amber-900 transition-all duration-300"
        >
          {t("checkout.continueToPayment")}
        </button>
      </div>
    </form>
  );
};

export default ShippingForm;
