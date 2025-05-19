import { Outlet } from "react-router-dom";
import { AdminSidebar } from "../components/admin/layout/AdminSidebar";
import { AdminHeader } from "../components/admin/layout/AdminHeader";

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
