import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface SortOption {
    value: string;
    field: string;
    order: "asc" | "desc";
    label: string;
}

interface ProductSortProps {
    currentSort: string;
    onSortChange: (sort: string) => void;
}

const ProductSort = ({
    currentSort,
    onSortChange,
}: ProductSortProps) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const sortOptions: SortOption[] = [
        {
            value: "-createdAt",
            field: "createdAt",
            order: "desc",
            label: t("products.sort.newest"),
        },
        {
            value: "price",
            field: "price",
            order: "asc",
            label: t("products.sort.priceLowToHigh"),
        },
        {
            value: "-price",
            field: "price",
            order: "desc",
            label: t("products.sort.priceHighToLow"),
        },
        {
            value: "-averageRating",
            field: "averageRating",
            order: "desc",
            label: t("products.sort.topRated"),
        },
        {
            value: "name",
            field: "name",
            order: "asc",
            label: t("products.sort.nameAZ"),
        },
        {
            value: "-name",
            field: "name",
            order: "desc",
            label: t("products.sort.nameZA"),
        },
    ];

    const getCurrentSortLabel = () => {
        const option = sortOptions.find(
            (option) => option.value === currentSort
        );
        return option ? option.label : sortOptions[0].label;
    };

    const handleSortChange = (sort: string) => {
        onSortChange(sort);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
                <span className="text-sm font-medium text-gray-700">
                    {getCurrentSortLabel()}
                </span>
                <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                        isOpen ? "transform rotate-180" : ""
                    }`}
                />
            </button>

            {isOpen && (
                <div className="absolute right-0 z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="py-1">
                        {sortOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() =>
                                    handleSortChange(
                                        option.value
                                    )
                                }
                                className={`block w-full text-left px-4 py-2 text-sm ${
                                    currentSort ===
                                    option.value
                                        ? "bg-amber-50 text-amber-800 font-medium"
                                        : "text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductSort;
