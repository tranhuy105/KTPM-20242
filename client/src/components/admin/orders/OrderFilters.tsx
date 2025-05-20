import { useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Search, X } from "lucide-react";
import type { OrderFilters as OrderFiltersType } from "../../../types";

interface OrderFiltersProps {
  filters: OrderFiltersType;
  onFilterChange: (filters: OrderFiltersType) => void;
}

export function OrderFilters({ filters, onFilterChange }: OrderFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || "");

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ ...filters, search: searchValue, page: 1 });
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  // Handle status filter change
  const handleStatusChange = (value: string) => {
    if (value === "all") {
      onFilterChange({ ...filters, status: undefined, page: 1 });
    } else {
      onFilterChange({ ...filters, status: value, page: 1 });
    }
  };

  // Handle payment status filter change
  const handlePaymentStatusChange = (value: string) => {
    if (value === "all") {
      onFilterChange({ ...filters, paymentStatus: undefined, page: 1 });
    } else {
      onFilterChange({ ...filters, paymentStatus: value, page: 1 });
    }
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    if (value === "newest") {
      onFilterChange({
        ...filters,
        sortBy: "createdAt",
        sortOrder: "desc",
        page: 1,
      });
    } else if (value === "oldest") {
      onFilterChange({
        ...filters,
        sortBy: "createdAt",
        sortOrder: "asc",
        page: 1,
      });
    } else if (value === "totalHighest") {
      onFilterChange({
        ...filters,
        sortBy: "totalAmount",
        sortOrder: "desc",
        page: 1,
      });
    } else if (value === "totalLowest") {
      onFilterChange({
        ...filters,
        sortBy: "totalAmount",
        sortOrder: "asc",
        page: 1,
      });
    }
  };

  // Get current sort value
  const getCurrentSortValue = () => {
    const { sortBy, sortOrder } = filters;

    if (sortBy === "createdAt" && sortOrder === "desc") return "newest";
    if (sortBy === "createdAt" && sortOrder === "asc") return "oldest";
    if (sortBy === "totalAmount" && sortOrder === "desc") return "totalHighest";
    if (sortBy === "totalAmount" && sortOrder === "asc") return "totalLowest";

    return "newest"; // Default
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchValue("");
    onFilterChange({
      page: 1,
      limit: filters.limit,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end">
      <form onSubmit={handleSearchSubmit} className="flex-1">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by order #, customer name, or email..."
            className="pl-8 w-full"
            value={searchValue}
            onChange={handleSearchChange}
          />
        </div>
      </form>

      <div className="flex flex-wrap gap-2">
        <Select value={getCurrentSortValue()} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="totalHighest">Total: High to Low</SelectItem>
            <SelectItem value="totalLowest">Total: Low to High</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status || "all"}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.paymentStatus || "all"}
          onValueChange={handlePaymentStatusChange}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Payment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payment Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={handleClearFilters}
          className="gap-1"
        >
          <X className="h-4 w-4" />
          Clear
        </Button>
      </div>
    </div>
  );
}
