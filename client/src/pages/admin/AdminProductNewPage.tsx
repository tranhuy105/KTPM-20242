import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button";
import ProductForm from "../../components/admin/products/ProductForm";

const AdminProductNewPage = () => {
  const navigate = useNavigate();

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
        <h1 className="text-3xl font-bold">New Product</h1>
      </div>

      <ProductForm isEdit={false} />
    </div>
  );
};

export default AdminProductNewPage;
