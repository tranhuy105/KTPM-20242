// @ts-nocheck

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Checkbox } from "../../ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Card, CardContent } from "../../ui/card";
import userApi from "../../../api/userApi";
import type { User } from "../../../types";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

// Create a dynamic schema based on whether we're in edit mode
const createFormSchema = (isEdit: boolean) =>
  z.object({
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    password: isEdit
      ? z
          .string()
          .min(6, { message: "Password must be at least 6 characters" })
          .optional()
          .or(z.literal(""))
      : z
          .string()
          .min(6, { message: "Password must be at least 6 characters" }),
    role: z.enum(["customer", "admin"]),
    isActive: z.boolean().default(true),
    isVerified: z.boolean().default(false),
  });

interface UserFormProps {
  user?: User;
  isEdit?: boolean;
}

const UserForm = ({ user, isEdit = false }: UserFormProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Get the schema based on whether we're editing
  const formSchema = createFormSchema(isEdit);

  // Type for form values based on the schema
  type FormValues = z.infer<typeof formSchema>;

  // Initialize form with zod resolver
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      password: "",
      role: (user?.role as "customer" | "admin") || "customer",
      isActive: user?.isActive ?? true,
      isVerified: user?.isVerified ?? false,
    },
  });

  // Submit handler
  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      if (isEdit && user?._id) {
        // Remove password if it's empty (don't update password)
        if (!values.password) {
          const { password: _password, ...userData } = values;
          await userApi.updateUser(user._id, userData);
        } else {
          await userApi.updateUser(user._id, values);
        }
        toast.success("User updated successfully");
      } else {
        // Create new user
        await userApi.createUser(values);
        toast.success("User created successfully");
      }
      navigate("/admin/users");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save user";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Doe"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {isEdit
                        ? "New Password (leave blank to keep current)"
                        : "Password"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={isEdit ? "••••••••" : "Enter password"}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select user role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col space-y-4">
              <FormField
                control={form.control}
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
                        Active users can log in and use the platform.
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isVerified"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Verified</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Mark the user as having a verified email address.
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate("/admin/users")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Update User" : "Create User"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default UserForm;
