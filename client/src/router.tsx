import type { RouteObject } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CategoryDetailPage from "./pages/CategoryDetailPage";
import ApiTestPage from "./pages/ApiTestPage";
import AuthPage from "./pages/AuthPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ProfilePage from "./pages/ProfilePage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";

// Admin imports
import AdminOrderDetailsPage from "./pages/admin/AdminOrderDetailsPage";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminUserEditPage from "./pages/admin/AdminUserEditPage";
import AdminUserCreatePage from "./pages/admin/AdminUserCreatePage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminProductEditPage from "./pages/admin/AdminProductEditPage";
import AdminProductNewPage from "./pages/admin/AdminProductNewPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "products",
        children: [
          {
            index: true,
            element: <ProductsPage />,
          },
          {
            path: ":slug",
            element: <ProductDetailPage />,
          },
          {
            path: "id/:id",
            element: <ProductDetailPage />,
          },
        ],
      },
      {
        path: "categories",
        children: [
          {
            path: ":slug",
            element: <CategoryDetailPage />,
          },
        ],
      },
      {
        path: "cart",
        element: <CartPage />,
      },
      {
        path: "api-test",
        element: <ApiTestPage />,
      },
      {
        // Public routes that redirect authenticated users to home
        element: <ProtectedRoute requireAuth={false} redirectPath="/" />,
        children: [
          {
            path: "auth",
            element: <AuthPage />,
          },
        ],
      },
      {
        // Protected routes that require authentication
        element: <ProtectedRoute requireAuth={true} redirectPath="/auth" />,
        children: [
          {
            path: "profile",
            element: <ProfilePage />,
          },
          {
            path: "checkout",
            element: <CheckoutPage />,
          },
          {
            path: "order-confirmation",
            element: <OrderConfirmationPage />,
          },
          // Add other protected routes here
        ],
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
  // Admin routes
  {
    path: "/admin",
    element: (
      <ProtectedRoute
        requireAuth={true}
        requireAdmin={true}
        redirectPath="/auth"
      >
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboardPage />,
      },
      {
        path: "users",
        children: [
          {
            index: true,
            element: <AdminUsersPage />,
          },
          {
            path: "new",
            element: <AdminUserCreatePage />,
          },
          {
            path: ":id",
            element: <AdminUserEditPage />,
          },
        ],
      },
      {
        path: "products",
        children: [
          {
            index: true,
            element: <AdminProductsPage />,
          },
          {
            path: "new",
            element: <AdminProductNewPage />,
          },
          {
            path: ":productId",
            element: <AdminProductEditPage />,
          },
        ],
      },
      {
        path: "orders",
        children: [
          {
            index: true,
            element: <AdminOrdersPage />,
          },
          {
            path: "details/:id",
            element: <AdminOrderDetailsPage />,
          },
        ],
      },
    ],
  },
];

export default routes;
