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
} from "lucide-react";

const ProfileInfoPage = () => {
  const { user, logout } = useAuthContext();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return <div>Loading profile information...</div>;
  }

  return (
    <>
      {/* Account Summary Card */}
      <div className="mb-8 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="bg-amber-600 text-white rounded-full p-6 shadow-md">
            <User size={48} />
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

      {/* Account Information Card */}
      <div className="mb-8 bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
          <User className="text-amber-600" size={20} />
          <h3 className="text-lg font-semibold">
            {t("profile.accountInformation")}
          </h3>
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
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t("profile.email")}
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 font-medium">
                {user.email}
              </div>
            </div>
            {user.fullName && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t("profile.fullName")}
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 font-medium">
                  {user.fullName}
                </div>
              </div>
            )}
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
      {user.preferences && (
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
                <label className="block text-sm font-medium text-gray-700">
                  {t("profile.language")}
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 font-medium">
                  {user.preferences.language || "Tiếng Việt"}
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t("profile.currency")}
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 font-medium">
                  {user.preferences.currency || "VND"}
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("profile.notifications")}
                </label>
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <div
                      className={`w-4 h-4 rounded-full mr-2 ${
                        user.preferences.notifications?.email
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    <span>
                      {user.preferences.notifications?.email
                        ? t("profile.emailNotificationsEnabled")
                        : t("profile.emailNotificationsDisabled")}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div
                      className={`w-4 h-4 rounded-full mr-2 ${
                        user.preferences.notifications?.marketing
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    <span>
                      {user.preferences.notifications?.marketing
                        ? t("profile.marketingEmailsEnabled")
                        : t("profile.marketingEmailsDisabled")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
