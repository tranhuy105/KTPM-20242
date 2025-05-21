import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface OrderFiltersProps {
  status: string;
  onStatusChange: (status: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export function OrderFilters({
  status,
  onStatusChange,
  sortBy,
  onSortChange,
}: OrderFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder={t("orders.filterByStatus")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("orders.allStatuses")}</SelectItem>
          <SelectItem value="pending">{t("orders.statusPending")}</SelectItem>
          <SelectItem value="processing">
            {t("orders.statusProcessing")}
          </SelectItem>
          <SelectItem value="shipped">{t("orders.statusShipped")}</SelectItem>
          <SelectItem value="delivered">
            {t("orders.statusDelivered")}
          </SelectItem>
          <SelectItem value="cancelled">
            {t("orders.statusCancelled")}
          </SelectItem>
        </SelectContent>
      </Select>

      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t("orders.sortBy")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">{t("orders.sortNewest")}</SelectItem>
          <SelectItem value="oldest">{t("orders.sortOldest")}</SelectItem>
          <SelectItem value="totalHighest">
            {t("orders.sortTotalHighToLow")}
          </SelectItem>
          <SelectItem value="totalLowest">
            {t("orders.sortTotalLowToHigh")}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
