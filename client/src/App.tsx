import { BrowserRouter, useRoutes } from "react-router-dom";
import routes from "./router";

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

function AppRoutes() {
  const element = useRoutes(routes);
  return element;
}

export default App;
