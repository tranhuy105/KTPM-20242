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
import type { ProductFilters as ProductFiltersType } from "../../../types";

interface ProductFiltersProps {
  filters: ProductFiltersType;
  onFilterChange: (filters: ProductFiltersType) => void;
}

export function ProductFilters({
  filters,
  onFilterChange,
}: ProductFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.filters?.search || "");

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter("search", searchValue);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  // Handle status filter change
  const handleStatusChange = (value: string) => {
    updateFilter("status", value === "all" ? undefined : value);
  };

  // Handle featured filter change
  const handleFeaturedChange = (value: string) => {
    if (value === "all") {
      updateFilter("isFeatured", undefined);
    } else {
      updateFilter("isFeatured", value === "featured");
    }
  };

  // Handle published filter change
  const handlePublishedChange = (value: string) => {
    if (value === "all") {
      updateFilter("isPublished", undefined);
    } else {
      updateFilter("isPublished", value === "published");
    }
  };

  // Helper function to update a single filter
  const updateFilter = (key: string, value: string | boolean | undefined) => {
    // Create new filters object with filter at top level
    const newFilters = {
      ...filters,
      filters: {
        ...filters.filters,
        [key]: value,
      },
      page: 1, // Reset to first page when filter changes
    };
    onFilterChange(newFilters);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchValue("");
    onFilterChange({
      page: 1,
      limit: filters.limit,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      filters: {}, // Clear all filters
    });
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end">
      <form onSubmit={handleSearchSubmit} className="flex-1">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-8 w-full"
            value={searchValue}
            onChange={handleSearchChange}
          />
        </div>
      </form>

      <div className="flex flex-wrap gap-2">
        <Select
          value={filters.filters?.status || "all"}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="discontinued">Discontinued</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={
            filters.filters?.isFeatured === undefined
              ? "all"
              : filters.filters?.isFeatured
              ? "featured"
              : "notFeatured"
          }
          onValueChange={handleFeaturedChange}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Featured" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="notFeatured">Not Featured</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={
            filters.filters?.isPublished === undefined
              ? "all"
              : filters.filters?.isPublished
              ? "published"
              : "draft"
          }
          onValueChange={handlePublishedChange}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Published" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
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
