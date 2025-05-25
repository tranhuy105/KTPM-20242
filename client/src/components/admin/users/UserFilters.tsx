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
import type { UserFilters as UserFiltersType } from "../../../types";

interface UserFiltersProps {
  filters: UserFiltersType;
  onFilterChange: (filters: UserFiltersType) => void;
}

export function UserFilters({ filters, onFilterChange }: UserFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || "");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ ...filters, search: searchValue });
  };

  const handleRoleChange = (value: string) => {
    onFilterChange({ ...filters, role: value });
  };

  const handleStatusChange = (value: string) => {
    onFilterChange({
      ...filters,
      isActive: value === "all" ? undefined : value === "active",
    });
  };

  const handleClearFilters = () => {
    setSearchValue("");
    onFilterChange({
      page: 1,
      limit: filters.limit,
    });
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end">
      <form onSubmit={handleSearchSubmit} className="flex-1">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-8 w-full"
            value={searchValue}
            onChange={handleSearchChange}
          />
        </div>
      </form>

      <div className="flex flex-col sm:flex-row gap-2">
        <Select value={filters.role || "all"} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={
            filters.isActive === undefined
              ? "all"
              : filters.isActive
              ? "active"
              : "inactive"
          }
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
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
