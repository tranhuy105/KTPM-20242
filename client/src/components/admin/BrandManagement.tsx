import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Textarea } from "../ui/textarea";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { useToast } from "../ui/use-toast";
import brandApi from "../../api/brandApi";
import type { Brand } from "../../types";
import { ImageUpload } from "./ImageUpload";
import type { ProductImage } from "../../types";

// Define the form schema for brand creation/editing
const brandFormSchema = z.object({
  name: z.string().min(2, "Brand name must be at least 2 characters"),
  description: z.string().optional(),
  website: z
    .string()
    .url("Please enter a valid URL")
    .or(z.string().length(0))
    .optional(),
  isActive: z.boolean().default(true),
  logo: z.string().optional(),
  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional(),
});

type BrandFormValues = z.infer<typeof brandFormSchema>;

const BrandManagement = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
  });
  const { toast } = useToast();

  // Setup form with zod resolver
  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      name: "",
      description: "",
      website: "",
      isActive: true,
      seo: {
        title: "",
        description: "",
        keywords: [],
      },
    },
  });

  // Load brands on component mount and when pagination changes
  useEffect(() => {
    fetchBrands();
  }, [pagination.currentPage]);

  const fetchBrands = async () => {
    setIsLoading(true);
    try {
      const response = await brandApi.getAllBrands({
        page: pagination.currentPage,
        limit: pagination.limit,
      });
      setBrands(response.brands);
      setPagination({
        currentPage: response.pagination.currentPage,
        totalPages: response.pagination.totalPages,
        limit: response.pagination.limit,
      });
    } catch (error) {
      console.error("Error fetching brands:", error);
      toast({
        title: "Error",
        description: "Failed to load brands. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBrand = () => {
    setSelectedBrand(null);
    form.reset({
      name: "",
      description: "",
      website: "",
      isActive: true,
      seo: {
        title: "",
        description: "",
        keywords: [],
      },
    });
    setIsDialogOpen(true);
  };

  const handleEditBrand = (brand: Brand) => {
    setSelectedBrand(brand);
    form.reset({
      name: brand.name,
      description: brand.description || "",
      website: brand.website || "",
      isActive: brand.isActive ?? true,
      logo: brand.logo,
      seo: brand.seo || {
        title: "",
        description: "",
        keywords: [],
      },
    });
    setIsDialogOpen(true);
  };

  const handleDeleteBrand = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteBrand = async () => {
    if (!selectedBrand) return;

    setIsLoading(true);
    try {
      await brandApi.deleteBrand(selectedBrand._id);
      toast({
        title: "Success",
        description: `Brand "${selectedBrand.name}" has been deleted.`,
      });
      fetchBrands();
    } catch (error) {
      console.error("Error deleting brand:", error);
      toast({
        title: "Error",
        description: "Failed to delete brand. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const onSubmit = async (data: BrandFormValues) => {
    setIsLoading(true);
    try {
      if (selectedBrand) {
        // Update existing brand
        await brandApi.updateBrand(selectedBrand._id, data);
        toast({
          title: "Success",
          description: `Brand "${data.name}" has been updated.`,
        });
      } else {
        // Create new brand
        await brandApi.createBrand(data);
        toast({
          title: "Success",
          description: `Brand "${data.name}" has been created.`,
        });
      }
      setIsDialogOpen(false);
      fetchBrands();
    } catch (error) {
      console.error("Error saving brand:", error);
      toast({
        title: "Error",
        description: "Failed to save brand. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (images: ProductImage[]) => {
    if (images.length > 0) {
      form.setValue("logo", images[0].url);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Brands</h2>
        <Button onClick={handleCreateBrand}>
          <Plus className="h-4 w-4 mr-2" />
          Add Brand
        </Button>
      </div>

      {isLoading && brands.length === 0 ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : brands.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No brands found. Create your first brand to get started.
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Logo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand) => (
                <TableRow key={brand._id}>
                  <TableCell>
                    {brand.logo ? (
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="h-10 w-10 object-contain"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-muted flex items-center justify-center rounded">
                        <span className="text-xs text-muted-foreground">
                          No logo
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell>{brand.slug}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        brand.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {brand.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditBrand(brand)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteBrand(brand)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Create/Edit Brand Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedBrand ? "Edit Brand" : "Create New Brand"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit as any)}
              className="space-y-4"
            >
              <div className="grid gap-4 py-2">
                <FormField
                  control={form.control as any}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter brand name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter brand description"
                          {...field}
                          value={field.value || ""}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Brand Logo</FormLabel>
                  <div className="flex items-center gap-4 mt-2">
                    {form.watch("logo") && (
                      <div className="flex-shrink-0">
                        <img
                          src={form.watch("logo")}
                          alt="Brand logo preview"
                          className="h-16 w-16 object-contain border rounded"
                        />
                      </div>
                    )}
                    <ImageUpload
                      onImagesUpload={handleImageUpload}
                      maxImages={1}
                      compact={true}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control as any}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Only active brands will be visible to customers
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {selectedBrand ? "Update Brand" : "Create Brand"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the brand "{selectedBrand?.name}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteBrand}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BrandManagement;
