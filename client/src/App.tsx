import { BrowserRouter, useRoutes } from "react-router-dom";
import routes from "./router";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#FFFBEB",
                color: "#92400E",
                border: "1px solid #FCD34D",
              },
              success: {
                iconTheme: {
                  primary: "#92400E",
                  secondary: "#FFFBEB",
                },
              },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

function AppRoutes() {
  const element = useRoutes(routes);
  return element;
}

export default App;
