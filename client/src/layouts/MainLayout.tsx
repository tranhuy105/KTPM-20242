import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const MainLayout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main
        className={`flex-grow ${
          isHomePage ? "" : "container mx-auto px-4 py-8"
        }`}
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
