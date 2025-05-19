import { Link } from "react-router-dom";
import { Search, ShoppingCart, User } from "lucide-react";
import { useAuthContext } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { useState } from "react";

const Header = () => {
  const { isAuthenticated } = useAuthContext();
  const { t } = useTranslation();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto">
        {/* Top Banner */}
        {!isAuthenticated && (
          <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-gray-200 text-xs text-center py-2 px-4">
            <span className="tracking-wider">{t("header.promoText")}</span>{" "}
            <Link
              to="/auth"
              className="text-amber-400 hover:text-amber-300 transition-colors duration-300 border-b border-amber-400 pb-px"
            >
              {t("header.signUpNow")}
            </Link>
          </div>
        )}

        {/* Main Header */}
        <div className="relative px-4 py-6">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="relative z-10">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-serif tracking-widest text-gray-900">
                  NHOM2
                </span>
                <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-500 to-transparent mt-1"></div>
                <span className="text-xs tracking-widest text-gray-500 mt-1">
                  LUXURY BOUTIQUE
                </span>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-10">
              <Link
                to="/"
                className="text-gray-800 hover:text-amber-600 font-medium tracking-wide text-sm uppercase transition-colors duration-300"
              >
                {t("header.shop")}
              </Link>
              <Link
                to="/products"
                className="text-gray-800 hover:text-amber-600 font-medium tracking-wide text-sm uppercase transition-colors duration-300"
              >
                {t("header.products")}
              </Link>
              <Link
                to="#"
                className="text-gray-800 hover:text-amber-600 font-medium tracking-wide text-sm uppercase transition-colors duration-300"
              >
                {t("header.aboutus")}
              </Link>
            </nav>

            {/* Search Bar */}
            <div
              className={`hidden md:flex items-center relative transition-all duration-300 ${
                isSearchFocused
                  ? "bg-white border-b-2 border-amber-500 rounded-none px-4 py-2"
                  : "bg-gray-50 border border-gray-200 rounded-full px-4 py-2"
              } flex-grow max-w-md mx-6`}
            >
              <Search
                className={`${
                  isSearchFocused ? "text-amber-500" : "text-gray-400"
                } mr-2 h-4 w-4`}
              />
              <input
                type="text"
                placeholder={t("header.searchPlaceholder")}
                className="bg-transparent outline-none w-full text-sm"
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
            </div>

            {/* Icons */}
            <div className="flex items-center space-x-6">
              <Link to="/cart" className="relative group">
                <div className="p-2 rounded-full bg-gray-50 group-hover:bg-amber-50 transition-colors duration-300">
                  <ShoppingCart className="h-5 w-5 text-gray-700 group-hover:text-amber-600 transition-colors duration-300" />
                </div>
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  0
                </span>
              </Link>

              {isAuthenticated ? (
                <Link to="/profile" className="hidden md:block group">
                  <div className="p-2 rounded-full bg-gray-50 group-hover:bg-amber-50 transition-colors duration-300">
                    <User className="h-5 w-5 text-gray-700 group-hover:text-amber-600 transition-colors duration-300" />
                  </div>
                </Link>
              ) : (
                <Link to="/auth" className="hidden md:block">
                  <button className="px-4 py-2 border border-amber-500 text-amber-600 hover:bg-amber-50 text-xs uppercase tracking-widest transition-colors duration-300">
                    {t("header.signIn")}
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Optional Second Navigation Bar for categories */}
        {/* <div className="hidden md:block border-t border-gray-100">
          <div className="flex justify-center space-x-8 py-3 px-4 text-center">
            <Link
              to="/new-arrivals"
              className="text-gray-600 hover:text-amber-600 text-xs tracking-widest uppercase transition-colors duration-300"
            >
              New Arrivals
            </Link>
            <Link
              to="/bestsellers"
              className="text-gray-600 hover:text-amber-600 text-xs tracking-widest uppercase transition-colors duration-300"
            >
              Bestsellers
            </Link>
            <Link
              to="/collections"
              className="text-gray-600 hover:text-amber-600 text-xs tracking-widest uppercase transition-colors duration-300"
            >
              Collections
            </Link>
            <Link
              to="/exclusives"
              className="text-gray-600 hover:text-amber-600 text-xs tracking-widest uppercase transition-colors duration-300"
            >
              Exclusives
            </Link>
            <Link
              to="/gifts"
              className="text-gray-600 hover:text-amber-600 text-xs tracking-widest uppercase transition-colors duration-300"
            >
              Gifts
            </Link>
          </div>
        </div> */}
      </div>
    </header>
  );
};

export default Header;
