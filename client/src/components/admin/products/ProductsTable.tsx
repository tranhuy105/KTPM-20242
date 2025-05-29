import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Badge } from "../../ui/badge";
import { Edit, MoreHorizontal, Trash, EyeOff, Eye, Star } from "lucide-react";
import type { Product } from "../../../types";
import { formatCurrency } from "../../../lib/utils";
interface ProductsTableProps {
  products: Product[];
  onDeleteProduct: (productId: string) => void;
  onTogglePublished: (productId: string, isPublished: boolean) => void;
  onToggleFeatured: (productId: string, isFeatured: boolean) => void;
}

export function ProductsTable({
  products,
  onDeleteProduct,
  onTogglePublished,
  onToggleFeatured,
}: ProductsTableProps) {
  const navigate = useNavigate();

  // Helper function to get product thumbnail
  const getProductThumbnail = (product: Product) => {
    const defaultImage = "/images/product-placeholder.png";
    if (!product.images || product.images.length === 0) {
      return defaultImage;
    }

    // Find the default image or use the first one
    const defaultImg = product.images.find((img) => img.isDefault);
    return defaultImg ? defaultImg.url : product.images[0].url;
  };

  // Helper function to display category name
  const getCategoryName = (product: Product) => {
    console.log(product.category);
    if (typeof product.category === "object") {
      return product.category.name;
    }
    return product.categoryName || "Uncategorized";
  };

  console.log(products);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product._id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-md bg-gray-50">
                    <img
                      src={getProductThumbnail(product)}
                      alt={product.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {product.brand && typeof product.brand === "object"
                        ? product.brand.name
                        : "No brand"}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{product.slug}</TableCell>
              <TableCell>{getCategoryName(product)}</TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">
                    {formatCurrency(product.price)}
                  </div>
                  {product.compareAtPrice && (
                    <div className="text-sm line-through text-muted-foreground">
                      {formatCurrency(product.compareAtPrice)}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {product.inventoryQuantity > 10 ? (
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800"
                  >
                    In Stock ({product.inventoryQuantity})
                  </Badge>
                ) : product.inventoryQuantity > 0 ? (
                  <Badge
                    variant="outline"
                    className="bg-amber-100 text-amber-800"
                  >
                    Low Stock ({product.inventoryQuantity})
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-100 text-red-800">
                    Out of Stock
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  {product.isFeatured && (
                    <Badge
                      variant="outline"
                      className="bg-purple-100 text-purple-800"
                    >
                      Featured
                    </Badge>
                  )}
                  {product.isPublished ? (
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800"
                    >
                      Published
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-gray-100 text-gray-800"
                    >
                      Draft
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => navigate(`/admin/products/${product._id}`)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        onTogglePublished(product._id, !product.isPublished)
                      }
                    >
                      {product.isPublished ? (
                        <>
                          <EyeOff className="mr-2 h-4 w-4" />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-4 w-4" />
                          Publish
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        onToggleFeatured(product._id, !product.isFeatured)
                      }
                    >
                      {product.isFeatured ? (
                        <>
                          <Star className="mr-2 h-4 w-4" />
                          Remove Featured
                        </>
                      ) : (
                        <>
                          <Star className="mr-2 h-4 w-4" />
                          Mark as Featured
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {/* tạm ẩn tính năng xóa  */}
                    {/* <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => onDeleteProduct(product._id)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem> */}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
