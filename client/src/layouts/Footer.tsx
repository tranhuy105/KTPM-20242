import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/common/LanguageSwitcher";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-white pt-12 pb-8 border-t">
      <div className="container mx-auto px-4">
        {/* Newsletter Subscription */}
        <div className="bg-black text-white py-8 px-6 rounded-lg mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl md:text-2xl font-bold mb-1">
                {t("footer.newsletter.title1")}
              </h3>
              <h3 className="text-xl md:text-2xl font-bold">
                {t("footer.newsletter.title2")}
              </h3>
            </div>
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full md:w-auto">
              <input
                type="email"
                placeholder={t("footer.newsletter.emailPlaceholder")}
                className="px-4 py-2 rounded-full bg-white text-black outline-none w-full md:w-64"
              />
              <button className="bg-white text-black px-6 py-2 rounded-full font-medium">
                {t("footer.newsletter.subscribeButton")}
              </button>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div>
            <Link
              to="/"
              className="text-xl font-bold tracking-wider mb-4 block"
            >
              NHOM2
            </Link>
            <p className="text-gray-600 text-sm mb-4">
              {t("footer.brandText")}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-black">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-black">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-black">
                <FaInstagram size={20} />
              </a>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-sm mb-4 uppercase">
              {t("footer.company.title")}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-600 hover:text-black">
                  {t("footer.company.about")}
                </Link>
              </li>
              <li>
                <Link to="/features" className="text-gray-600 hover:text-black">
                  {t("footer.company.features")}
                </Link>
              </li>
              <li>
                <Link to="/works" className="text-gray-600 hover:text-black">
                  {t("footer.company.works")}
                </Link>
              </li>
              <li>
                <Link to="/career" className="text-gray-600 hover:text-black">
                  {t("footer.company.career")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-bold text-sm mb-4 uppercase">
              {t("footer.help.title")}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/support" className="text-gray-600 hover:text-black">
                  {t("footer.help.customerSupport")}
                </Link>
              </li>
              <li>
                <Link to="/delivery" className="text-gray-600 hover:text-black">
                  {t("footer.help.deliveryDetails")}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-black">
                  {t("footer.help.termsAndConditions")}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-black">
                  {t("footer.help.privacyPolicy")}
                </Link>
              </li>
            </ul>
          </div>

          {/* FAQ */}
          <div>
            <h4 className="font-bold text-sm mb-4 uppercase">
              {t("footer.faq.title")}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/account" className="text-gray-600 hover:text-black">
                  {t("footer.faq.account")}
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-600 hover:text-black">
                  {t("footer.faq.manageDeliveries")}
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-gray-600 hover:text-black">
                  {t("footer.faq.orders")}
                </Link>
              </li>
              <li>
                <Link to="/payments" className="text-gray-600 hover:text-black">
                  {t("footer.faq.payments")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright & Payment Methods */}
        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <p className="text-sm text-gray-600 mb-4 md:mb-0">
              {t("footer.copyright", { year: new Date().getFullYear() })}
            </p>

            <div className="flex items-center mb-4 md:mb-0">
              <span className="text-sm text-gray-600 mr-2">
                {t("footer.language")}:
              </span>
              <LanguageSwitcher />
            </div>
          </div>

          <div className="flex space-x-3">
            <img src="/images/visa.png" alt="Visa" className="h-6" />
            <img
              src="/images/mastercard.png"
              alt="Mastercard"
              className="h-6"
            />
            <img src="/images/paypal.png" alt="PayPal" className="h-6" />
            <img src="/images/applepay.png" alt="Apple Pay" className="h-6" />
            <img src="/images/googlepay.png" alt="Google Pay" className="h-6" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
