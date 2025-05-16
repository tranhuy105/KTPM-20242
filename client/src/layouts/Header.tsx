import { Link } from "react-router-dom";
import { FaSearch, FaShoppingCart, FaUserAlt } from "react-icons/fa";
import { useAuthContext } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const Header = () => {
  const { isAuthenticated } = useAuthContext();
  const { t } = useTranslation();

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto">
        {/* Top Banner */}
        {!isAuthenticated && (
          <div className="bg-black text-white text-xs text-center py-1 px-2">
            {t("header.promoText")}{" "}
            <Link to="/auth" className="underline">
              {t("header.signUpNow")}
            </Link>
          </div>
        )}

        {/* Main Header */}
        <div className="flex justify-between items-center py-4 px-4">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold tracking-wider">
            NHOM2
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-black hover:text-gray-600 font-medium">
              {t("header.shop")}
            </Link>
            <Link
              to="/products"
              className="text-black hover:text-gray-600 font-medium"
            >
              {t("header.products")}
            </Link>
            <Link
              to="/categories"
              className="text-black hover:text-gray-600 font-medium"
            >
              {t("header.categories")}
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center relative bg-gray-100 rounded-full px-4 py-2 flex-grow max-w-md mx-4">
            <FaSearch className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder={t("header.searchPlaceholder")}
              className="bg-transparent outline-none w-full text-sm"
            />
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            <Link to="/cart" className="relative">
              <FaShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                0
              </span>
            </Link>
            {isAuthenticated ? (
              <Link to="/profile" className="hidden md:block">
                <FaUserAlt className="h-5 w-5" />
              </Link>
            ) : (
              <Link to="/auth" className="hidden md:block">
                <FaUserAlt className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
