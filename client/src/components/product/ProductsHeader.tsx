import { useTranslation } from "react-i18next";
import { Filter, Grid, List } from "lucide-react";

interface ProductsHeaderProps {
  totalProducts: number;
  onToggleFilters: () => void;
  onViewChange: (view: "grid" | "list") => void;
  currentView: "grid" | "list";
  showMobileFilters: boolean;
}

const ProductsHeader = ({
  totalProducts,
  onToggleFilters,
  onViewChange,
  currentView,
  showMobileFilters,
}: ProductsHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 space-y-4 md:space-y-0">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t("products.title")}
        </h1>
        <p className="text-gray-500">
          {totalProducts} {t("products.itemsFound")}
        </p>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleFilters}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg border md:hidden ${
            showMobileFilters
              ? "bg-amber-50 text-amber-800 border-amber-300"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          <Filter className="w-4 h-4" />
          <span>{t("products.filters")}</span>
        </button>

        <div className="hidden md:flex items-center bg-white border border-gray-300 rounded-lg p-1">
          <button
            onClick={() => onViewChange("grid")}
            className={`p-2 rounded-md ${
              currentView === "grid"
                ? "bg-amber-100 text-amber-800"
                : "text-gray-500 hover:bg-gray-100"
            }`}
            aria-label={t("products.gridView")}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => onViewChange("list")}
            className={`p-2 rounded-md ${
              currentView === "list"
                ? "bg-amber-100 text-amber-800"
                : "text-gray-500 hover:bg-gray-100"
            }`}
            aria-label={t("products.listView")}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductsHeader;
