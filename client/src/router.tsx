import type { RouteObject } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CategoriesPage from "./pages/CategoriesPage";
import CategoryDetailPage from "./pages/CategoryDetailPage";
import ApiTestPage from "./pages/ApiTestPage";
import AuthPage from "./pages/AuthPage";
import NotFoundPage from "./pages/NotFoundPage";

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
            index: true,
            element: <CategoriesPage />,
          },
          {
            path: ":slug",
            element: <CategoryDetailPage />,
          },
        ],
      },
      {
        path: "api-test",
        element: <ApiTestPage />,
      },
      {
        path: "auth",
        element: <AuthPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
];

export default routes;
