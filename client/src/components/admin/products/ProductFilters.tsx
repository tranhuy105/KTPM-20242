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
    } else if (value === "priceLow") {
      onFilterChange({
        ...filters,
        sortBy: "price",
        sortOrder: "asc",
        page: 1,
      });
    } else if (value === "priceHigh") {
      onFilterChange({
        ...filters,
        sortBy: "price",
        sortOrder: "desc",
        page: 1,
      });
    } else if (value === "stockLow") {
      onFilterChange({
        ...filters,
        sortBy: "inventoryQuantity",
        sortOrder: "asc",
        page: 1,
      });
    } else if (value === "stockHigh") {
      onFilterChange({
        ...filters,
        sortBy: "inventoryQuantity",
        sortOrder: "desc",
        page: 1,
      });
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

  // Get current sort value
  const getCurrentSortValue = () => {
    const { sortBy, sortOrder } = filters;

    if (sortBy === "createdAt" && sortOrder === "desc") return "newest";
    if (sortBy === "createdAt" && sortOrder === "asc") return "oldest";
    if (sortBy === "price" && sortOrder === "asc") return "priceLow";
    if (sortBy === "price" && sortOrder === "desc") return "priceHigh";
    if (sortBy === "inventoryQuantity" && sortOrder === "asc")
      return "stockLow";
    if (sortBy === "inventoryQuantity" && sortOrder === "desc")
      return "stockHigh";

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
        <Select value={getCurrentSortValue()} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="priceLow">Price: Low to High</SelectItem>
            <SelectItem value="priceHigh">Price: High to Low</SelectItem>
            <SelectItem value="stockLow">Stock: Low to High</SelectItem>
            <SelectItem value="stockHigh">Stock: High to Low</SelectItem>
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
