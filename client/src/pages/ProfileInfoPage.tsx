import { useAuthContext } from "../context/AuthContext";
import { formatCurrencyVND } from "../lib/utils";
import { useTranslation } from "react-i18next";
import {
  User,
  Settings,
  LogOut,
  Calendar,
  Mail,
  UserCheck,
  Edit,
  Save,
  X,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const ProfileInfoPage = () => {
  const { user, logout, updateUserData } = useAuthContext();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    language: user?.preferences?.language || "vn",
    currency: user?.preferences?.currency || "VND",
    emailNotifications: user?.preferences?.notifications?.email || false,
    marketingEmails: user?.preferences?.notifications?.marketing || false,
  });

  const handleLogout = () => {
    logout();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user) return;

      // Create a complete copy of the current user
      const updatedUser = { ...user };

      // Update the specific fields
      updatedUser.firstName = formData.firstName;
      updatedUser.lastName = formData.lastName;

      // Ensure preferences object exists
      if (!updatedUser.preferences) {
        updatedUser.preferences = {};
      }

      // Update preferences
      updatedUser.preferences = {
        ...updatedUser.preferences,
        language: formData.language,
        currency: formData.currency,
        notifications: {
          ...updatedUser.preferences.notifications,
          email: formData.emailNotifications,
          marketing: formData.marketingEmails,
        },
      };

      // Update user data
      await updateUserData(updatedUser);
      toast.success(
        t("profile.updateSuccess") || "Profile updated successfully"
      );
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error(t("profile.updateError") || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to current user data
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      language: user?.preferences?.language || "vn",
      currency: user?.preferences?.currency || "VND",
      emailNotifications: user?.preferences?.notifications?.email || false,
      marketingEmails: user?.preferences?.notifications?.marketing || false,
    });
    setIsEditing(false);
  };

  if (!user) {
    return <div>Loading profile information...</div>;
  }

  return (
    <>
      {/* Account Summary Card */}
      <div className="mb-8 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="m-6 text-white rounded-full shadow-md">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="Avatar"
                className="w-24 h-24 rounded-full"
              />
            ) : (
              <User size={48} className="text-amber-600" />
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold mb-1">
              {user.fullName || user.username}
            </h2>
            <p className="text-gray-600 flex items-center justify-center md:justify-start gap-1 mb-2">
              <Mail size={16} className="text-amber-600" />
              {user.email}
            </p>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-3">
              <span className="bg-amber-600 text-white text-xs px-3 py-1 rounded-full">
                {user.role || t("profile.customer")}
              </span>
              {user.isAdmin && (
                <span className="bg-black text-white text-xs px-3 py-1 rounded-full">
                  Admin
                </span>
              )}
              {user.isVerified && (
                <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                  <UserCheck size={12} />
                  {t("profile.verified")}
                </span>
              )}
              <span className="bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                <Calendar size={12} />
                {t("profile.memberSince")}:{" "}
                {new Date(user.createdAt || "").toLocaleDateString()}
              </span>
            </div>
          </div>
          {user.customerData && (
            <div className="bg-white rounded-lg shadow-sm p-4 min-w-[180px] text-center">
              <div className="mb-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  {t("profile.totalOrders")}
                </p>
                <p className="text-2xl font-bold text-amber-600">
                  {user.customerData.orderCount || 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  {t("profile.totalSpent")}
                </p>
                <p className="text-lg font-semibold">
                  {formatCurrencyVND(user.customerData.totalSpent || 0)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Account Information Card */}
        <div className="mb-8 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <User className="text-amber-600" size={20} />
              <h3 className="text-lg font-semibold">
                {t("profile.accountInformation")}
              </h3>
            </div>
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 text-sm bg-amber-100 text-amber-700 px-3 py-1 rounded-md hover:bg-amber-200 transition-colors"
              >
                <Edit size={16} />
                {t("profile.edit") || "Edit"}
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-1 text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-200 transition-colors"
                  disabled={isSubmitting}
                >
                  <X size={16} />
                  {t("common.cancel") || "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1 text-sm bg-green-100 text-green-700 px-3 py-1 rounded-md hover:bg-green-200 transition-colors"
                  disabled={isSubmitting}
                >
                  <Save size={16} />
                  {isSubmitting
                    ? t("common.saving") || "Saving..."
                    : t("common.save") || "Save"}
                </button>
              </div>
            )}
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t("profile.username")}
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 font-medium">
                  {user.username}
                </div>
                <p className="text-xs text-gray-500">
                  {t("profile.usernameCannotBeChanged") ||
                    "Username cannot be changed"}
                </p>
              </div>
              <div className="space-y-2">
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="email"
                >
                  {t("profile.email")}
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 font-medium">
                  {user.email}
                </div>
                <p className="text-xs text-gray-500">
                  {t("profile.emailCannotBeChanged") ||
                    "Email cannot be changed"}
                </p>
              </div>
              <div className="space-y-2">
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="firstName"
                >
                  {t("profile.firstName") || "First Name"}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="p-3 bg-white rounded-lg border border-gray-300 font-medium w-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 font-medium">
                    {user.firstName || "-"}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="lastName"
                >
                  {t("profile.lastName") || "Last Name"}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="p-3 bg-white rounded-lg border border-gray-300 font-medium w-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 font-medium">
                    {user.lastName || "-"}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t("profile.status")}
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 font-medium flex items-center">
                  <span
                    className={`inline-block w-3 h-3 rounded-full mr-2 ${
                      user.isActive ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></span>
                  {user.isActive ? t("profile.active") : t("profile.inactive")}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences Card */}
        <div className="mb-8 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
            <Settings className="text-amber-600" size={20} />
            <h3 className="text-lg font-semibold">
              {t("profile.preferences")}
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="language"
                >
                  {t("profile.language")}
                </label>
                {isEditing ? (
                  <select
                    id="language"
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    className="p-3 bg-white rounded-lg border border-gray-300 font-medium w-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="vn">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 font-medium">
                    {user.preferences?.language === "en"
                      ? "English"
                      : "Tiếng Việt"}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="currency"
                >
                  {t("profile.currency")}
                </label>
                {isEditing ? (
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="p-3 bg-white rounded-lg border border-gray-300 font-medium w-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="VND">VND</option>
                    <option value="USD">USD</option>
                  </select>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 font-medium">
                    {user.preferences?.currency || "VND"}
                  </div>
                )}
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("profile.notifications")}
                </label>
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  {isEditing ? (
                    <>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="emailNotifications"
                          name="emailNotifications"
                          checked={formData.emailNotifications}
                          onChange={handleInputChange}
                          className="w-4 h-4 mr-2 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                        />
                        <label htmlFor="emailNotifications">
                          {t("profile.emailNotificationsEnabled")}
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="marketingEmails"
                          name="marketingEmails"
                          checked={formData.marketingEmails}
                          onChange={handleInputChange}
                          className="w-4 h-4 mr-2 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                        />
                        <label htmlFor="marketingEmails">
                          {t("profile.marketingEmailsEnabled")}
                        </label>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center">
                        <div
                          className={`w-4 h-4 rounded-full mr-2 ${
                            user.preferences?.notifications?.email
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        ></div>
                        <span>
                          {user.preferences?.notifications?.email
                            ? t("profile.emailNotificationsEnabled")
                            : t("profile.emailNotificationsDisabled")}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div
                          className={`w-4 h-4 rounded-full mr-2 ${
                            user.preferences?.notifications?.marketing
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        ></div>
                        <span>
                          {user.preferences?.notifications?.marketing
                            ? t("profile.marketingEmailsEnabled")
                            : t("profile.marketingEmailsDisabled")}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Logout Button */}
      <div className="border-t border-gray-200 pt-6 flex justify-end">
        <button
          onClick={handleLogout}
          className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <LogOut size={18} />
          {t("profile.logout")}
        </button>
      </div>
    </>
  );
};

export default ProfileInfoPage;
