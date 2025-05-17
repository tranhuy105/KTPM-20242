import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { ProductVariant } from "../../types";

interface ProductVariantSelectorProps {
  variants: ProductVariant[];
  selectedVariantId: string | null;
  onVariantChange: (variantId: string) => void;
}

const ProductVariantSelector = ({
  variants,
  selectedVariantId,
  onVariantChange,
}: ProductVariantSelectorProps) => {
  const { t } = useTranslation();

  // Extract unique attribute types and values from variants
  const attributeOptions = useMemo(() => {
    const attributes: Record<string, Set<string>> = {};

    variants.forEach((variant) => {
      Object.entries(variant.attributes).forEach(([key, value]) => {
        if (!attributes[key]) {
          attributes[key] = new Set();
        }
        attributes[key].add(value);
      });
    });

    return Object.entries(attributes).map(([key, values]) => ({
      name: key,
      values: Array.from(values),
    }));
  }, [variants]);

  // Get selected attribute values from current variant
  const selectedAttributeValues = useMemo(() => {
    if (!selectedVariantId) return {};

    const selectedVariant = variants.find((v) => v._id === selectedVariantId);
    if (!selectedVariant) return {};

    return selectedVariant.attributes;
  }, [variants, selectedVariantId]);

  // Find a variant with specific attribute values
  const findVariantByAttributes = (attributeValues: Record<string, string>) => {
    const attributeKeys = Object.keys(attributeValues);

    return variants.find((variant) =>
      attributeKeys.every(
        (key) => variant.attributes[key] === attributeValues[key]
      )
    );
  };

  // Handle attribute selection change
  const handleAttributeChange = (attributeName: string, value: string) => {
    const newAttributes = {
      ...selectedAttributeValues,
      [attributeName]: value,
    };

    const variant = findVariantByAttributes(newAttributes);
    if (variant) {
      onVariantChange(variant._id);
    }
  };

  // Format price in VND
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="product-variant-selector bg-gray-50 p-8 border border-amber-100 shadow-sm rounded-sm mb-12">
      <h3 className="text-xl font-serif font-medium text-gray-900 mb-6 pb-3 border-b border-amber-200 relative">
        {t("products.chooseOptions")}
        <span className="absolute bottom-0 left-0 w-1/4 h-px bg-gradient-to-r from-amber-400 to-amber-600"></span>
      </h3>

      <div className="space-y-8">
        {attributeOptions.map(({ name, values }) => (
          <div key={name} className="variant-option">
            <h4 className="text-sm font-medium text-gray-800 mb-4 uppercase tracking-wider">
              {name}
            </h4>
            <div className="flex flex-wrap gap-3">
              {values.map((value) => {
                // Check if this attribute value combination would be valid
                const isSelectable = !!findVariantByAttributes({
                  ...selectedAttributeValues,
                  [name]: value,
                });

                // Check if this attribute value is currently selected
                const isSelected = selectedAttributeValues[name] === value;

                // Get variant with this attribute value to show price
                const variantWithThisValue = variants.find(
                  (variant) => variant.attributes[name] === value
                );

                // Determine if this is a color option
                const isColorOption =
                  name.toLowerCase().includes("màu") ||
                  name.toLowerCase().includes("color") ||
                  name.toLowerCase().includes("colour");

                // For color options, create a color swatch
                if (isColorOption) {
                  // Map common color names to their hex codes
                  const getColorHex = (colorName: string) => {
                    const colorMap: Record<string, string> = {
                      đen: "#000000",
                      trắng: "#FFFFFF",
                      "trắng ngà": "#FFFFF0",
                      đỏ: "#DC2626",
                      xanh: "#2563EB",
                      "xanh navy": "#1E3A8A",
                      nâu: "#92400E",
                      vàng: "#F59E0B",
                      xám: "#6B7280",
                      hồng: "#EC4899",
                      tím: "#8B5CF6",
                      cam: "#F97316",
                      "xanh lá": "#10B981",
                      "đỏ burgundy": "#9F1239",
                      black: "#000000",
                      white: "#FFFFFF",
                      ivory: "#FFFFF0",
                      red: "#DC2626",
                      blue: "#2563EB",
                      navy: "#1E3A8A",
                      brown: "#92400E",
                      yellow: "#F59E0B",
                      gray: "#6B7280",
                      pink: "#EC4899",
                      purple: "#8B5CF6",
                      orange: "#F97316",
                      green: "#10B981",
                      burgundy: "#9F1239",
                    };

                    // Try to match with the map, fallback to a default color
                    const lowerCaseColor = colorName.toLowerCase();
                    for (const [key, hex] of Object.entries(colorMap)) {
                      if (lowerCaseColor.includes(key)) {
                        return hex;
                      }
                    }
                    return "#CBD5E1"; // Default gray if color not found
                  };

                  return (
                    <button
                      key={value}
                      onClick={() =>
                        isSelectable && handleAttributeChange(name, value)
                      }
                      disabled={!isSelectable}
                      className={`relative transition-all duration-300 ${
                        isSelectable
                          ? "cursor-pointer"
                          : "cursor-not-allowed opacity-40"
                      }`}
                      title={value}
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isSelected
                            ? "ring-2 ring-offset-2 ring-amber-700"
                            : ""
                        }`}
                      >
                        <span
                          className="block w-10 h-10 rounded-full border border-gray-300 shadow-sm"
                          style={{ backgroundColor: getColorHex(value) }}
                        ></span>
                      </div>
                      <span className="block text-center text-xs mt-1 font-medium text-gray-700">
                        {value}
                      </span>
                    </button>
                  );
                }

                // For non-color options, use sophisticated buttons
                return (
                  <button
                    key={value}
                    onClick={() =>
                      isSelectable && handleAttributeChange(name, value)
                    }
                    disabled={!isSelectable}
                    className={`relative transition-all duration-300 overflow-hidden group ${
                      isSelected
                        ? "border-2 border-amber-800 bg-amber-50 text-amber-900"
                        : isSelectable
                        ? "border border-gray-300 hover:border-amber-400 bg-white text-gray-800"
                        : "border border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                    } px-5 py-3 rounded-sm ${
                      isSelected ? "shadow-md" : "hover:shadow-md"
                    }`}
                  >
                    <div className="relative z-10">
                      <span className="block font-medium">{value}</span>
                      {variantWithThisValue && (
                        <span className="text-xs text-gray-500 mt-1">
                          {formatPrice(variantWithThisValue.price)}
                        </span>
                      )}
                    </div>

                    {isSelectable && !isSelected && (
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-50 to-amber-100 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out"></div>
                    )}

                    {isSelected && (
                      <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-amber-800 shadow-md rotate-45"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductVariantSelector;
