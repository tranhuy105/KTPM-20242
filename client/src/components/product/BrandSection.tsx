import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Brand } from "../../types";
import { ExternalLink, Shield, Award, CheckCircle } from "lucide-react";

interface BrandSectionProps {
  brand: string | Brand | { _id: string; name: string } | undefined;
  brandName?: string;
}

const BrandSection = ({ brand, brandName }: BrandSectionProps) => {
  const { t } = useTranslation();

  // If there's no brand data at all, don't render the component
  if (!brand && !brandName) {
    return null;
  }

  // Extract brand information based on type
  const brandInfo = {
    name: "",
    logo: "",
    description: "",
    website: "",
    slug: "",
    _id: "",
  };

  if (typeof brand === "string") {
    // If brand is just a string ID
    brandInfo.name = brandName || "";
    brandInfo._id = brand;
  } else if (brand && typeof brand === "object") {
    // If brand is a complete object
    const fullBrand = brand as Brand;
    brandInfo.name = fullBrand.name || brandName || "";
    brandInfo.logo = fullBrand.logo || "";
    brandInfo.description = fullBrand.description || "";
    brandInfo.website = fullBrand.website || "";
    brandInfo.slug = fullBrand.slug || "";
    brandInfo._id = fullBrand._id || "";
  } else if (brandName) {
    // If we only have brandName
    brandInfo.name = brandName;
  }

  // If we still don't have a brand name, don't render
  if (!brandInfo.name) {
    return null;
  }

  // Function to get brand initials for logo fallback
  const getBrandInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Generate placeholder description if none exists
  const getDescription = () => {
    if (brandInfo.description) return brandInfo.description;
    return `${brandInfo.name} is a prestigious luxury brand known for exceptional craftsmanship and timeless elegance. Each product represents the pinnacle of quality and design excellence.`;
  };

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden mb-24">
      {/* Brand header with gradient background */}
      <div className="bg-gradient-to-r from-amber-800 to-amber-600 p-8 relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          {/* Brand logo or initials */}
          <div className="w-28 h-28 bg-white rounded-full p-2 shadow-lg flex-shrink-0 flex items-center justify-center">
            {brandInfo.logo ? (
              <img
                src={brandInfo.logo}
                alt={brandInfo.name}
                className="max-w-full max-h-full object-contain p-2"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white text-4xl font-bold">
                {getBrandInitials(brandInfo.name)}
              </div>
            )}
          </div>

          {/* Brand title */}
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-serif font-medium text-white mb-2">
              {brandInfo.name}
            </h2>
            <div className="flex items-center justify-center md:justify-start gap-4 text-amber-200 text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                <span>{t("products.authentic")}</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                <span>{t("products.officialDealer")}</span>
              </div>
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4" />
                <span>{t("products.luxuryCollection")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brand details */}
      <div className="p-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Brand description */}
          <div className="flex-1">
            <h3 className="text-xl font-medium text-gray-900 mb-4 border-b border-amber-200 pb-2">
              {t("products.aboutBrand")}
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              {getDescription()}
            </p>

            <div className="flex flex-wrap gap-4 mt-6">
              {brandInfo._id && (
                <Link
                  to={`/products?brand=${brandInfo._id}`}
                  className="inline-flex items-center bg-amber-100 hover:bg-amber-200 text-amber-800 px-5 py-2.5 rounded-md transition-colors font-medium"
                >
                  {t("products.viewAllBrandProducts")}
                </Link>
              )}

              {brandInfo.website && (
                <a
                  href={brandInfo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-2.5 rounded-md transition-colors font-medium"
                >
                  {t("common.visitWebsite")}
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Brand facts */}
          <div className="w-full md:w-64 flex-shrink-0 bg-amber-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-amber-800 mb-4 border-b border-amber-200 pb-2">
              {t("products.brandHighlights")}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="inline-block w-2 h-2 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></span>
                <span className="text-gray-600 text-sm">
                  {t("products.luxuryMaterials")}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="inline-block w-2 h-2 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></span>
                <span className="text-gray-600 text-sm">
                  {t("products.worldwideShipping")}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="inline-block w-2 h-2 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></span>
                <span className="text-gray-600 text-sm">
                  {t("products.authenticGuarantee")}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="inline-block w-2 h-2 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></span>
                <span className="text-gray-600 text-sm">
                  {t("products.exclusiveDesigns")}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 bg-gray-50 px-8 py-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 italic">
            {t("products.officialBrand")}
          </span>

          {brandInfo.slug && (
            <Link
              to={`/brands/${brandInfo.slug}`}
              className="text-amber-700 hover:text-amber-800 text-sm font-medium"
            >
              {t("common.learnMore")}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandSection;
