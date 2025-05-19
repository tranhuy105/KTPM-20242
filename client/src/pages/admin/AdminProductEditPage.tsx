import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button";
import ProductForm from "../../components/admin/products/ProductForm";
import productApi from "../../api/productApi";
import toast from "react-hot-toast";
import type { Product } from "../../types";

const AdminProductEditPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await productApi.getProductByIdAdmin(productId);
        setProduct(data);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(
          "Failed to load product. Please try again or go back to the products list."
        );
        toast.error("Failed to load product");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading product...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/products")}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </div>
        <div className="bg-destructive/10 p-4 rounded-md text-destructive">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/products")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
        <h1 className="text-3xl font-bold">
          {product ? "Edit Product" : "New Product"}
        </h1>
      </div>

      <ProductForm product={product || undefined} isEdit={!!productId} />
    </div>
  );
};

export default AdminProductEditPage;
