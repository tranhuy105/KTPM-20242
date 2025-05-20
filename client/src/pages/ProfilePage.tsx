import { useAuthContext } from "../context/AuthContext";
import { useState } from "react";
import WishlistSection from "../components/profile/WishlistSection";
import OrdersSection from "../components/profile/OrdersSection";
import { formatCurrencyVND } from "../lib/utils";
import { useTranslation } from "react-i18next";

const ProfilePage = () => {
  const { user, logout } = useAuthContext();
  const [activeTab, setActiveTab] = useState("profile");
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    // No need to redirect, ProtectedRoute will handle it
  };

  if (!user) {
    return <div>Loading profile information...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="bg-black text-white p-6">
          <h1 className="text-2xl font-bold mb-2">{t("profile.myAccount")}</h1>
          <p className="text-gray-300">
            {t("profile.manageAccountInfoAndOrders")}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "profile"
                  ? "border-amber-600 text-amber-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {t("profile.profile")}
            </button>
            <button
              onClick={() => setActiveTab("wishlist")}
              className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "wishlist"
                  ? "border-amber-600 text-amber-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {t("profile.wishlist")}
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "orders"
                  ? "border-amber-600 text-amber-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {t("profile.orders")}
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "profile" && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">
                  {t("profile.accountInformation")}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      {t("profile.username")}
                    </label>
                    <div className="p-3 bg-gray-100 rounded-lg">
                      {user.username}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      {t("profile.email")}
                    </label>
                    <div className="p-3 bg-gray-100 rounded-lg">
                      {user.email}
                    </div>
                  </div>
                  {user.fullName && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        {t("profile.fullName")}
                      </label>
                      <div className="p-3 bg-gray-100 rounded-lg">
                        {user.fullName}
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      {t("profile.role")}
                    </label>
                    <div className="p-3 bg-gray-100 rounded-lg capitalize">
                      {user.role || t("profile.customer")}
                      {user.isAdmin && " (Admin)"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      {t("profile.memberSince")}
                    </label>
                    <div className="p-3 bg-gray-100 rounded-lg">
                      {new Date(user.createdAt || "").toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      {t("profile.status")}
                    </label>
                    <div className="p-3 bg-gray-100 rounded-lg flex items-center">
                      <span
                        className={`inline-block w-2 h-2 rounded-full mr-2 ${
                          user.isActive ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></span>
                      {user.isActive
                        ? t("profile.active")
                        : t("profile.inactive")}
                      {user.isVerified && ", " + t("profile.verified")}
                    </div>
                  </div>
                </div>
              </div>

              {user.preferences && (
                <div className="mb-6 border-t pt-6">
                  <h2 className="text-xl font-semibold mb-4">
                    {t("profile.preferences")}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        {t("profile.language")}
                      </label>
                      <div className="p-3 bg-gray-100 rounded-lg">
                        {user.preferences.language || "Tiếng Việt"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        {t("profile.currency")}
                      </label>
                      <div className="p-3 bg-gray-100 rounded-lg">
                        {user.preferences.currency || "VND"}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        {t("profile.notifications")}
                      </label>
                      <div className="p-3 bg-gray-100 rounded-lg">
                        {user.preferences.notifications?.email
                          ? t("profile.emailNotificationsEnabled")
                          : t("profile.emailNotificationsDisabled")}
                        <br />
                        {user.preferences.notifications?.marketing
                          ? t("profile.marketingEmailsEnabled")
                          : t("profile.marketingEmailsDisabled")}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {user.customerData && (
                <div className="mb-6 border-t pt-6">
                  <h2 className="text-xl font-semibold mb-4">
                    {t("profile.customerInformation")}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        {t("profile.totalOrders")}
                      </label>
                      <div className="p-3 bg-gray-100 rounded-lg">
                        {user.customerData.orderCount || 0}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        {t("profile.totalSpent")}
                      </label>
                      <div className="p-3 bg-gray-100 rounded-lg">
                        {formatCurrencyVND(user.customerData.totalSpent || 0)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t pt-6">
                <button
                  onClick={handleLogout}
                  className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  {t("profile.logout")}
                </button>
              </div>
            </>
          )}

          {activeTab === "wishlist" && <WishlistSection />}
          {activeTab === "orders" && <OrdersSection />}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
