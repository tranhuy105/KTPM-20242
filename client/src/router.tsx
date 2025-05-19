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
          // Add other protected routes here
        ],
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
];

export default routes;
