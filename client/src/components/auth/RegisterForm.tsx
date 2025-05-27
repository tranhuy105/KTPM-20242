import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import { useAuthContext } from "../../context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { Alert, AlertDescription } from "../../components/ui/alert";

// Schema matching server-side validation
const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, "Username is required")
      .min(3, "Username must be between 3 and 30 characters")
      .max(30, "Username must be between 3 and 30 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      )
      .transform((val) => val.trim()),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email format")
      .transform((val) => val.trim().toLowerCase()),
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters")
      .transform((val) => val.trim()),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    termsAccepted: z
      .boolean()
      .refine((val) => val, "You must accept the terms and conditions"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterForm = () => {
  const { register, error } = useAuthContext();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);

    try {
      await register({
        username: data.username,
        email: data.email,
        password: data.password,
      });
      // Redirect is handled by ProtectedRoute
    } catch {
      // Error is handled by auth context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">{t("auth.register.title")}</h2>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">
                  {t("auth.register.username")}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="text-gray-400" />
                    </div>
                    <Input
                      {...field}
                      type="text"
                      placeholder={t("auth.register.username")}
                      className="pl-10 focus:ring-2 focus:ring-black"
                      autoComplete="username"
                    />
                  </div>
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
                <FormLabel className="sr-only">
                  {t("auth.register.email")}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="text-gray-400" />
                    </div>
                    <Input
                      {...field}
                      type="email"
                      placeholder={t("auth.register.email")}
                      className="pl-10 focus:ring-2 focus:ring-black"
                      autoComplete="email"
                    />
                  </div>
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
                <FormLabel className="sr-only">
                  {t("auth.register.password")}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                    <Input
                      {...field}
                      type="password"
                      placeholder={t("auth.register.password")}
                      className="pl-10 focus:ring-2 focus:ring-black"
                      autoComplete="new-password"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">
                  {t("auth.register.confirmPassword")}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                    <Input
                      {...field}
                      type="password"
                      placeholder={t("auth.register.confirmPassword")}
                      className="pl-10 focus:ring-2 focus:ring-black"
                      autoComplete="new-password"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="termsAccepted"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm text-gray-600 font-normal">
                    {t("auth.register.termsAgreement")}{" "}
                    <a href="#" className="underline text-black">
                      {t("auth.register.termsAndConditions")}
                    </a>
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white hover:bg-gray-900"
          >
            {loading
              ? t("auth.register.creatingAccount")
              : t("auth.register.createAccount")}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default RegisterForm;