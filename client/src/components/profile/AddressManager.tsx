import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "../../context/AuthContext";
import type { Address } from "../../types/User";
import { MapPin, Plus, Edit, Trash, Check, X } from "lucide-react";
import toast from "react-hot-toast";

const AddressManager = () => {
  const { user, updateUserData } = useAuthContext();
  const { t } = useTranslation();
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const [newAddress, setNewAddress] = useState<Address>({
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: "",
    isDefault: false,
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setNewAddress((prev) => ({ ...prev, [name]: checked }));
    } else {
      setNewAddress((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!currentUser) return;

      // Validate required fields
      if (
        !newAddress.fullName ||
        !newAddress.addressLine1 ||
        !newAddress.city ||
        !newAddress.state ||
        !newAddress.postalCode ||
        !newAddress.country
      ) {
        toast.error(
          t("address.requiredFields") || "Please fill all required fields"
        );
        setIsSubmitting(false);
        return;
      }

      // Create a copy of the current user
      const updatedUser = { ...currentUser };

      // Ensure addresses array exists
      if (!updatedUser.addresses) {
        updatedUser.addresses = [];
      }

      // If this is the first address or set as default, update other addresses
      if (newAddress.isDefault || updatedUser.addresses.length === 0) {
        updatedUser.addresses = updatedUser.addresses.map((addr) => ({
          ...addr,
          isDefault: false,
        }));
        newAddress.isDefault = true;
      }

      // Add the new address without a temporary ID (MongoDB will generate one)
      updatedUser.addresses.push({ ...newAddress });

      // Update user data
      const result = await updateUserData(updatedUser);
      console.log(result);
      setCurrentUser(result); // Update local state with the returned user data
      toast.success(t("address.addSuccess") || "Address added successfully");

      // Reset form
      setNewAddress({
        fullName: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        phone: "",
        isDefault: false,
      });
      setIsAddingAddress(false);
    } catch (error) {
      console.error("Failed to add address:", error);
      toast.error(t("address.addError") || "Failed to add address");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!currentUser || !editingAddressId) return;

      // Validate required fields
      if (
        !newAddress.fullName ||
        !newAddress.addressLine1 ||
        !newAddress.city ||
        !newAddress.state ||
        !newAddress.postalCode ||
        !newAddress.country
      ) {
        toast.error(
          t("address.requiredFields") || "Please fill all required fields"
        );
        setIsSubmitting(false);
        return;
      }

      // Create a copy of the current user
      const updatedUser = { ...currentUser };

      // Ensure addresses array exists
      if (!updatedUser.addresses) {
        updatedUser.addresses = [];
      }

      // Find the address to update
      const addressIndex = updatedUser.addresses.findIndex(
        (addr) => addr._id === editingAddressId
      );

      if (addressIndex === -1) {
        toast.error(t("address.notFound") || "Address not found");
        setIsSubmitting(false);
        return;
      }

      // If setting as default, update other addresses
      if (newAddress.isDefault) {
        updatedUser.addresses = updatedUser.addresses.map((addr) => ({
          ...addr,
          isDefault: false,
        }));
      }

      // Update the address
      updatedUser.addresses[addressIndex] = {
        ...newAddress,
        _id: editingAddressId,
      };

      // If no address is default, set this one as default
      if (!updatedUser.addresses.some((addr) => addr.isDefault)) {
        updatedUser.addresses[addressIndex].isDefault = true;
      }

      // Update user data
      const result = await updateUserData(updatedUser);
      setCurrentUser(result); // Update local state with the returned user data
      toast.success(
        t("address.updateSuccess") || "Address updated successfully"
      );

      // Reset form
      setNewAddress({
        fullName: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        phone: "",
        isDefault: false,
      });
      setEditingAddressId(null);
    } catch (error) {
      console.error("Failed to update address:", error);
      toast.error(t("address.updateError") || "Failed to update address");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      if (!currentUser) return;

      // Create a copy of the current user
      const updatedUser = { ...currentUser };

      // Ensure addresses array exists
      if (!updatedUser.addresses) {
        return;
      }

      // Find the address to delete
      const addressIndex = updatedUser.addresses.findIndex(
        (addr) => addr._id === addressId
      );

      if (addressIndex === -1) {
        return;
      }

      // Check if deleting the default address
      const isDefault = updatedUser.addresses[addressIndex].isDefault;

      // Remove the address
      updatedUser.addresses.splice(addressIndex, 1);

      // If deleted address was default and there are other addresses, set a new default
      if (isDefault && updatedUser.addresses.length > 0) {
        updatedUser.addresses[0].isDefault = true;
      }

      // Update user data
      const result = await updateUserData(updatedUser);
      setCurrentUser(result); // Update local state with the returned user data
      toast.success(
        t("address.deleteSuccess") || "Address deleted successfully"
      );
    } catch (error) {
      console.error("Failed to delete address:", error);
      toast.error(t("address.deleteError") || "Failed to delete address");
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      if (!currentUser) return;

      // Create a copy of the current user
      const updatedUser = { ...currentUser };

      // Ensure addresses array exists
      if (!updatedUser.addresses) {
        return;
      }

      // Update all addresses to be non-default
      updatedUser.addresses = updatedUser.addresses.map((addr) => ({
        ...addr,
        isDefault: addr._id === addressId,
      }));

      // Update user data
      const result = await updateUserData(updatedUser);
      setCurrentUser(result); // Update local state with the returned user data
      toast.success(t("address.defaultSuccess") || "Default address updated");
    } catch (error) {
      console.error("Failed to set default address:", error);
      toast.error(t("address.defaultError") || "Failed to set default address");
    }
  };

  const startEditAddress = (address: Address) => {
    setNewAddress({ ...address });
    setEditingAddressId(address._id || null);
  };

  const cancelAddEdit = () => {
    setNewAddress({
      fullName: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      phone: "",
      isDefault: false,
    });
    setIsAddingAddress(false);
    setEditingAddressId(null);
  };

  if (!currentUser) {
    return <div>Loading address information...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Address List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MapPin className="text-amber-600" size={20} />
            <h3 className="text-lg font-semibold">
              {t("address.shippingAddresses")}
            </h3>
          </div>
          {!isAddingAddress && !editingAddressId && (
            <button
              type="button"
              onClick={() => setIsAddingAddress(true)}
              className="flex items-center gap-1 text-sm bg-amber-100 text-amber-700 px-3 py-1 rounded-md hover:bg-amber-200 transition-colors"
            >
              <Plus size={16} />
              {t("address.addNew")}
            </button>
          )}
        </div>

        <div className="p-6">
          {/* Address Form */}
          {(isAddingAddress || editingAddressId) && (
            <form
              onSubmit={editingAddressId ? handleEditAddress : handleAddAddress}
              className="mb-8 border border-gray-200 rounded-lg p-4"
            >
              <h4 className="text-lg font-medium mb-4">
                {editingAddressId
                  ? t("address.editAddress")
                  : t("address.addAddress")}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    className="block text-sm font-medium text-gray-700"
                    htmlFor="fullName"
                  >
                    {t("address.fullName")} *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={newAddress.fullName}
                    onChange={handleInputChange}
                    required
                    className="p-2 bg-white rounded-lg border border-gray-300 font-medium w-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="block text-sm font-medium text-gray-700"
                    htmlFor="phone"
                  >
                    {t("address.phone")}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={newAddress.phone || ""}
                    onChange={handleInputChange}
                    className="p-2 bg-white rounded-lg border border-gray-300 font-medium w-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label
                    className="block text-sm font-medium text-gray-700"
                    htmlFor="addressLine1"
                  >
                    {t("address.addressLine1")} *
                  </label>
                  <input
                    type="text"
                    id="addressLine1"
                    name="addressLine1"
                    value={newAddress.addressLine1}
                    onChange={handleInputChange}
                    required
                    className="p-2 bg-white rounded-lg border border-gray-300 font-medium w-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label
                    className="block text-sm font-medium text-gray-700"
                    htmlFor="addressLine2"
                  >
                    {t("address.addressLine2")}
                  </label>
                  <input
                    type="text"
                    id="addressLine2"
                    name="addressLine2"
                    value={newAddress.addressLine2 || ""}
                    onChange={handleInputChange}
                    className="p-2 bg-white rounded-lg border border-gray-300 font-medium w-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="block text-sm font-medium text-gray-700"
                    htmlFor="city"
                  >
                    {t("address.city")} *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={newAddress.city}
                    onChange={handleInputChange}
                    required
                    className="p-2 bg-white rounded-lg border border-gray-300 font-medium w-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="block text-sm font-medium text-gray-700"
                    htmlFor="state"
                  >
                    {t("address.state")} *
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={newAddress.state}
                    onChange={handleInputChange}
                    required
                    className="p-2 bg-white rounded-lg border border-gray-300 font-medium w-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="block text-sm font-medium text-gray-700"
                    htmlFor="postalCode"
                  >
                    {t("address.postalCode")} *
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={newAddress.postalCode}
                    onChange={handleInputChange}
                    required
                    className="p-2 bg-white rounded-lg border border-gray-300 font-medium w-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="block text-sm font-medium text-gray-700"
                    htmlFor="country"
                  >
                    {t("address.country")} *
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={newAddress.country}
                    onChange={handleInputChange}
                    required
                    className="p-2 bg-white rounded-lg border border-gray-300 font-medium w-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2 flex items-center mt-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    name="isDefault"
                    checked={newAddress.isDefault}
                    onChange={handleInputChange}
                    className="w-4 h-4 mr-2 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                  />
                  <label htmlFor="isDefault" className="text-sm">
                    {t("address.setAsDefault")}
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={cancelAddEdit}
                  className="flex items-center gap-1 text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <X size={16} />
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1 text-sm bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors"
                  disabled={isSubmitting}
                >
                  <Check size={16} />
                  {isSubmitting
                    ? t("common.saving")
                    : editingAddressId
                    ? t("common.update")
                    : t("common.save")}
                </button>
              </div>
            </form>
          )}

          {/* Address Cards */}
          {currentUser.addresses && currentUser.addresses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentUser.addresses.map((address) => (
                <div
                  key={address._id}
                  className={`border rounded-lg p-4 ${
                    address.isDefault
                      ? "border-amber-500 bg-amber-50"
                      : "border-gray-200"
                  }`}
                >
                  {address.isDefault && (
                    <div className="mb-2 text-xs font-medium text-amber-600 bg-amber-100 inline-block px-2 py-1 rounded">
                      {t("address.default")}
                    </div>
                  )}
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

                  <div className="mt-4 flex gap-2">
                    {!address.isDefault && (
                      <button
                        onClick={() =>
                          address._id && handleSetDefaultAddress(address._id)
                        }
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                      >
                        {t("address.setDefault")}
                      </button>
                    )}
                    <button
                      onClick={() => startEditAddress(address)}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors flex items-center gap-1"
                    >
                      <Edit size={12} />
                      {t("common.edit")}
                    </button>
                    <button
                      onClick={() =>
                        address._id && handleDeleteAddress(address._id)
                      }
                      className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors flex items-center gap-1"
                    >
                      <Trash size={12} />
                      {t("common.delete")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t("address.noAddresses")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressManager;
