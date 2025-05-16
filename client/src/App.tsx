import { BrowserRouter, useRoutes } from "react-router-dom";
import routes from "./router";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

function AppRoutes() {
  const element = useRoutes(routes);
  return element;
}

export default App;
