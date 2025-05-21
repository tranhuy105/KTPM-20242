import { useState, useEffect } from "react";
import { useAuthContext } from "../../context/AuthContext";
import type { Address } from "../../types/User";
import { MapPin, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AddressSelectorProps {
  selectedAddress: Address | null;
  onAddressSelect: (address: Address) => void;
  onAddNewClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  title?: string;
}

const AddressSelector = ({
  selectedAddress,
  onAddressSelect,
  onAddNewClick,
  title = "Select Address",
}: AddressSelectorProps) => {
  const { user } = useAuthContext();
  const { t } = useTranslation();
  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0) {
      setAddresses(user.addresses);

      // If no address is selected yet but we have a default address, select it
      if (!selectedAddress && user.addresses.some((addr) => addr.isDefault)) {
        const defaultAddress = user.addresses.find((addr) => addr.isDefault);
        if (defaultAddress) {
          onAddressSelect(defaultAddress);
        }
      }
    }
  }, [user, selectedAddress, onAddressSelect]);

  if (!user || !addresses.length) {
    return (
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <div className="text-center py-4">
          <p className="text-gray-500 mb-4">{t("checkout.noSavedAddresses")}</p>
          {onAddNewClick && (
            <button
              onClick={onAddNewClick}
              className="flex items-center gap-1 mx-auto text-sm bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors"
            >
              <Plus size={16} />
              {t("address.addNew")}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h3 className="font-medium flex items-center gap-2">
          <MapPin size={18} className="text-amber-600" />
          {title}
        </h3>
      </div>
      <div className="p-4">
        <div className="grid gap-4">
          {addresses.map((address) => (
            <div
              key={address._id}
              className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                selectedAddress && selectedAddress._id === address._id
                  ? "border-amber-500 bg-amber-50"
                  : "border-gray-200 hover:border-amber-300 hover:bg-amber-50/50"
              }`}
              onClick={() => onAddressSelect(address)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">{address.fullName}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {address.addressLine1}
                    {address.addressLine2 && <>, {address.addressLine2}</>}
                  </p>
                  <p className="text-sm text-gray-600">
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                  <p className="text-sm text-gray-600">{address.country}</p>
                  {address.phone && (
                    <p className="text-sm text-gray-600 mt-1">
                      {address.phone}
                    </p>
                  )}
                </div>
                <div className="flex items-center">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedAddress && selectedAddress._id === address._id
                        ? "border-amber-500"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedAddress && selectedAddress._id === address._id && (
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    )}
                  </div>
                </div>
              </div>
              {address.isDefault && (
                <div className="mt-2 text-xs font-medium text-amber-600 bg-amber-100 inline-block px-2 py-1 rounded">
                  {t("address.default")}
                </div>
              )}
            </div>
          ))}
        </div>

        {onAddNewClick && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={onAddNewClick}
              className="flex items-center gap-1 text-sm bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              <Plus size={16} />
              {t("address.useNewAddress")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressSelector;
