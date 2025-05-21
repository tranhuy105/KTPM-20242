import { useAuthContext } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { Link, Outlet, useLocation } from "react-router-dom";

const ProfilePage = () => {
  const { user } = useAuthContext();
  const { t } = useTranslation();
  const location = useLocation();

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
            <Link
              to="/profile"
              className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                location.pathname === "/profile"
                  ? "border-amber-600 text-amber-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {t("profile.profile")}
            </Link>
            <Link
              to="/profile/wishlist"
              className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                location.pathname === "/profile/wishlist"
                  ? "border-amber-600 text-amber-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {t("profile.wishlist")}
            </Link>
            <Link
              to="/profile/orders"
              className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                location.pathname === "/profile/orders"
                  ? "border-amber-600 text-amber-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {t("profile.orders")}
            </Link>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
