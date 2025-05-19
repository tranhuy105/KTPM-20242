import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { ProductsTable } from "../../components/admin/products/ProductsTable";
import { ProductFilters } from "../../components/admin/products/ProductFilters";
import productApi from "../../api/productApi";
import toast from "react-hot-toast";
import type {
  Product,
  ProductFilters as ProductFiltersType,
} from "../../types";

const AdminProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFiltersType>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [pagination, setPagination] = useState({
    totalCount: 0,
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Fetch products with current filters
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // Flatten filters object for API call
        const apiFilters = {
          page: filters.page,
          limit: filters.limit,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
          ...filters.filters, // Spread nested filters to top level
        };

        // Use the admin-specific endpoint
        const response = await productApi.getAdminProducts(apiFilters);
        setProducts(response.products);
        setPagination({
          totalCount: response.pagination.totalCount,
          currentPage: response.pagination.currentPage,
          totalPages: response.pagination.totalPages,
          hasNextPage: response.pagination.hasNextPage,
          hasPrevPage: response.pagination.hasPrevPage,
        });
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to load products");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (newFilters: ProductFiltersType) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  // Handle product deletion
  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await productApi.deleteProduct(productId);
      setProducts(products.filter((product) => product._id !== productId));
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  // Handle toggling product published status
  const handleTogglePublished = async (
    productId: string,
    isPublished: boolean
  ) => {
    try {
      await productApi.toggleProductPublished(productId, isPublished);
      setProducts(
        products.map((product) =>
          product._id === productId ? { ...product, isPublished } : product
        )
      );
      toast.success(
        `Product ${isPublished ? "published" : "unpublished"} successfully`
      );
    } catch (error) {
      console.error("Error updating product status:", error);
      toast.error("Failed to update product status");
    }
  };

  // Handle toggling product featured status
  const handleToggleFeatured = async (
    productId: string,
    isFeatured: boolean
  ) => {
    try {
      await productApi.toggleProductFeatured(productId, isFeatured);
      setProducts(
        products.map((product) =>
          product._id === productId ? { ...product, isFeatured } : product
        )
      );
      toast.success(
        `Product ${
          isFeatured ? "marked as featured" : "removed from featured"
        } successfully`
      );
    } catch (error) {
      console.error("Error updating featured status:", error);
      toast.error("Failed to update featured status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products Management</h1>
        <Button onClick={() => navigate("/admin/products/new")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            Manage your product catalog, inventory, and visibility settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ProductFilters
              filters={filters}
              onFilterChange={handleFilterChange}
            />

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : products && products.length > 0 ? (
              <ProductsTable
                products={products}
                onDeleteProduct={handleDeleteProduct}
                onTogglePublished={handleTogglePublished}
                onToggleFeatured={handleToggleFeatured}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No products found. Try adjusting your filters.
              </div>
            )}

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {products.length} of {pagination.totalCount} products
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPrevPage}
                  onClick={() =>
                    setFilters({ ...filters, page: filters.page! - 1 })
                  }
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNextPage}
                  onClick={() =>
                    setFilters({ ...filters, page: filters.page! + 1 })
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProductsPage;
