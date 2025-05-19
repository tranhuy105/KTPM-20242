import { NavLink, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  PackageCheck,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { Separator } from "../../ui/separator";

export function AdminSidebar() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return "AD";
  };

  return (
    <div className="w-64 h-full bg-white border-r border-border flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium leading-none">
              {user?.firstName} {user?.lastName}
            </h3>
            <p className="text-sm text-muted-foreground">
              {user?.role || "Admin"}
            </p>
          </div>
        </div>
      </div>

      <Separator />

      <nav className="flex-1 p-4">
        <div className="space-y-1">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              )
            }
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              )
            }
          >
            <Users className="h-4 w-4" />
            Users
          </NavLink>

          <NavLink
            to="/admin/products"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              )
            }
          >
            <ShoppingBag className="h-4 w-4" />
            Products
          </NavLink>

          <NavLink
            to="/admin/orders"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              )
            }
          >
            <PackageCheck className="h-4 w-4" />
            Orders
          </NavLink>
        </div>
      </nav>

      <div className="p-4 mt-auto">
        <Separator className="mb-4" />
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>

        <NavLink to="/">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground mt-2"
          >
            <ChevronRight className="mr-2 h-4 w-4" />
            Back to Site
          </Button>
        </NavLink>
      </div>
    </div>
  );
}
