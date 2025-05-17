import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface ProductDescriptionProps {
  description: string;
}

const ProductDescription = ({ description }: ProductDescriptionProps) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  // Split description into paragraphs
  const paragraphs = description.split("\n").filter((p) => p.trim().length > 0);

  // Decide what content to show based on expanded state
  const contentToShow = isExpanded ? paragraphs : paragraphs.slice(0, 2);

  // Determine if there's more content to show
  const hasMoreContent = paragraphs.length > 2;

  // Mock data for other tabs
  const specifications = [
    { name: "Material", value: "Premium leather" },
    { name: "Dimensions", value: '12" x 8" x 4"' },
    { name: "Weight", value: "1.2 kg" },
    { name: "Country of Origin", value: "Italy" },
    {
      name: "Care Instructions",
      value: "Wipe with damp cloth, avoid direct sunlight",
    },
  ];

  const shippingInfo = [
    "Free shipping on all orders over $100",
    "Express shipping available (2-3 business days)",
    "Standard shipping (5-7 business days)",
    "International shipping available to select countries",
    "All orders are fully insured",
  ];

  useEffect(() => {
    // Reset expanded state when tab changes
    setIsExpanded(false);
  }, [activeTab]);

  return (
    <div className="product-description">
      {/* Elegant tab navigation */}
      <div className="border-b border-amber-200 mb-8">
        <div className="flex flex-wrap -mb-px">
          <button
            onClick={() => setActiveTab("description")}
            className={`inline-block py-4 px-6 text-sm font-medium tracking-wider transition-colors relative ${
              activeTab === "description"
                ? "text-amber-800 border-b-2 border-amber-600"
                : "text-gray-500 hover:text-amber-600"
            }`}
          >
            {t("products.description")}
            {activeTab === "description" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-400 to-amber-600"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("specifications")}
            className={`inline-block py-4 px-6 text-sm font-medium tracking-wider transition-colors relative ${
              activeTab === "specifications"
                ? "text-amber-800 border-b-2 border-amber-600"
                : "text-gray-500 hover:text-amber-600"
            }`}
          >
            {t("products.specifications")}
            {activeTab === "specifications" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-400 to-amber-600"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("shipping")}
            className={`inline-block py-4 px-6 text-sm font-medium tracking-wider transition-colors relative ${
              activeTab === "shipping"
                ? "text-amber-800 border-b-2 border-amber-600"
                : "text-gray-500 hover:text-amber-600"
            }`}
          >
            {t("products.shipping")}
            {activeTab === "shipping" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-400 to-amber-600"></span>
            )}
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="tab-content">
        {/* Description Tab */}
        {activeTab === "description" && (
          <div className="animate-fade-in">
            <div
              className={`prose prose-amber prose-lg max-w-none leading-relaxed ${
                !isExpanded && hasMoreContent
                  ? "relative overflow-hidden max-h-64"
                  : ""
              }`}
            >
              {contentToShow.map((paragraph, index) => (
                <p
                  key={index}
                  className="mb-6 text-gray-700 first-letter:text-2xl first-letter:font-serif first-letter:font-semibold first-letter:text-amber-800"
                >
                  {paragraph}
                </p>
              ))}

              {hasMoreContent && !isExpanded && (
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
              )}
            </div>

            {hasMoreContent && (
              <div className="mt-6 mb-4 text-center">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="inline-flex items-center justify-center px-6 py-2 border border-amber-300 rounded-full font-medium text-amber-800 hover:bg-amber-50 transition-colors duration-300 shadow-sm hover:shadow-md group"
                >
                  <span>
                    {isExpanded
                      ? t("products.showLess")
                      : t("products.readMore")}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`ml-2 w-4 h-4 transform group-hover:translate-y-0.5 transition-transform ${
                      isExpanded
                        ? "rotate-180 group-hover:-translate-y-0.5"
                        : ""
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Specifications Tab */}
        {activeTab === "specifications" && (
          <div className="animate-fade-in">
            <div className="bg-gradient-to-br from-amber-50 to-white p-6 rounded-lg shadow-sm">
              <table className="w-full">
                <tbody>
                  {specifications.map((spec, index) => (
                    <tr
                      key={index}
                      className={
                        index !== specifications.length - 1
                          ? "border-b border-amber-100"
                          : ""
                      }
                    >
                      <td className="py-4 font-medium text-gray-700 w-1/3">
                        {spec.name}
                      </td>
                      <td className="py-4 text-gray-600">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Shipping Tab */}
        {activeTab === "shipping" && (
          <div className="animate-fade-in">
            <div className="bg-gradient-to-br from-amber-50 to-white p-6 rounded-lg shadow-sm">
              <ul className="space-y-4">
                {shippingInfo.map((info, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="h-5 w-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-700">{info}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 p-4 border border-amber-200 rounded-lg bg-amber-50">
                <div className="flex items-center text-amber-800">
                  <svg
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-medium">Important Note</span>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Delivery times may vary during peak seasons and holidays. For
                  international orders, customs duties and taxes may apply.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Decorative footer */}
      <div className="mt-12 pt-6 border-t border-amber-100 text-right text-sm text-amber-800 italic">
        &mdash; {t("products.luxuryExperience")}
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ProductDescription;
