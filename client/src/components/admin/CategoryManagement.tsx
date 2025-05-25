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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
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
import categoryApi from "../../api/categoryApi";
import type { Category, CategoryFilters } from "../../types";
import { ImageUpload } from "./ImageUpload";
import type { ProductImage } from "../../types";

// Define the form schema for category creation/editing
const categoryFormSchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  description: z.string().optional(),
  parent: z.string().optional(),
  image: z.string().optional(),
  isActive: z.boolean().default(true),
  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

const CategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });
  const { toast } = useToast();

  // Setup form with zod resolver
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
      parent: "",
      isActive: true,
      seo: {
        title: "",
        description: "",
        keywords: [],
      },
    },
  });

  // Load categories on component mount and when pagination changes
  useEffect(() => {
    fetchCategories();
    fetchParentCategories();
  }, [pagination.currentPage]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const filters: CategoryFilters = {
        page: pagination.currentPage,
        limit: pagination.limit,
      };

      const response = await categoryApi.getAllCategories(filters);

      if (response.data) {
        setCategories(response.data);
        setPagination({
          totalCount: response.pagination.totalCount,
          totalPages: response.pagination.totalPages,
          currentPage: response.pagination.currentPage,
          limit: response.pagination.limit,
        });
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error",
        description: "Failed to load categories. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchParentCategories = async () => {
    try {
      // Get all potential parent categories
      const response = await categoryApi.getAllCategories({
        limit: 100, // Get a larger number for selection
      });

      if (response.data) {
        setParentCategories(response.data);
      }
    } catch (error) {
      console.error("Error fetching parent categories:", error);
    }
  };

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    form.reset({
      name: "",
      description: "",
      parent: "",
      isActive: true,
      seo: {
        title: "",
        description: "",
        keywords: [],
      },
    });
    setIsDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    form.reset({
      name: category.name,
      description: category.description || "",
      parent: category.parent?._id || "",
      image: category.image,
      isActive: category.isActive ?? true,
      seo: category.seo || {
        title: "",
        description: "",
        keywords: [],
      },
    });
    setIsDialogOpen(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteCategory = async () => {
    if (!selectedCategory) return;

    setIsLoading(true);
    try {
      await categoryApi.deleteCategory(selectedCategory._id);
      toast({
        title: "Success",
        description: `Category "${selectedCategory.name}" has been deleted.`,
      });
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const onSubmit = async (data: CategoryFormValues) => {
    setIsLoading(true);
    try {
      // Format the data for API
      const categoryData: Partial<Category> = {
        ...data,
        // Only include parent if it's not empty and not the "none" placeholder
        parent:
          data.parent && data.parent !== "" && data.parent !== "none"
            ? data.parent
            : undefined,
      };

      if (selectedCategory) {
        // Update existing category
        await categoryApi.updateCategory(selectedCategory._id, categoryData);
        toast({
          title: "Success",
          description: `Category "${data.name}" has been updated.`,
        });
      } else {
        // Create new category
        await categoryApi.createCategory(categoryData);
        toast({
          title: "Success",
          description: `Category "${data.name}" has been created.`,
        });
      }
      setIsDialogOpen(false);
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      toast({
        title: "Error",
        description: "Failed to save category. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (images: ProductImage[]) => {
    if (images.length > 0) {
      form.setValue("image", images[0].url);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  // Helper to display category ancestors as breadcrumbs
  const getCategoryPath = (category: Category) => {
    if (!category.ancestors || category.ancestors.length === 0) {
      return "Root";
    }

    return category.ancestors.map((a) => a.name).join(" > ");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Categories</h2>
        <Button onClick={handleCreateCategory}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {isLoading && categories.length === 0 ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No categories found. Create your first category to get started.
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Parent Path</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category._id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {getCategoryPath(category)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        category.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {category.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteCategory(category)}
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

      {/* Create/Edit Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? "Edit Category" : "Create New Category"}
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
                      <FormLabel>Category Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter category name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="parent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a parent category (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">
                            None (Root Category)
                          </SelectItem>
                          {parentCategories
                            .filter(
                              (c) =>
                                // Prevent circular reference
                                !selectedCategory ||
                                c._id !== selectedCategory._id
                            )
                            .map((category) => (
                              <SelectItem
                                key={category._id}
                                value={category._id}
                              >
                                {category.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
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
                          placeholder="Enter category description"
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
                  <FormLabel>Category Image</FormLabel>
                  <div className="flex items-center gap-4 mt-2">
                    {form.watch("image") && (
                      <div className="flex-shrink-0">
                        <img
                          src={form.watch("image")}
                          alt="Category image preview"
                          className="h-16 w-16 object-cover border rounded"
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
                          Only active categories will be visible to customers
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
                  {selectedCategory ? "Update Category" : "Create Category"}
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
              Are you sure you want to delete the category "
              {selectedCategory?.name}"? This action cannot be undone and may
              affect products associated with this category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCategory}
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

export default CategoryManagement;
